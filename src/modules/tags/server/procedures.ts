import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const tagsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 100;
      const page = input?.cursor ?? 1;

      // First, get all tags
      const tagsResult = await ctx.db.find({
        collection: "tags",
        limit: 1000, // Get all tags
        sort: "name",
      });

      // Get all products with tags populated
      const productsResult = await ctx.db.find({
        collection: "products",
        depth: 2, // Populate tags and images
        limit: 1000,
        where: {
          isPrivate: {
            not_equals: true,
          },
        },
      });

      // Count products per tag and get sample images
      const tagCounts: Record<string, { count: number; image: string | null }> = {};

      productsResult.docs.forEach((product: any) => {
        const productTags = Array.isArray(product.tags)
          ? product.tags
          : (product.tags?.docs || []);

        productTags.forEach((tag: any) => {
          // Handle both string IDs and populated tag objects
          const tagId = typeof tag === 'string' ? tag : (tag?.id || null);
          
          if (!tagId) return;

          if (!tagCounts[tagId]) {
            tagCounts[tagId] = { count: 0, image: null };
          }
          tagCounts[tagId].count++;

          // Set image if not already set and product has an image
          if (!tagCounts[tagId].image && product.image) {
            const imageUrl = typeof product.image === 'string' 
              ? product.image 
              : (product.image?.url || null);
            tagCounts[tagId].image = imageUrl;
          }
        });
      });

      // Map tags with product counts
      const tagsWithCounts = tagsResult.docs
        .map((tag: any) => {
          const tagData = tagCounts[tag.id] || { count: 0, image: null };
          return {
            id: tag.id,
            name: tag.name,
            productCount: tagData.count,
            image: tagData.image,
          };
        })
        .filter((tag) => tag.productCount > 0) // Only tags with products
        .sort((a, b) => b.productCount - a.productCount); // Sort by product count

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTags = tagsWithCounts.slice(startIndex, endIndex);

      return {
        docs: paginatedTags,
        nextPage: endIndex < tagsWithCounts.length ? page + 1 : undefined,
      };
    }),
});
