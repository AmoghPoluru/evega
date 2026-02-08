import z from "zod";
import { TRPCError } from "@trpc/server";
import type { Sort, Where } from "payload";
import { headers as getHeaders } from "next/headers";

import { DEFAULT_LIMIT } from "@/constants";
import { Category, Media } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

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
        depth: 2, // Load the "product.image", "product.category"
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

        const formattedData = categoriesData.docs.map((doc) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
            // Because of "depth: 1" we are confident "doc" will be a type of "Category"
            ...(doc as Category),
            subcategories: undefined,
          }))
        }));

        const subcategoriesSlugs = [];
        const parentCategory = formattedData[0];

        if (parentCategory) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map((subcategory) => subcategory.slug)
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
        // Search across name, tags, and description
        where["or"] = [
          {
            name: {
              contains: searchTerm,
            },
          },
          {
            "tags.name": {
              contains: searchTerm,
            },
          },
          // Note: Description is richText (Lexical format), so we search in the text content
          // This searches within the Lexical structure's text nodes
          {
            description: {
              contains: searchTerm,
            },
          },
        ];
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // Populate "category", "image"
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
        select: {
          content: false,
        },
      });

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
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          reviewCount: 0, // TODO: Implement when reviews collection exists
          reviewRating: 0, // TODO: Implement when reviews collection exists
        }))
      }
    }),
});
