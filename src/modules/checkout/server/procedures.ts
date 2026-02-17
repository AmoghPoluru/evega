import z from "zod";
import type Stripe from "stripe";

import { TRPCError } from "@trpc/server";

import { stripe } from "@/lib/stripe";
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

      // Validate stock and build line items
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      
      for (const cartItem of input.cartItems) {
        const product = products.docs.find(p => p.id === cartItem.productId);
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

      // Build success URL - include cartItems if it's a "Buy Now" purchase
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const successUrl = input.buyNow
        ? `${baseUrl}/checkout?success=true&buyNow=true&cartItems=${encodeURIComponent(JSON.stringify(input.cartItems))}`
        : `${baseUrl}/checkout?success=true`;

      const checkout = await stripe.checkout.sessions.create({
        customer_email: ctx.session.user.email,
        success_url: successUrl,
        cancel_url: `${baseUrl}/checkout?cancel=true`,
        mode: "payment",
        line_items: lineItems,
        invoice_creation: {
          enabled: true,
        },
        metadata: {
          userId: ctx.session.user.id,
          cartItems: JSON.stringify(input.cartItems),
          buyNow: input.buyNow.toString(), // Store buyNow flag in metadata
        }
      });

      if (!checkout.url) {
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to create checkout session" 
        });
      }

      return { url: checkout.url };
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

      const totalPrice = data.docs.reduce((acc, product) => {
        const price = Number(product.price);
        return acc + (isNaN(price) ? 0 : price);
      }, 0);

      return {
        ...data,
        totalPrice: totalPrice,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
        }))
      }
    }),
});
