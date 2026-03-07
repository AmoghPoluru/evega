import z from "zod";
import { TRPCError } from "@trpc/server";
import type { Sort, Where } from "payload";
import { headers as getHeaders } from "next/headers";

import { DEFAULT_LIMIT } from "@/constants";
import { Category, Media, Product } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { buildSearchQuery } from "@/lib/search/search-query-builder";
import { extractVariantValues, hasMatchingVariant } from "@/lib/search/variant-utils";

import { sortValues } from "../search-params";

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
        depth: 2, // Load the "product.image", "product.category", "product.vendor"
        select: {
          content: false,
        },
      });

      if (product.isArchived) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        })
      }

      // TODO: Add isPurchased logic when orders collection is implemented
      // if (session.user) {
      //   const ordersData = await ctx.db.find({
      //     collection: "orders",
      //     pagination: false,
      //     limit: 1,
      //     where: {
      //       and: [
      //         { product: { equals: input.id } },
      //         { user: { equals: session.user.id } },
      //       ],
      //     },
      //   });
      //   isPurchased = !!ordersData.docs[0];
      // }

      // TODO: Add reviews logic when reviews collection is implemented
      // const reviews = await ctx.db.find({
      //   collection: "reviews",
      //   pagination: false,
      //   where: { product: { equals: input.id } },
      // });

      return {
        ...product,
        isPurchased: false, // TODO: Implement when orders collection exists
        image: product.image as Media | null,
        video: product.video as Media | null, // Ensure video is properly typed
        reviewRating: 0, // TODO: Implement when reviews collection exists
        reviewCount: 0, // TODO: Implement when reviews collection exists
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, // TODO: Implement when reviews collection exists
      }
    }),
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        search: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        vendor: z.string().nullable().optional(), // Add vendor filter
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {
        isArchived: {
          not_equals: true,
        },
      };
      let sort: Sort = "-createdAt";

      if (input.sort === "curated") {
        sort = "-createdAt";
      }

      if (input.sort === "hot_and_new") {
        sort = "+createdAt";
      }

      if (input.sort === "trending") {
        sort = "-createdAt";
      }

      if (input.minPrice && input.maxPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
          less_than_equal: input.maxPrice,
        }
      } else if (input.minPrice) {
        where.price = {
          greater_than_equal: input.minPrice
        }
      } else if (input.maxPrice) {
        where.price = {
          less_than_equal: input.maxPrice
        }
      }

      // Filter out private products for public storefront
      where["isPrivate"] = {
        not_equals: true,
      };
      
      // Filter by vendor if provided
      if (input.vendor) {
        where.vendor = {
          equals: input.vendor,
        };
      }

      if (input.category) {
        const categoriesData = await ctx.db.find({
          collection: "categories",
          limit: 1,
          depth: 1, // Populate subcategories, subcategores.[0] will be a type of "Category"
          pagination: false,
          where: {
            slug: {
              equals: input.category,
            }
          }
        });

        const formattedData = categoriesData.docs.map((doc: Category) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs ?? [])
            .filter((sub): sub is Category => typeof sub === 'object' && sub !== null && 'id' in sub)
            .map((sub: Category) => ({
              // Because of "depth: 1" we are confident "sub" will be a type of "Category"
              ...(sub as Category),
              subcategories: undefined,
            }))
        }));

        const subcategoriesSlugs = [];
        const parentCategory = formattedData[0];

        if (parentCategory) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map((subcategory: Category) => subcategory.slug)
          )

          where["category.slug"] = {
            in: [parentCategory.slug, ...subcategoriesSlugs]
          }
        }
      }

      if (input.tags && input.tags.length > 0) {
        where["tags.name"] = {
          in: input.tags,
        };
      }

      if (input.search && input.search.trim()) {
        const searchTerm = input.search.trim();
        
        // Enhanced search with variant and price support
        const { where: searchWhere } = buildSearchQuery({
          searchTerm,
          includeVariants: true,
          includePrice: true,
        });

        // Merge search conditions with existing where clause
        // We need to combine existing filters (isArchived, isPrivate, etc.) with search OR conditions
        if (searchWhere.or && searchWhere.or.length > 0) {
          // Extract existing non-OR conditions
          const existingConditions: any = {};
          Object.keys(where).forEach(key => {
            if (key !== 'or' && key !== 'and') {
              existingConditions[key] = where[key];
            }
          });

          // Build combined where: existing conditions AND (search OR conditions)
          const combinedWhere: any = {
            ...existingConditions,
          };

          // Add search OR conditions
          combinedWhere.or = searchWhere.or;

          // Merge price filter from search query (if present)
          // If search query has price filter, it takes precedence over input.minPrice/maxPrice
          if (searchWhere.price) {
            combinedWhere.price = searchWhere.price;
          }

          // Replace where with combined
          Object.assign(where, combinedWhere);
        } else if (searchWhere.price) {
          // If only price filter (no OR conditions), merge it
          where.price = searchWhere.price;
        }
      }

      // Debug: Log the where clause for troubleshooting
      if (input.search && process.env.NODE_ENV === "development") {
        console.log("[SEARCH] Query:", input.search);
        console.log("[SEARCH] Where clause:", JSON.stringify(where, null, 2));
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // Populate "category", "image", "vendor", "variants"
        where,
        sort,
        page: input.cursor,
        limit: input.limit * 2, // Fetch more for post-filtering if needed
        select: {
          content: false,
        },
      });

      // Debug: Log results
      if (input.search && process.env.NODE_ENV === "development") {
        console.log("[SEARCH] Found", data.docs.length, "products");
      }

      // Post-filter by variants if search term exists - but be lenient
      // Only filter if we have variant requirements AND no keywords (pure variant search)
      let filteredDocs = data.docs;
      if (input.search && input.search.trim()) {
        const { parsedQuery } = buildSearchQuery({
          searchTerm: input.search.trim(),
          includeVariants: true,
        });

        // Only do strict filtering if it's a pure variant search (no keywords)
        // If there are keywords, MongoDB OR query should handle it
        if ((parsedQuery.size || parsedQuery.color || parsedQuery.material) && parsedQuery.keywords.length === 0) {
          // Pure variant search - ensure at least one variant matches
          filteredDocs = data.docs.filter((doc: Product) => {
            // Check if product has any matching variant
            let hasVariantMatch = false;

            if (parsedQuery.size) {
              hasVariantMatch = hasVariantMatch || hasMatchingVariant(doc.variants, "size", parsedQuery.size);
            }
            if (parsedQuery.color) {
              hasVariantMatch = hasVariantMatch || hasMatchingVariant(doc.variants, "color", parsedQuery.color);
            }
            if (parsedQuery.material) {
              hasVariantMatch = hasVariantMatch || hasMatchingVariant(doc.variants, "material", parsedQuery.material);
            }

            return hasVariantMatch;
          });

          // Update totalDocs to reflect filtered count
          data.totalDocs = filteredDocs.length;
        }
        // If there are keywords, trust MongoDB query results (OR logic handles it)
      }

      // Limit to requested amount
      filteredDocs = filteredDocs.slice(0, input.limit);

      // TODO: Add reviews summary when reviews collection is implemented
      // const dataWithSummarizedReviews = await Promise.all(
      //   data.docs.map(async (doc) => {
      //     const reviewsData = await ctx.db.find({
      //       collection: "reviews",
      //       pagination: false,
      //       where: { product: { equals: doc.id } },
      //     });
      //     return {
      //       ...doc,
      //       reviewCount: reviewsData.totalDocs,
      //       reviewRating: reviewsData.docs.length === 0
      //         ? 0
      //         : reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) / reviewsData.totalDocs
      //     }
      //   })
      // );

      return {
        ...data,
        docs: filteredDocs.map((doc: Product) => ({
          ...doc,
          image: doc.image as Media | null,
          reviewCount: 0, // TODO: Implement when reviews collection exists
          reviewRating: 0, // TODO: Implement when reviews collection exists
        }))
      }
    }),
});
