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
        status: z.enum(["pending", "payment_done", "processing", "complete", "canceled", "refunded"]).optional(),
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

      // Filter by status if provided
      if (input?.status) {
        where.status = {
          equals: input.status,
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
        status: z.enum(["pending", "payment_done", "processing", "complete", "canceled", "refunded"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_LIMIT;
      const page = input?.cursor ?? 1;

      const where: any = {
        user: {
          equals: ctx.session.user.id,
        },
      };

      // Filter by status if provided
      if (input?.status) {
        where.status = {
          equals: input.status,
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

  getByOrderNumber: baseProcedure
    .input(
      z.object({
        orderNumber: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.find({
        collection: "orders",
        depth: 2,
        limit: 1,
        where: {
          orderNumber: {
            equals: input.orderNumber,
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

  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["pending", "payment_done", "processing", "complete", "canceled", "refunded"]),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is super admin
      const user = ctx.session.user;
      const isAdmin = user.roles?.includes("super-admin");

      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update order status",
        });
      }

      const order = await ctx.db.findByID({
        collection: "orders",
        id: input.orderId,
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Update order status
      const updatedOrder = await ctx.db.update({
        collection: "orders",
        id: input.orderId,
        data: {
          status: input.status,
        },
      });

      return {
        ...updatedOrder,
        user: updatedOrder.user as User | string,
        product: updatedOrder.product as Product | string,
      };
    }),

  updateTracking: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        trackingNumber: z.string(),
        carrier: z.enum(["usps", "fedex", "ups", "dhl", "other"]),
        estimatedDelivery: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is super admin
      const user = ctx.session.user;
      const isAdmin = user.roles?.includes("super-admin");

      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update tracking information",
        });
      }

      const order = await ctx.db.findByID({
        collection: "orders",
        id: input.orderId,
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Generate tracking URL based on carrier
      const trackingUrls: Record<string, string> = {
        usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${input.trackingNumber}`,
        fedex: `https://www.fedex.com/fedextrack/?trknbr=${input.trackingNumber}`,
        ups: `https://www.ups.com/track?tracknum=${input.trackingNumber}`,
        dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${input.trackingNumber}`,
        other: "",
      };

      const trackingUrl = trackingUrls[input.carrier] || "";

      // Update order with tracking information
      const updatedOrder = await ctx.db.update({
        collection: "orders",
        id: input.orderId,
        data: {
          trackingNumber: input.trackingNumber,
          carrier: input.carrier,
          trackingUrl: trackingUrl,
          estimatedDelivery: input.estimatedDelivery || undefined,
        },
      });

      return {
        ...updatedOrder,
        user: updatedOrder.user as User | string,
        product: updatedOrder.product as Product | string,
      };
    }),
});
