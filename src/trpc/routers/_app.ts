import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import type { Category } from '@/payload-types';
import { authRouter } from '@/modules/auth/server/procedures';
import { vendorRouter } from '@/modules/vendor/server/procedures';
import { productsRouter } from '@/modules/products/server/procedures';
import { checkoutRouter } from '@/modules/checkout/server/procedures';
import { tagsRouter } from '@/modules/tags/server/procedures';
import { ordersRouter } from '@/modules/orders/server/procedures';
import { addressesRouter } from '@/modules/addresses/server/procedures';

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
  vendor: vendorRouter,
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
  getCategory: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.findByID({
        collection: 'categories',
        id: input.id,
        depth: 3, // Populate variantConfig.requiredVariants, optionalVariants, and their related VariantTypes
      });

      // Fetch variant options for the variant types
      if (category.variantConfig?.requiredVariants || category.variantConfig?.optionalVariants) {
        const allVariantTypes = [
          ...(category.variantConfig.requiredVariants || []),
          ...(category.variantConfig.optionalVariants || []),
        ].filter((vt): vt is { id: string; name: string; slug: string; type: string } => 
          typeof vt === 'object' && vt !== null && 'id' in vt
        );

        // Get variant options for each variant type
        const variantOptionsMap: Record<string, any[]> = {};
        
        for (const variantType of allVariantTypes) {
          const options = await ctx.db.find({
            collection: 'variant-options',
            where: {
              and: [
                {
                  variantType: {
                    equals: variantType.id,
                  },
                },
                {
                  or: [
                    { category: { equals: null } }, // Global options
                    { category: { equals: input.id } }, // Category-specific options
                  ],
                },
              ],
            },
            sort: 'displayOrder',
            limit: 100,
          });

          variantOptionsMap[variantType.slug] = options.docs.map((opt: any) => ({
            value: opt.value,
            label: opt.label || opt.value,
            hexCode: opt.hexCode || null,
            image: opt.image?.url || null,
          }));

          // Also check variantOptions JSON from category config
          if (category.variantConfig?.variantOptions && typeof category.variantConfig.variantOptions === 'object') {
            const jsonOptions = (category.variantConfig.variantOptions as Record<string, any>)[variantType.slug];
            if (Array.isArray(jsonOptions) && jsonOptions.length > 0) {
              // Merge JSON options with collection options, avoiding duplicates
              const existingValues = new Set(variantOptionsMap[variantType.slug].map((opt: any) => 
                typeof opt === 'string' ? opt : opt.value
              ));
              jsonOptions.forEach((opt: string) => {
                if (!existingValues.has(opt)) {
                  variantOptionsMap[variantType.slug].push({ value: opt, label: opt });
                }
              });
            }
          }
        }

        return {
          ...category,
          variantConfig: category.variantConfig ? {
            ...category.variantConfig,
            variantOptionsMap,
            variantTypes: allVariantTypes.map((vt) => ({
              id: vt.id,
              slug: vt.slug,
              name: vt.name,
              type: vt.type,
            })),
          } : null,
        };
      }

      return category;
    }),
  products: productsRouter,
  checkout: checkoutRouter,
  tags: tagsRouter,
  orders: ordersRouter,
  addresses: addressesRouter,
  heroBanners: baseProcedure
    .query(async ({ ctx }) => {
      const banners = await ctx.db.find({
        collection: 'hero-banners',
        where: {
          isActive: {
            equals: true,
          },
        },
        sort: 'order',
        limit: 10,
        depth: 2, // Populate products and their images
      });

      return banners.docs.map((banner: any) => ({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle || null,
        backgroundImage: banner.backgroundImage?.url || null,
        products: Array.isArray(banner.products)
          ? banner.products
              .filter((p: any) => typeof p === 'object' && p !== null)
              .map((product: any) => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image?.url || null,
              }))
          : [],
      }));
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
