import z from "zod";
import type Stripe from "stripe";

import { TRPCError } from "@trpc/server";

import { stripe } from "@/lib/stripe";
import { createCheckoutSessionWithConnect, isStripeAccountReady } from "@/lib/stripe-connect";
import { generateOrderNumber } from "@/lib/order-number";
import { Media } from "@/payload-types";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const checkoutRouter = createTRPCRouter({
  purchase: protectedProcedure
    .input(
      z.object({
        cartItems: z.array(z.object({
          productId: z.string(),
          size: z.string().optional(),
          color: z.string().optional(),
          quantity: z.number().min(1).default(1),
          variantPrice: z.number().optional(), // Variant price (base + adjustment)
        })).min(1),
        paymentMethod: z.enum(["stripe", "offline"]).default("stripe"), // Payment method selection
        customerPhone: z.string().optional(), // Customer phone number for offline payments
        buyNow: z.boolean().optional().default(false), // Flag for "Buy Now" purchases
      })
    )
    .mutation(async ({ ctx, input }) => {
      const productIds = input.cartItems.map(item => item.productId);
      const products = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: productIds,
              }
            },
            {
              isArchived: {
                not_equals: true,
              },
            }
          ]
        }
      })

      if (products.totalDocs !== productIds.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Some products not found" });
      }

      // Validate all products are from the same vendor
      const vendors = new Set(
        products.docs
          .map((p: any) => {
            const vendor = p.vendor;
            return typeof vendor === "string" ? vendor : vendor?.id;
          })
          .filter(Boolean)
      );

      if (vendors.size === 0) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Products must have a vendor assigned" 
        });
      }

      if (vendors.size > 1) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "All items in cart must be from the same vendor. Please complete your current order or remove items from different vendors." 
        });
      }

      // Get vendor
      const vendorId = Array.from(vendors)[0] as string;
      const vendor = await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 0,
      });

      // Validate payment method availability
      const showStripe = vendor.stripeAccountId && (vendor.preferredPaymentMethod === "stripe" || vendor.preferredPaymentMethod === "both");
      const showOffline = vendor.preferredPaymentMethod === "offline" || vendor.preferredPaymentMethod === "both";

      if (input.paymentMethod === "stripe" && !showStripe) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stripe payment is not available for this vendor. Please select offline payment.",
        });
      }

      if (input.paymentMethod === "offline" && !showOffline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Offline payment is not available for this vendor. Please select Stripe payment.",
        });
      }

      // For Stripe payments, validate Stripe Connect account
      if (input.paymentMethod === "stripe") {
        if (!vendor.stripeAccountId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Vendor has not connected their Stripe account. Please contact the vendor or try again later.",
          });
        }

        const accountReady = await isStripeAccountReady(vendor.stripeAccountId);
        if (!accountReady) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Vendor's payment account is not ready. Please contact the vendor or try again later.",
          });
        }
      }

      // Calculate total and commission
      let orderTotal = 0;
      
      // Validate stock and build line items
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      
      for (const cartItem of input.cartItems) {
        const product = products.docs.find((p: { id: string }) => p.id === cartItem.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: `Product ${cartItem.productId} not found` });
        }

        // Find matching variant if size/color specified
        let variant = null;
        if (cartItem.size || cartItem.color) {
          variant = product.variants?.find((v: any) => {
            const sizeMatch = !cartItem.size || v.size === cartItem.size;
            const colorMatch = !cartItem.color || v.color === cartItem.color;
            return sizeMatch && colorMatch;
          });
        }

        // Validate stock
        if (variant) {
          if (variant.stock < cartItem.quantity) {
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: `Not enough stock for ${product.name}${cartItem.size ? ` (${cartItem.size})` : ''}${cartItem.color ? ` - ${cartItem.color}` : ''}` 
            });
          }
        } else if (product.variants && product.variants.length > 0) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: `Variant not found for ${product.name}` 
          });
        }

        // Price is determined by color only (sizes don't affect price)
        // Use color variant price if color is selected, otherwise use base price
        const finalPrice = (variant && cartItem.color && (variant as any)?.price !== undefined && (variant as any).price !== null)
          ? (variant as any).price
          : (cartItem.variantPrice ?? product.price);
        
        // Build product name with variant info
        let productName = product.name;
        if (cartItem.size) productName += ` (${cartItem.size})`;
        if (cartItem.color) productName += ` - ${cartItem.color}`;
        
        const itemTotal = finalPrice * cartItem.quantity;
        orderTotal += itemTotal;

        lineItems.push({
          quantity: cartItem.quantity,
          price_data: {
            unit_amount: Math.round(finalPrice * 100), // Stripe handles prices in cents
            currency: "usd",
            product_data: {
              name: productName,
              metadata: {
                id: product.id,
                name: product.name,
                price: finalPrice.toString(),
                size: cartItem.size || '',
                color: cartItem.color || '',
                quantity: cartItem.quantity.toString(),
              }
            }
          }
        });
      }

      // Calculate commission
      const commissionRate = vendor.commissionRate || parseFloat(process.env.PLATFORM_COMMISSION_RATE || "10");
      const commission = (orderTotal * commissionRate) / 100;
      const vendorPayout = orderTotal - commission;

      // Handle offline payment flow
      if (input.paymentMethod === "offline") {
        // Validate customer phone is provided for offline payments
        if (!input.customerPhone || !input.customerPhone.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Phone number is required for offline payments. The vendor will contact you at this number.",
          });
        }

        // Get user with shipping addresses
        const user = await ctx.db.findByID({
          collection: "users",
          id: ctx.session.user.id,
          depth: 0,
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Get default address or first address
        const userAddresses = (user.shippingAddresses || []) as any[];
        const defaultAddress = userAddresses.find((addr: any) => addr.isDefault) || userAddresses[0];

        if (!defaultAddress) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Shipping address is required. Please add a shipping address before placing your order.",
          });
        }

        // Map user's saved address to order format
        const shippingAddress: any = {
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone || undefined,
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipcode: defaultAddress.zipcode,
          country: "United States", // Default since addresses are US-focused
        };

        // Create one order per product (matching webhook pattern)
        const createdOrders: string[] = [];
        const orderItems: Array<{ name: string; quantity: number; price: number }> = [];

        for (const cartItem of input.cartItems) {
          const product = products.docs.find((p: { id: string }) => p.id === cartItem.productId);
          if (!product) {
            throw new TRPCError({ code: "NOT_FOUND", message: `Product ${cartItem.productId} not found` });
          }

          // Find matching variant
          let variant = null;
          if (cartItem.size || cartItem.color) {
            variant = product.variants?.find((v: any) => {
              const sizeMatch = !cartItem.size || v.size === cartItem.size;
              const colorMatch = !cartItem.color || v.color === cartItem.color;
              return sizeMatch && colorMatch;
            });
          }

          // Calculate final price
          const finalPrice = (variant && cartItem.color && (variant as any)?.price !== undefined && (variant as any).price !== null)
            ? (variant as any).price
            : (cartItem.variantPrice ?? product.price);

          const itemTotal = finalPrice * cartItem.quantity;

          // Generate order number
          const orderNumber = await generateOrderNumber();

          // Create order name
          const orderName = cartItem.size || cartItem.color
            ? `Order for ${product.name}${cartItem.size ? ` (${cartItem.size})` : ''}${cartItem.color ? ` - ${cartItem.color}` : ''}`
            : `Order for ${product.name}`;

          // Calculate commission for this item
          const itemCommission = (itemTotal * commissionRate) / 100;
          const itemVendorPayout = itemTotal - itemCommission;

          // Update variant stock if variant exists
          if (variant) {
            const newStock = Math.max(0, variant.stock - cartItem.quantity);
            const updatedVariants = (product.variants || []).map((v: any) => {
              if (
                (!cartItem.size || v.size === cartItem.size) &&
                (!cartItem.color || v.color === cartItem.color)
              ) {
                return { ...v, stock: newStock };
              }
              return v;
            });

            await ctx.db.update({
              collection: "products",
              id: cartItem.productId,
              data: { variants: updatedVariants },
            });
          }

          // Create order for this product
          const order = await ctx.db.create({
            collection: "orders",
            data: {
              orderNumber,
              name: orderName,
              user: ctx.session.user.id,
              vendor: vendorId,
              product: cartItem.productId,
              quantity: cartItem.quantity || 1,
              size: cartItem.size || undefined,
              color: cartItem.color || undefined,
              total: itemTotal,
              commission: itemCommission,
              commissionRate: commissionRate,
              vendorPayout: {
                amount: itemVendorPayout,
                commissionAmount: itemCommission,
                status: "pending",
              },
              status: "pending",
              paymentMethod: "offline",
              paymentStatus: "pending",
              offlinePaymentContact: {
                phone: vendor.contactPhone || null,
                email: vendor.contactEmail || null,
                customerPhone: input.customerPhone.trim(), // Store customer phone for vendor to contact
              },
              offlinePaymentNotes: vendor.offlinePaymentInstructions || null,
              shippingAddress: {
                ...shippingAddress,
                phone: input.customerPhone.trim(), // Also update shipping address phone with customer's contact number
              },
            },
          });

          createdOrders.push(order.id);
          orderItems.push({
            name: product.name,
            quantity: cartItem.quantity || 1,
            price: itemTotal,
          });
        }

        // Send email notifications (async, don't block)
        try {
          const { sendOfflinePaymentOrderConfirmation, sendVendorOfflinePaymentNotification } = await import("@/lib/email");
          
          // Send customer confirmation with first order number
          const firstOrder = await ctx.db.findByID({
            collection: "orders",
            id: createdOrders[0],
            depth: 0,
          });

          await sendOfflinePaymentOrderConfirmation(
            ctx.session.user.email || "",
            firstOrder.orderNumber,
            {
              phone: vendor.contactPhone || undefined,
              email: vendor.contactEmail || undefined,
            },
            orderTotal,
            orderItems
          );

          // Send vendor notification
          if (vendor.email) {
            await sendVendorOfflinePaymentNotification(
              vendor.email,
              firstOrder.orderNumber,
              ctx.session.user.name || ctx.session.user.email || "Customer",
              input.customerPhone.trim(),
              orderTotal,
              orderItems.length
            );
          }
        } catch (error) {
          console.error("Failed to send offline payment emails:", error);
          // Don't fail order creation if email fails
        }

        return { 
          orderId: createdOrders[0], // Return first order ID for redirect
          orderIds: createdOrders, // All order IDs
          paymentMethod: "offline" as const,
        };
      }

      // Stripe payment flow (existing code)
      // Build success URL - include cartItems if it's a "Buy Now" purchase
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const successUrl = input.buyNow
        ? `${baseUrl}/checkout?success=true&buyNow=true&cartItems=${encodeURIComponent(JSON.stringify(input.cartItems))}`
        : `${baseUrl}/checkout?success=true`;

      // Create checkout session with Stripe Connect
      const checkoutUrl = await createCheckoutSessionWithConnect(
        lineItems,
        vendor.stripeAccountId!,
        commission,
        successUrl,
        `${baseUrl}/checkout?cancel=true`,
        {
          userId: ctx.session.user.id,
          vendorId: vendorId,
          cartItems: JSON.stringify(input.cartItems),
          buyNow: input.buyNow.toString(),
          orderTotal: orderTotal.toString(),
          commission: commission.toString(),
          vendorPayout: vendorPayout.toString(),
        }
      );

      return { 
        url: checkoutUrl,
        paymentMethod: "stripe" as const,
      };
    })
  ,
  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // Populate "category", "image"
        where: {
          and: [
            {
              id: {
                in: input.ids,
              },
            },
            {
              isArchived: {
                not_equals: true,
              },
            },
          ],
        },
      });

      if (data.totalDocs !== input.ids.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Products not found" });
      }

      const totalPrice = data.docs.reduce((acc: number, product: { price: number | null | undefined }) => {
        const price = Number(product.price);
        return acc + (isNaN(price) ? 0 : price);
      }, 0);

      return {
        ...data,
        totalPrice: totalPrice,
        docs: data.docs.map((doc: { image?: any; [key: string]: any }) => ({
          ...doc,
          image: doc.image as Media | null,
        }))
      }
    }),
});
