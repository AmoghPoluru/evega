import z from "zod";
import { TRPCError } from "@trpc/server";

import { Order, Product, User } from "@/payload-types";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { DEFAULT_LIMIT } from "@/constants";

export const ordersRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT).optional(),
        cursor: z.number().optional(),
        userId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_LIMIT;
      const page = input?.cursor ?? 1;

      const where: any = {};

      // Filter by user if provided
      if (input?.userId) {
        where.user = {
          equals: input.userId,
        };
      }

      const data = await ctx.db.find({
        collection: "orders",
        depth: 2, // Populate user and product relationships
        limit,
        page,
        where,
        sort: "-createdAt", // Most recent first
      });

      return {
        docs: data.docs.map((doc) => ({
          ...doc,
          user: doc.user as User | string,
          product: doc.product as Product | string,
        })),
        totalDocs: data.totalDocs,
        totalPages: data.totalPages,
        page: data.page,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
        nextPage: data.hasNextPage ? page + 1 : undefined,
        prevPage: data.hasPrevPage ? page - 1 : undefined,
      };
    }),

  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.findByID({
        collection: "orders",
        id: input.id,
        depth: 2, // Populate user and product relationships
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return {
        ...order,
        user: order.user as User | string,
        product: order.product as Product | string,
      };
    }),

  getByUser: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT).optional(),
        cursor: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_LIMIT;
      const page = input?.cursor ?? 1;

      const data = await ctx.db.find({
        collection: "orders",
        depth: 2, // Populate user and product relationships
        limit,
        page,
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
        sort: "-createdAt", // Most recent first
      });

      return {
        docs: data.docs.map((doc) => ({
          ...doc,
          user: doc.user as User | string,
          product: doc.product as Product | string,
        })),
        totalDocs: data.totalDocs,
        totalPages: data.totalPages,
        page: data.page,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
        nextPage: data.hasNextPage ? page + 1 : undefined,
        prevPage: data.hasPrevPage ? page - 1 : undefined,
      };
    }),

  getByCheckoutSession: baseProcedure
    .input(
      z.object({
        checkoutSessionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.find({
        collection: "orders",
        depth: 2,
        limit: 1,
        where: {
          stripeCheckoutSessionId: {
            equals: input.checkoutSessionId,
          },
        },
      });

      if (data.docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const order = data.docs[0];

      return {
        ...order,
        user: order.user as User | string,
        product: order.product as Product | string,
      };
    }),
});
