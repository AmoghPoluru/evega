import z from "zod";
import type Stripe from "stripe";

import { TRPCError } from "@trpc/server";

import { stripe } from "@/lib/stripe";
import { createCheckoutSessionWithConnect, isStripeAccountReady } from "@/lib/stripe-connect";
import {
  decrementStockForOrder,
  findMatchingVariant,
} from "@/lib/inventory/adjust-product-stock";
import type { ProductInventoryDoc } from "@/lib/inventory/types";
import { generateOrderNumber } from "@/lib/order-number";
import { Media } from "@/payload-types";
import { baseProcedure, createTRPCRouter, optionalAuthProcedure } from "@/trpc/init";
import {
  guestEmailSchema,
  guestShippingAddressSchema,
} from "@/modules/checkout/guest-checkout-schema";
import { resolveCheckoutContact } from "./resolve-checkout-contact";

export const checkoutRouter = createTRPCRouter({
  purchase: optionalAuthProcedure
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
        customerPhone: z.string().optional(), // Customer phone number for offline payments (logged-in users)
        guestEmail: guestEmailSchema.optional(),
        guestShippingAddress: guestShippingAddressSchema.optional(),
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

        // Find matching variant
        // Variants are stored in variantData JSON object: { variantData: { size: "M", color: "Red" }, stock: 10, price: 49.99 }
        let variant = null;
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          // Product has variants - we need to find a matching one
          // Check if cart item has variant information
          const hasVariantInfo = (cartItem.size && cartItem.size.trim() !== '') || 
                                 (cartItem.color && cartItem.color.trim() !== '');
          
          if (hasVariantInfo) {
            // Try to find exact match based on provided size/color
            // Variants store data in variantData JSON object
            variant = product.variants.find((v: any) => {
              const variantData = v.variantData || {};
              const sizeMatch = !cartItem.size || !cartItem.size.trim() || variantData.size === cartItem.size || variantData.blouseSize === cartItem.size;
              const colorMatch = !cartItem.color || !cartItem.color.trim() || variantData.color === cartItem.color;
              return sizeMatch && colorMatch;
            });
          }
          
          // If no variant found and product has variants, provide helpful error
          if (!variant) {
            // Determine what variant fields are available in the product
            const availableVariantFields: string[] = [];
            if (product.variants.length > 0) {
              const firstVariant = product.variants[0] as any;
              const variantData = firstVariant.variantData || {};
              if (variantData.size || variantData.blouseSize) availableVariantFields.push('size');
              if (variantData.color) availableVariantFields.push('color');
              if (variantData.material) availableVariantFields.push('material');
            }
            
            const missingFields = availableVariantFields.filter(field => {
              if (field === 'size') return !cartItem.size || !cartItem.size.trim();
              if (field === 'color') return !cartItem.color || !cartItem.color.trim();
              return true; // For other fields, assume missing
            });
            
            if (missingFields.length > 0) {
              throw new TRPCError({ 
                code: "BAD_REQUEST", 
                message: `Please select ${missingFields.join(' and ')} for ${product.name}` 
              });
            } else {
              // Variant info was provided but doesn't match any existing variant
              const providedInfo = [];
              if (cartItem.size) providedInfo.push(`size: ${cartItem.size}`);
              if (cartItem.color) providedInfo.push(`color: ${cartItem.color}`);
              throw new TRPCError({ 
                code: "BAD_REQUEST", 
                message: `Variant not found for ${product.name} with ${providedInfo.join(', ')}. Please select a valid variant combination.` 
              });
            }
          }
        }

        // Validate stock
        if (variant) {
          if (variant.stock < cartItem.quantity) {
            const variantData = (variant as any).variantData || {};
            const sizeDisplay = variantData.size || variantData.blouseSize || cartItem.size || '';
            const colorDisplay = variantData.color || cartItem.color || '';
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: `Not enough stock for ${product.name}${sizeDisplay ? ` (${sizeDisplay})` : ''}${colorDisplay ? ` - ${colorDisplay}` : ''}` 
            });
          }
        }

        // Price is determined by variant price if set, otherwise use base price
        const finalPrice = (variant && (variant as any)?.price !== undefined && (variant as any).price !== null)
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
        const contact = await resolveCheckoutContact(
          ctx.db,
          ctx.session?.user ?? null,
          {
            guestEmail: input.guestEmail,
            guestShippingAddress: input.guestShippingAddress,
            customerPhone: input.customerPhone,
          }
        );

        // Logged-in users enter phone in payment section; guests provide it in the address form
        if (!contact.isGuest && !input.customerPhone?.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Phone number is required for offline payments. The vendor will contact you at this number.",
          });
        }

        const shippingAddress = {
          ...contact.shippingAddress,
          phone: contact.customerPhone || contact.shippingAddress.phone,
        };

        // Create one order per product (matching webhook pattern)
        const createdOrders: string[] = [];
        const orderItems: Array<{ name: string; quantity: number; price: number }> = [];

        for (const cartItem of input.cartItems) {
          const product = products.docs.find((p: { id: string }) => p.id === cartItem.productId);
          if (!product) {
            throw new TRPCError({ code: "NOT_FOUND", message: `Product ${cartItem.productId} not found` });
          }

          const hasVariants =
            Array.isArray(product.variants) && product.variants.length > 0;
          const variant = hasVariants
            ? findMatchingVariant(
                product as ProductInventoryDoc,
                cartItem.size,
                cartItem.color,
              )
            : null;

          if (hasVariants && !variant) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Variant not found for ${product.name}. Please select a valid size and color.`,
            });
          }

          // Calculate final price
          const finalPrice =
            variant &&
            (variant as { price?: number | null }).price !== undefined &&
            (variant as { price?: number | null }).price !== null
              ? (variant as { price: number }).price
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

          await decrementStockForOrder(ctx.db, {
            productId: cartItem.productId,
            quantity: cartItem.quantity || 1,
            size: cartItem.size,
            color: cartItem.color,
            overrideAccess: true,
          });

          // Create order for this product
          const order = await ctx.db.create({
            collection: "orders",
            data: {
              orderNumber,
              name: orderName,
              ...(contact.userId ? { user: contact.userId } : {}),
              ...(contact.guestEmail ? { guestEmail: contact.guestEmail } : {}),
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
              inventoryAdjusted: "deducted",
              offlinePaymentContact: {
                phone: vendor.contactPhone || null,
                email: vendor.contactEmail || null,
                customerPhone: contact.customerPhone.trim(),
              },
              offlinePaymentNotes: vendor.offlinePaymentInstructions || null,
              shippingAddress,
            },
          });

          createdOrders.push(order.id);
          orderItems.push({
            name: product.name,
            quantity: cartItem.quantity || 1,
            price: itemTotal,
          });

          // Notify the owning vendor via WhatsApp (offline orders are created as pending,
          // so the Orders afterChange hook does not fire for payment_done).
          try {
            const { resolveVendorWhatsApp, notifyVendorNewOrder, resolveProductImageUrl } =
              await import("@/lib/whatsapp");
            const vendorWhatsApp = await resolveVendorWhatsApp(ctx.db, product);
            const imageUrl = await resolveProductImageUrl(ctx.db, product);
            await notifyVendorNewOrder(vendorWhatsApp, {
              orderNumber,
              productName: product.name || "Product",
              quantity: cartItem.quantity || 1,
              total: itemTotal,
              customerName: contact.customerName,
              orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/orders/${order.id}`,
              imageUrl,
            });
          } catch (whatsappError) {
            console.error("Failed to send vendor WhatsApp order notification:", whatsappError);
          }
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
            contact.customerEmail,
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
              contact.customerName,
              contact.customerPhone.trim(),
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
          guestEmail: contact.guestEmail,
        };
      }

      const contact = await resolveCheckoutContact(
        ctx.db,
        ctx.session?.user ?? null,
        {
          guestEmail: input.guestEmail,
          guestShippingAddress: input.guestShippingAddress,
          customerPhone: input.customerPhone,
        }
      );

      // Stripe payment flow (existing code)
      // Build success URL - include cartItems if it's a "Buy Now" purchase
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const successUrl = input.buyNow
        ? `${baseUrl}/checkout?success=true&buyNow=true&cartItems=${encodeURIComponent(JSON.stringify(input.cartItems))}`
        : `${baseUrl}/checkout?success=true`;

      // Create checkout session with Stripe Connect
      const stripeMetadata: Record<string, string> = {
        vendorId: vendorId,
        cartItems: JSON.stringify(input.cartItems),
        buyNow: input.buyNow.toString(),
        orderTotal: orderTotal.toString(),
        commission: commission.toString(),
        vendorPayout: vendorPayout.toString(),
      };

      if (contact.isGuest) {
        stripeMetadata.isGuest = "true";
        stripeMetadata.guestEmail = contact.guestEmail!;
        stripeMetadata.guestShippingAddress = JSON.stringify(contact.shippingAddress);
      } else {
        stripeMetadata.userId = contact.userId!;
      }

      const checkoutUrl = await createCheckoutSessionWithConnect(
        lineItems,
        vendor.stripeAccountId!,
        commission,
        successUrl,
        `${baseUrl}/checkout?cancel=true`,
        stripeMetadata,
        contact.customerEmail
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
