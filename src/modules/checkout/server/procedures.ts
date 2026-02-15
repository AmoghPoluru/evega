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
        productIds: z.array(z.string()).min(1),
        buyNow: z.boolean().optional().default(false), // Flag for "Buy Now" purchases
      })
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.productIds,
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

      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Products not found" });
      }

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        products.docs.map((product) => ({
          quantity: 1,
          price_data: {
            unit_amount: Math.round(product.price * 100), // Stripe handles prices in cents
            currency: "usd",
            product_data: {
              name: product.name,
              metadata: {
                id: product.id,
                name: product.name,
                price: product.price.toString(),
              }
            }
          }
        }));

      // Build success URL - include productIds if it's a "Buy Now" purchase
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const successUrl = input.buyNow
        ? `${baseUrl}/checkout?success=true&buyNow=true&productIds=${input.productIds.join(',')}`
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
          productIds: input.productIds.join(','),
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
