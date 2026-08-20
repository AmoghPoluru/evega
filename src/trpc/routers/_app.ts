import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { getVendorStorefrontBranding, getVendorStorefrontBrandingForProduct } from '@/lib/vendor-logo/storefront-branding';
import { authRouter } from '@/modules/auth/server/procedures';
import { vendorRouter } from '@/modules/vendor/server/procedures';
import { productsRouter } from '@/modules/products/server/procedures';
import { productInteractionsRouter } from '@/modules/products/server/interactions';
import { checkoutRouter } from '@/modules/checkout/server/procedures';
import { tagsRouter } from '@/modules/tags/server/procedures';
import { ordersRouter } from '@/modules/orders/server/procedures';
import { addressesRouter } from '@/modules/addresses/server/procedures';
import { adminRouter } from '@/modules/admin/server/procedures';
import { socialRouter } from '@/modules/social/server/procedures';

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
  admin: adminRouter,
  vendor: vendorRouter,
  social: socialRouter,
  products: productsRouter,
  productInteractions: productInteractionsRouter,
  checkout: checkoutRouter,
  tags: tagsRouter,
  orders: ordersRouter,
  addresses: addressesRouter,
  storefront: createTRPCRouter({
    getVendorBranding: baseProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        return getVendorStorefrontBranding(ctx.db, input.slug);
      }),
    getVendorBrandingByProductId: baseProcedure
      .input(z.object({ productId: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        return getVendorStorefrontBrandingForProduct(ctx.db, input.productId);
      }),
  }),
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
  vendorHeroBanners: baseProcedure
    .input(z.object({ vendorSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      // First find the vendor by slug
      const vendors = await ctx.db.find({
        collection: 'vendors',
        where: {
          slug: { equals: input.vendorSlug },
          status: { equals: 'approved' },
          isActive: { equals: true },
        },
        limit: 1,
      });

      if (vendors.docs.length === 0) {
        return [];
      }

      const vendor = vendors.docs[0];
      const vendorId = vendor.id;

      // Fetch active vendor hero banners
      const banners = await ctx.db.find({
        collection: 'vendor-hero-banners',
        where: {
          vendor: { equals: vendorId },
          isActive: { equals: true },
        },
        sort: 'order',
        limit: 10,
        depth: 3, // Populate products, product images, and backgroundImage (depth 3 ensures product.image is populated)
      });

      return banners.docs.map((banner: any) => ({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle || null,
        backgroundImage: banner.backgroundImage?.url || null,
        products: Array.isArray(banner.products)
          ? banner.products
              .filter((p: any) => typeof p === 'object' && p !== null)
              .map((product: any) => {
                // Extract image URL - handle both populated object and string ID
                let imageUrl: string | null = null;
                if (product.image) {
                  if (typeof product.image === 'object' && product.image.url) {
                    imageUrl = product.image.url;
                  } else if (typeof product.image === 'string') {
                    // If image is just an ID string, we'd need to fetch it, but with depth: 3 it should be populated
                    // For now, log a warning and skip
                    console.warn(`Product ${product.id} has image as string ID instead of populated object. Ensure depth: 3 is working.`);
                  }
                }
                
                return {
                  id: product.id,
                  name: product.name,
                  slug: product.slug || product.id, // Fallback to id if slug missing
                  price: product.price,
                  image: imageUrl,
                };
              })
          : [],
      }));
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
