import z from "zod";
import { TRPCError } from "@trpc/server";

import { isAppAdmin } from "@/lib/access";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";

const relId = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "id" in value) {
    return String((value as { id: string | number }).id);
  }
  return null;
};

export const favoritesRouter = createTRPCRouter({
  add: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.find({
        collection: "favorites",
        limit: 1,
        depth: 0,
        where: {
          and: [
            { user: { equals: userId } },
            { product: { equals: input.productId } },
          ],
        },
      });

      if (existing.docs[0]) {
        return existing.docs[0];
      }

      return await ctx.db.create({
        collection: "favorites",
        data: {
          user: userId,
          product: input.productId,
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db.delete({
        collection: "favorites",
        where: {
          and: [
            { user: { equals: userId } },
            { product: { equals: input.productId } },
          ],
        },
      });

      return { deleted: result.docs.length };
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await ctx.db.find({
      collection: "favorites",
      depth: 2,
      limit: 100,
      sort: "-createdAt",
      where: {
        user: { equals: userId },
      },
    });
  }),
  isFavorited: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.find({
        collection: "favorites",
        limit: 1,
        depth: 0,
        where: {
          and: [
            { user: { equals: userId } },
            { product: { equals: input.productId } },
          ],
        },
      });

      return { isFavorited: Boolean(existing.docs[0]) };
    }),
});

export const likesRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.find({
        collection: "product-likes",
        limit: 1,
        depth: 0,
        where: {
          and: [
            { user: { equals: userId } },
            { product: { equals: input.productId } },
          ],
        },
      });

      if (existing.docs[0]) {
        return existing.docs[0];
      }

      return await ctx.db.create({
        collection: "product-likes",
        data: {
          user: userId,
          product: input.productId,
        },
      });
    }),
  unlike: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db.delete({
        collection: "product-likes",
        where: {
          and: [
            { user: { equals: userId } },
            { product: { equals: input.productId } },
          ],
        },
      });

      return { deleted: result.docs.length };
    }),
  count: baseProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.count({
        collection: "product-likes",
        where: {
          product: { equals: input.productId },
        },
      });

      return { count: result.totalDocs };
    }),
  hasLiked: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.find({
        collection: "product-likes",
        limit: 1,
        depth: 0,
        where: {
          and: [
            { user: { equals: userId } },
            { product: { equals: input.productId } },
          ],
        },
      });

      return { hasLiked: Boolean(existing.docs[0]) };
    }),
});

export const commentsRouter = createTRPCRouter({
  add: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        comment: z.string().trim().min(1, "Comment cannot be empty").max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.db.create({
        collection: "product-comments",
        data: {
          user: userId,
          product: input.productId,
          comment: input.comment,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const comment = await ctx.db.findByID({
        collection: "product-comments",
        id: input.id,
        depth: 0,
      });

      const ownerId = relId(comment.user);
      if (!isAppAdmin(user) && ownerId !== String(user.id)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comment.",
        });
      }

      await ctx.db.delete({
        collection: "product-comments",
        id: input.id,
      });

      return { success: true };
    }),
  list: baseProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.find({
        collection: "product-comments",
        depth: 1, // Populate the commenting user
        limit: 100,
        sort: "-createdAt",
        where: {
          product: { equals: input.productId },
        },
      });
    }),
});

export const productInteractionsRouter = createTRPCRouter({
  favorites: favoritesRouter,
  likes: likesRouter,
  comments: commentsRouter,
  views: createTRPCRouter({
    track: protectedProcedure
      .input(z.object({ productId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;

        const existing = await ctx.db.find({
          collection: "product-views",
          limit: 1,
          depth: 0,
          where: {
            and: [
              { user: { equals: userId } },
              { product: { equals: input.productId } },
            ],
          },
        });

        if (existing.docs[0]) {
          return await ctx.db.update({
            collection: "product-views",
            id: existing.docs[0].id,
            data: {
              lastViewedAt: new Date().toISOString(),
            },
          });
        }

        return await ctx.db.create({
          collection: "product-views",
          data: {
            user: userId,
            product: input.productId,
            lastViewedAt: new Date().toISOString(),
          },
        });
      }),
  }),
});
