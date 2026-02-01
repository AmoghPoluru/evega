import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import type { Category, Product } from '@/payload-types';
import { authRouter } from '@/modules/auth/server/procedures';

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  auth: authRouter,
  categories: baseProcedure
    .query(async ({ ctx }) => {
      const categories = await ctx.db.find({
        collection: 'categories',
        depth: 2,
        limit: 100,
        where: {
          parent: {
            equals: null,
          },
        },
        sort: 'name',
      });

      // Format data to include categories and subcategories details
      const formattedData = categories.docs.map((doc) => {
        // Handle both array and docs format
        const subcategories = Array.isArray(doc.subcategories)
          ? doc.subcategories
          : (doc.subcategories?.docs || []);
        
        // Filter to only Category objects (not string IDs)
        const validSubcategories = subcategories
          .filter((sub): sub is Category => {
            return typeof sub === 'object' && sub !== null && 'id' in sub;
          });
        
        return {
          ...doc,
          subcategories: validSubcategories.map((sub) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            color: sub.color || null,
          })),
        };
      });

      return formattedData;
    }),
  products: baseProcedure
    .query(async ({ ctx }) => {
      const products = await ctx.db.find({
        collection: 'products',
        depth: 2,
        limit: 100,
        where: {
          isPrivate: {
            equals: false,
          },
          isArchived: {
            equals: false,
          },
        },
        sort: 'name',
      });

      return products.docs;
    }),
  product: baseProcedure
    .input(
      z.object({
        id: z.string().optional(),
        slug: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.id && !input.slug) {
        throw new Error('Either id or slug must be provided');
      }

      const where: any = {};
      if (input.id) {
        where.id = { equals: input.id };
      }
      if (input.slug) {
        where.slug = { equals: input.slug };
      }

      const product = await ctx.db.find({
        collection: 'products',
        where,
        limit: 1,
        depth: 2,
      });

      if (!product.docs[0]) {
        throw new Error('Product not found');
      }

      return product.docs[0];
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
