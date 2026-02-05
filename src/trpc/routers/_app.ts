import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import type { Category } from '@/payload-types';
import { authRouter } from '@/modules/auth/server/procedures';
import { productsRouter } from '@/modules/products/server/procedures';
import { checkoutRouter } from '@/modules/checkout/server/procedures';

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
  products: productsRouter,
  checkout: checkoutRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
