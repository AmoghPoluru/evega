import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";
import type { Where, Sort } from "payload";
import { parse } from "csv-parse/sync";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import OpenAI from "openai";

import { baseProcedure, createTRPCRouter, protectedProcedure, vendorProcedure } from "@/trpc/init";
import {
  createStripeConnectAccount,
  createStripeOnboardingLink,
  getStripeAccountStatus,
  isStripeAccountReady,
  syncVendorStripeDetails,
} from "@/lib/stripe-connect";
import { extractYouTubeVideoId, timeToSeconds } from "@/lib/youtube-utils";
import { createManualOrder } from "@/modules/orders/create-manual-order";
import { manualOrderCreateInputSchema } from "@/modules/orders/manual-order-schema";
import { payloadReqFromUser } from "@/lib/payload-req";
import { toMarketingProfileResponse, updateVendorMarketingProfile, marketingProfileUpdateBodySchema } from "@/modules/marketing/marketing-profile-trpc";
import type { Vendor } from "@/payload-types";
import type { HappyBannerDocFields } from "@/lib/happy-banner/types";
import { getHappyBannerPlatformConfig } from "@/lib/happy-banner/config";
import { buildResolvedHappyBanner } from "@/lib/happy-banner/format-banner";
import { formatHappyBannerListItem } from "@/lib/happy-banner/preview-image";
import {
  getHappyBannerVendorWordDefaults,
  getHappyBannerVendorWordSlots,
  resolveVendorHappyBannerWords,
} from "@/lib/happy-banner/vendor-words";
import { resolveHappyBannerForVendor } from "@/lib/happy-banner/resolve";
import { getHappyBannerRelationshipId } from "@/lib/happy-banner/relationship-id";
import {
  vendorHappyBannerSelectSchema,
  vendorHappyBannerTextSchema,
} from "@/lib/happy-banner/schema";
import { normalizeVendorHappyBannerWords } from "@/lib/happy-banner/validate-vendor-words";
import type { HappyBannerPreset } from "@/lib/happy-banner/types";
import type { Payload } from "payload";
import { revalidatePath } from "next/cache";
import { vendorLogoTemplateRouter } from "@/modules/vendor/server/logo-template-procedures";

type VendorHappyBannerState = {
  selectedBanner?: string | { id: string } | null;
  word1?: string | null;
  word2?: string | null;
};

async function revalidateVendorHappyBannerStorefront(db: Payload, vendorId: string) {
  const vendor = await db.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 0,
  });
  if (vendor.slug) {
    revalidatePath(`/vendors/${vendor.slug}`);
  }
}

type VendorWithHappyBanner = Vendor & {
  happyBanner?: VendorHappyBannerState | null;
};

/** Treat empty strings as undefined so optional URL fields don't fail Zod in production. */
const optionalUrl = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.string().url().optional(),
);

/** Fields selected by the public `vendor.list` query. */
type VendorListFields = Pick<Vendor, "id" | "name" | "slug" | "logo" | "description">;

const VENDOR_DESCRIPTION_PREVIEW_LENGTH = 240;

/** Flatten a Lexical description into a short preview string for listing cards. */
function extractVendorDescriptionText(description: Vendor["description"]): string | null {
  if (!description?.root?.children) return null;

  const walk = (nodes: unknown[]): string =>
    nodes
      .map((node) => {
        if (typeof node !== "object" || node === null) return "";
        const n = node as { text?: string; children?: unknown[] };
        return (n.text ?? "") + (n.children ? walk(n.children) : "");
      })
      .join(" ");

  const text = walk(description.root.children).replace(/\s+/g, " ").trim();
  if (!text) return null;

  return text.length > VENDOR_DESCRIPTION_PREVIEW_LENGTH
    ? `${text.slice(0, VENDOR_DESCRIPTION_PREVIEW_LENGTH).trimEnd()}…`
    : text;
}

const vendorRegistrationSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
});

export const vendorRouter = createTRPCRouter({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.findByID({
      collection: "users",
      id: ctx.session.user.id,
      depth: 2,
    });

    const vendor = user.vendor;
    if (!vendor) {
      return {
        hasVendor: false,
        status: "none" as const,
        isActive: false,
      };
    }

    const vendorId = typeof vendor === "string" ? vendor : vendor.id;

    let vendorDoc;
    try {
      vendorDoc =
        typeof vendor === "string"
          ? await ctx.db.findByID({ collection: "vendors", id: vendorId, depth: 0 })
          : vendor;
    } catch (error) {
      const isNotFound =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status: number }).status === 404;

      if (isNotFound) {
        return {
          hasVendor: false,
          status: "none" as const,
          isActive: false,
        };
      }

      throw error;
    }

    return {
      hasVendor: true,
      status: vendorDoc.status || "pending",
      isActive: vendorDoc.isActive ?? false,
    };
  }),

  getOne: baseProcedure
    .input(
      z.object({ 
        id: z.string(),
        depth: z.number().optional().default(2),
      })
    )
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.db.findByID({
        collection: "vendors",
        id: input.id,
        depth: input.depth,
      });
      return vendor;
    }),

  list: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        status: z.enum(["approved", "pending", "rejected", "suspended"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        isActive: { equals: true },
      };

      // Only show approved vendors by default
      if (input.status) {
        where.status = { equals: input.status };
      } else {
        where.status = { equals: "approved" };
      }

      const result = await ctx.db.find({
        collection: "vendors",
        where,
        limit: input.limit,
        sort: "-createdAt",
        depth: 1,
        select: {
          name: true,
          slug: true,
          logo: true,
          description: true,
        },
        populate: {
          // `url` is virtual and derived from `filename`/`mimeType`, so those
          // have to be selected for it to be resolved.
          media: {
            url: true,
            filename: true,
            mimeType: true,
          },
        },
      });

      return {
        vendors: (result.docs as VendorListFields[]).map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
          slug: vendor.slug ?? null,
          logoUrl:
            vendor.logo && typeof vendor.logo !== "string" ? vendor.logo.url ?? null : null,
          descriptionText: extractVendorDescriptionText(vendor.description),
        })),
        total: result.totalDocs,
      };
    }),

  register: protectedProcedure
    .input(vendorRegistrationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user already has a vendor
      const user = await ctx.db.findByID({
        collection: "users",
        id: userId,
        depth: 1,
      });

      if (user.vendor) {
        const vendorId = typeof user.vendor === "string" ? user.vendor : user.vendor.id;
        const vendor = await ctx.db.findByID({
          collection: "vendors",
          id: vendorId,
          depth: 0,
        });

        if (vendor.status === "pending" || vendor.status === "rejected") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Your vendor application is already pending. Please wait for approval.",
          });
        }

        if (vendor.status === "approved" && vendor.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You are already a registered vendor.",
          });
        }
      }

      // Create vendor record with status "pending"
      // Generate slug from business name (also handled by beforeValidate hook, but needed for TypeScript)
      const slug = input.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const vendor = await ctx.db.create({
        collection: "vendors",
        data: {
          name: input.businessName,
          slug: slug,
          email: input.email,
          phone: input.phone || undefined,
          status: "pending",
          isActive: false,
        },
      });

      // Link user to vendor (add vendor relationship)
      await ctx.db.update({
        collection: "users",
        id: userId,
        data: {
          vendor: vendor.id,
          role: "vendor",
        },
      });

      return {
        success: true,
        vendorId: vendor.id,
        message: "Vendor application submitted successfully. You will be notified once approved.",
      };
    }),

  products: createTRPCRouter({
    // Task 1001: Calculate sold quantity and remaining stock for products
    stats: vendorProcedure
      .input(
        z.object({
          productIds: z.array(z.string()),
        })
      )
      .query(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;
        
        if (input.productIds.length === 0) {
          return {};
        }

        // Query orders for these products
        const orders = await ctx.db.find({
          collection: "orders",
          where: {
            vendor: { equals: vendorId },
            product: { in: input.productIds },
          },
          limit: 1000, // Get all orders for these products
          depth: 0,
        });

        // Aggregate sold quantities by product ID
        const soldCounts: Record<string, number> = {};
        orders.docs.forEach((order: any) => {
          const productId = typeof order.product === "string" ? order.product : order.product?.id;
          if (productId) {
            soldCounts[productId] = (soldCounts[productId] || 0) + (order.quantity || 0);
          }
        });

        // Get products to calculate remaining stock
        const products = await ctx.db.find({
          collection: "products",
          where: {
            id: { in: input.productIds },
          },
          limit: input.productIds.length,
          depth: 0,
        });

        // Calculate remaining stock for each product
        const stats: Record<string, { sold: number; remaining: number }> = {};
        products.docs.forEach((product: any) => {
          const productId = product.id;
          const sold = soldCounts[productId] || 0;
          
          // Calculate remaining stock: sum of all variant stocks, or base stock if no variants
          let remaining = 0;
          if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            remaining = product.variants.reduce((sum: number, variant: any) => {
              return sum + (variant.stock || 0);
            }, 0);
          } else if (product.stock !== undefined && product.stock !== null) {
            remaining = product.stock || 0;
          }
          
          stats[productId] = { sold, remaining };
        });

        return stats;
      }),

    list: vendorProcedure
      .input(
        z.object({
          status: z.enum(["all", "published", "draft", "archived"]).optional().default("all"),
          search: z.string().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
          sortBy: z.enum(["name", "price", "createdAt", "updatedAt"]).default("createdAt"),
          sortOrder: z.enum(["asc", "desc"]).default("desc"),
        })
      )
      .query(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;
        
        console.log("[PRODUCTS LIST] Query params:", {
          vendorId,
          status: input.status,
          search: input.search,
          page: input.page,
        });
        
        // Build where clause - always filter by vendor
        const where: Where = {
          vendor: { equals: vendorId },
        };

        // Status filter
        if (input.status && input.status !== "all") {
          if (input.status === "published") {
            where.isPrivate = { equals: false };
            where.isArchived = { equals: false };
          } else if (input.status === "draft") {
            where.isPrivate = { equals: true };
            where.isArchived = { equals: false };
          } else if (input.status === "archived") {
            where.isArchived = { equals: true };
          }
        } else {
          // When status is "all", show all non-archived products (both published and drafts)
          where.isArchived = { equals: false };
        }

        // Search filter
        if (input.search) {
          where.name = { contains: input.search };
        }


        // Build sort
        const sort: Sort = `${input.sortOrder === "desc" ? "-" : ""}${input.sortBy}`;

        // Execute query
        const result = await ctx.db.find({
          collection: "products",
          where,
          limit: input.limit,
          page: input.page,
          sort,
          depth: 1, // Include image
        });

        console.log("[PRODUCTS LIST] Query result:", {
          totalDocs: result.totalDocs,
          docsCount: result.docs.length,
          vendorId,
          where,
        });

        // Task 1002: Calculate soldCount and remainingStock for each product
        const productIds = result.docs.map((p: any) => p.id);
        const stats: Record<string, { sold: number; remaining: number }> = {};
        
        if (productIds.length > 0) {
          // Query orders for these products
          const orders = await ctx.db.find({
            collection: "orders",
            where: {
              vendor: { equals: vendorId },
              product: { in: productIds },
            },
            limit: 1000,
            depth: 0,
          });

          // Aggregate sold quantities
          const soldCounts: Record<string, number> = {};
          orders.docs.forEach((order: any) => {
            const productId = typeof order.product === "string" ? order.product : order.product?.id;
            if (productId) {
              soldCounts[productId] = (soldCounts[productId] || 0) + (order.quantity || 0);
            }
          });

          // Calculate remaining stock for each product
          result.docs.forEach((product: any) => {
            const productId = product.id;
            const sold = soldCounts[productId] || 0;
            
            // Calculate remaining stock: sum of all variant stocks, or base stock if no variants
            let remaining = 0;
            if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
              remaining = product.variants.reduce((sum: number, variant: any) => {
                const variantStock = variant.stock || 0;
                // Debug logging for first product
                if (productId === result.docs[0]?.id && process.env.NODE_ENV === "development") {
                  console.log(`[PRODUCTS LIST] Variant stock:`, {
                    productId,
                    variantId: variant.id,
                    stock: variantStock,
                    variantData: variant.variantData,
                  });
                }
                return sum + variantStock;
              }, 0);
              
              // Debug logging for first product
              if (productId === result.docs[0]?.id && process.env.NODE_ENV === "development") {
                console.log(`[PRODUCTS LIST] Product ${product.name} (${productId}):`, {
                  variantsCount: product.variants.length,
                  totalRemaining: remaining,
                  sold,
                });
              }
            } else if (product.stock !== undefined && product.stock !== null) {
              remaining = product.stock || 0;
            }
            
            stats[productId] = { sold, remaining };
          });
        }

        // Add soldCount and remainingStock to each product
        const docsWithStats = result.docs.map((product: any) => {
          const statsForProduct = stats[product.id] || { sold: 0, remaining: 0 };
          return {
            ...product,
            soldCount: statsForProduct.sold,
            remainingStock: statsForProduct.remaining,
          };
        });

        return {
          docs: docsWithStats,
          totalDocs: result.totalDocs,
          totalPages: result.totalPages,
          page: result.page,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        };
      }),

    getOne: vendorProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        console.log("[tRPC] vendor.products.getOne called with ID:", input.id);
        
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;
        
        console.log("[tRPC] Vendor ID from session:", vendorId);
        
        const product = await ctx.db.findByID({
          collection: "products",
          id: input.id,
          depth: 2,
        });

        console.log("[tRPC] Product found:", {
          id: product.id,
          name: product.name,
          productVendor: typeof product.vendor === "string" ? product.vendor : product.vendor?.id,
        });

        // Verify ownership
        const productVendorId = typeof product.vendor === "string" 
          ? product.vendor 
          : product.vendor?.id;
        
        console.log("[tRPC] Comparing vendor IDs:", {
          productVendorId,
          sessionVendorId: vendorId,
          match: productVendorId === vendorId,
        });
        
        if (productVendorId !== vendorId) {
          console.error("[tRPC] Access denied - vendor mismatch");
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this product",
          });
        }

        console.log("[tRPC] Product access granted, returning product");
        return product;
      }),

    bulkUpdate: vendorProcedure
      .input(
        z.object({
          productIds: z.array(z.string()).min(1),
          action: z.enum(["publish", "unpublish", "archive", "delete"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;
        
        // Verify all products belong to vendor
        const products = await ctx.db.find({
          collection: "products",
          where: {
            id: { in: input.productIds },
            vendor: { equals: vendorId },
          },
          pagination: false,
        });

        if (products.docs.length !== input.productIds.length) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Some products don't belong to you",
          });
        }

        // Perform bulk update
        const updateData: any = {
          updatedAt: new Date().toISOString(),
        };

        switch (input.action) {
          case "publish":
            updateData.isPrivate = false;
            break;
          case "unpublish":
            updateData.isPrivate = true;
            break;
          case "archive":
            updateData.isArchived = true;
            break;
          case "delete":
            // Soft delete
            updateData.isArchived = true;
            break;
        }

        // Update all products
        await Promise.all(
          input.productIds.map((id) =>
            ctx.db.update({
              collection: "products",
              id,
              data: updateData,
            })
          )
        );

        return { success: true, updated: input.productIds.length };
      }),

    create: vendorProcedure
      .input(
        z.object({
          name: z.string().min(1, "Product name is required"),
          description: z.any().optional(), // Rich text object
          price: z.number().min(0.01, "Price must be greater than 0"),
          image: z.string().optional(),
          cover: z.array(z.string()).optional(),
          videoSource: z.enum(["upload", "youtube"]).optional(),
          video: z.string().optional(),
          youtubeUrl: optionalUrl,
          youtubeStartTime: z.string().optional(), // MM:SS format
          refundPolicy: z.enum(["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"]).optional(),
          tags: z.array(z.string()).optional(),
          variants: z.array(
            z.object({
              variantData: z.record(z.string(), z.any()).default({}), // Dynamic variant data based on category
              stock: z.number().min(0).default(0),
              price: z.number().optional(),
            })
          ).optional(),
          isPrivate: z.boolean().default(true), // Default to draft
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;

        // Process YouTube fields if videoSource is YouTube
        let processedInput = { ...input };
        if (input.videoSource === "youtube" && input.youtubeUrl) {
          // Extract video ID
          const videoId = extractYouTubeVideoId(input.youtubeUrl);
          if (!videoId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid YouTube URL. Please provide a valid YouTube video URL.",
            });
          }
          
          // Convert MM:SS to seconds
          let startTimeSeconds: number | undefined = undefined;
          if (input.youtubeStartTime) {
            const seconds = timeToSeconds(input.youtubeStartTime);
            if (seconds === null) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid time format. Please use MM:SS format (e.g., 2:05 for 2 minutes 5 seconds).",
              });
            }
            startTimeSeconds = seconds;
          }
          
          processedInput = {
            ...input,
            youtubeVideoId: videoId,
            youtubeStartTimeSeconds: startTimeSeconds,
          } as any;
        } else if (input.videoSource === "upload" || !input.videoSource) {
          // Clear YouTube fields when using upload
          processedInput = {
            ...input,
            youtubeUrl: undefined,
            youtubeVideoId: undefined,
            youtubeStartTime: undefined,
            youtubeStartTimeSeconds: undefined,
          } as any;
        }

        try {
          // Create product with vendor auto-assigned
          const product = await ctx.db.create({
            collection: "products",
            data: {
              ...processedInput,
              vendor: vendorId,
              isArchived: false,
            } as any, // Type assertion needed because Payload types don't include YouTube fields yet
            req: payloadReqFromUser(ctx.session.user),
          });

          return product;
        } catch (error: any) {
          console.error("[Product Create Error]", {
            message: error?.message,
            name: error?.name,
          });

          if (
            error?.message?.includes("not allowed") ||
            error?.name === "Forbidden" ||
            error?.status === 403
          ) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message:
                "You do not have permission to create products. Ensure your vendor account is approved and active.",
            });
          }

          // Log error structure for debugging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.error('[Product Create Error]', {
              error,
              errors: error?.errors,
              data: error?.data,
              message: error?.message,
              name: error?.name,
            });
          }

          // Parse Payload CMS validation errors - check multiple possible error formats
          let parsedErrors: string[] = [];

          // Format 1: error.errors array (Payload standard format)
          if (error?.errors && Array.isArray(error.errors)) {
            let requiredVariantFields: string[] = [];

            parsedErrors = error.errors.map((err: any) => {
              // Extract field name from path (e.g., "variants.0.variantData.size" -> "Size in Variant 1")
              if (err.path) {
                const pathParts = err.path.split('.');
                if (pathParts[0] === 'variants' && pathParts[1]) {
                  const variantIndex = parseInt(pathParts[1]) + 1;
                  const fieldName = pathParts[pathParts.length - 1];
                  
                  // Special handling for variantData field
                  if (fieldName.toLowerCase() === 'variantdata' || fieldName.toLowerCase() === 'variant_data') {
                    if (requiredVariantFields.length > 0) {
                      return `Variant ${variantIndex}: Please fill in all required variant fields: ${requiredVariantFields.join(', ')}`;
                    } else {
                      return `Variant ${variantIndex}: Please fill in all required variant fields (Size, Color, Material, etc.)`;
                    }
                  }
                  
                  // Try to get human-readable field name
                  const readableField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                  return `${readableField} in Variant ${variantIndex}: ${err.message || 'Invalid value'}`;
                }
                return err.message || `Invalid value for ${err.path}`;
              }
              return err.message || 'Validation error';
            });
          }
          // Format 2: error.data?.errors (alternative Payload format)
          else if (error?.data?.errors && Array.isArray(error.data.errors)) {
            let requiredVariantFields: string[] = [];

            parsedErrors = error.data.errors.map((err: any) => {
              if (err.path) {
                const pathParts = err.path.split('.');
                if (pathParts[0] === 'variants' && pathParts[1]) {
                  const variantIndex = parseInt(pathParts[1]) + 1;
                  const fieldName = pathParts[pathParts.length - 1];
                  
                  // Special handling for variantData field
                  if (fieldName.toLowerCase() === 'variantdata' || fieldName.toLowerCase() === 'variant_data') {
                    if (requiredVariantFields.length > 0) {
                      return `Variant ${variantIndex}: Please fill in all required variant fields: ${requiredVariantFields.join(', ')}`;
                    } else {
                      return `Variant ${variantIndex}: Please fill in all required variant fields (Size, Color, Material, etc.)`;
                    }
                  }
                  
                  const readableField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                  return `${readableField} in Variant ${variantIndex}: ${err.message || 'Invalid value'}`;
                }
                return err.message || `Invalid value for ${err.path}`;
              }
              return err.message || 'Validation error';
            });
          }
          // Format 3: Parse error message if it contains "Product Variants X > Variant Data"
          else if (error?.message && typeof error.message === 'string') {
            const messageMatch = error.message.match(/Product Variants (\d+) > Variant Data/i);
            if (messageMatch) {
              const variantNum = messageMatch[1];
              // Try to extract more details from the error
              parsedErrors.push(`Variant ${variantNum} has invalid variant data. Please check all required variant fields (Size, Color, Material, etc.) are filled correctly.`);
            } else {
              // If it's a generic validation error, try to extract field info
              parsedErrors.push(error.message);
            }
          }

          if (parsedErrors.length > 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: parsedErrors.join('; '),
            });
          }
          
          // Re-throw other errors as-is
          throw error;
        }
      }),

    update: vendorProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          description: z.any().optional(),
          price: z.number().min(0.01).optional(),
          image: z.string().optional(),
          cover: z.array(z.string()).optional(),
          videoSource: z.enum(["upload", "youtube"]).optional(),
          video: z.string().optional(),
          youtubeUrl: optionalUrl,
          youtubeStartTime: z.string().optional(), // MM:SS format
          refundPolicy: z.enum(["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"]).optional(),
          tags: z.array(z.string()).optional(),
          variants: z.array(
            z.object({
              variantData: z.record(z.string(), z.any()).default({}), // Dynamic variant data based on category
              stock: z.number().min(0).default(0),
              price: z.number().optional(),
            })
          ).optional(),
          isPrivate: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;

        const { id: productId, ...updateInput } = input;

        // Process YouTube fields if videoSource is YouTube
        let processedInput = { ...updateInput };
        if (updateInput.videoSource === "youtube" && updateInput.youtubeUrl) {
          // Extract video ID
          const videoId = extractYouTubeVideoId(updateInput.youtubeUrl);
          if (!videoId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid YouTube URL. Please provide a valid YouTube video URL.",
            });
          }
          
          // Convert MM:SS to seconds
          let startTimeSeconds: number | undefined = undefined;
          if (updateInput.youtubeStartTime) {
            const seconds = timeToSeconds(updateInput.youtubeStartTime);
            if (seconds === null) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid time format. Please use MM:SS format (e.g., 2:05 for 2 minutes 5 seconds).",
              });
            }
            startTimeSeconds = seconds;
          }
          
          processedInput = {
            ...updateInput,
            youtubeVideoId: videoId,
            youtubeStartTimeSeconds: startTimeSeconds,
          } as any;
        } else if (updateInput.videoSource === "upload" || (!updateInput.videoSource && updateInput.video)) {
          // Clear YouTube fields when using upload
          processedInput = {
            ...updateInput,
            youtubeUrl: undefined,
            youtubeVideoId: undefined,
            youtubeStartTime: undefined,
            youtubeStartTimeSeconds: undefined,
          } as any;
        }

        const { ...updateData } = processedInput;

        // Verify ownership
        const existingProduct = await ctx.db.findByID({
          collection: "products",
          id: productId,
          depth: 0,
        });

        const productVendorId = typeof existingProduct.vendor === "string" 
          ? existingProduct.vendor 
          : existingProduct.vendor?.id;
        
        if (productVendorId !== vendorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this product",
          });
        }

        // Prevent vendor field change
        const { vendor, ...safeUpdateData } = updateData as any;

        try {
          // Update product
          const product = await ctx.db.update({
            collection: "products",
            id: productId,
            data: safeUpdateData,
            req: payloadReqFromUser(ctx.session.user),
          });

          return product;
        } catch (error: any) {
          console.error("[Product Update Error]", {
            message: error?.message,
            name: error?.name,
          });

          if (
            error?.message?.includes("not allowed") ||
            error?.name === "Forbidden" ||
            error?.status === 403
          ) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message:
                "You do not have permission to update this product. Ensure your vendor account is approved and active.",
            });
          }

          // Log error structure for debugging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.error('[Product Update Error]', {
              error,
              errors: error?.errors,
              data: error?.data,
              message: error?.message,
              name: error?.name,
            });
          }

          // Parse Payload CMS validation errors - check multiple possible error formats
          let parsedErrors: string[] = [];

          // Format 1: error.errors array (Payload standard format)
          if (error?.errors && Array.isArray(error.errors)) {
            let requiredVariantFields: string[] = [];

            parsedErrors = error.errors.map((err: any) => {
              // Extract field name from path (e.g., "variants.0.variantData.size" -> "Size in Variant 1")
              if (err.path) {
                const pathParts = err.path.split('.');
                if (pathParts[0] === 'variants' && pathParts[1]) {
                  const variantIndex = parseInt(pathParts[1]) + 1;
                  const fieldName = pathParts[pathParts.length - 1];
                  
                  // Special handling for variantData field
                  if (fieldName.toLowerCase() === 'variantdata' || fieldName.toLowerCase() === 'variant_data') {
                    if (requiredVariantFields.length > 0) {
                      return `Variant ${variantIndex}: Please fill in all required variant fields: ${requiredVariantFields.join(', ')}`;
                    } else {
                      return `Variant ${variantIndex}: Please fill in all required variant fields (Size, Color, Material, etc.)`;
                    }
                  }
                  
                  // Try to get human-readable field name
                  const readableField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                  return `${readableField} in Variant ${variantIndex}: ${err.message || 'Invalid value'}`;
                }
                return err.message || `Invalid value for ${err.path}`;
              }
              return err.message || 'Validation error';
            });
          }
          // Format 2: error.data?.errors (alternative Payload format)
          else if (error?.data?.errors && Array.isArray(error.data.errors)) {
            let requiredVariantFields: string[] = [];

            parsedErrors = error.data.errors.map((err: any) => {
              if (err.path) {
                const pathParts = err.path.split('.');
                if (pathParts[0] === 'variants' && pathParts[1]) {
                  const variantIndex = parseInt(pathParts[1]) + 1;
                  const fieldName = pathParts[pathParts.length - 1];
                  
                  // Special handling for variantData field
                  if (fieldName.toLowerCase() === 'variantdata' || fieldName.toLowerCase() === 'variant_data') {
                    if (requiredVariantFields.length > 0) {
                      return `Variant ${variantIndex}: Please fill in all required variant fields: ${requiredVariantFields.join(', ')}`;
                    } else {
                      return `Variant ${variantIndex}: Please fill in all required variant fields (Size, Color, Material, etc.)`;
                    }
                  }
                  
                  const readableField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                  return `${readableField} in Variant ${variantIndex}: ${err.message || 'Invalid value'}`;
                }
                return err.message || `Invalid value for ${err.path}`;
              }
              return err.message || 'Validation error';
            });
          }
          // Format 3: Parse error message if it contains "Product Variants X > Variant Data"
          else if (error?.message && typeof error.message === 'string') {
            const messageMatch = error.message.match(/Product Variants (\d+) > Variant Data/i);
            if (messageMatch) {
              const variantNum = messageMatch[1];
              // Try to extract more details from the error
              parsedErrors.push(`Variant ${variantNum} has invalid variant data. Please check all required variant fields (Size, Color, Material, etc.) are filled correctly.`);
            } else {
              // If it's a generic validation error, try to extract field info
              parsedErrors.push(error.message);
            }
          }

          if (parsedErrors.length > 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: parsedErrors.join('; '),
            });
          }
          
          // Re-throw other errors as-is
          throw error;
        }
      }),

    delete: vendorProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;

        // Verify ownership
        const product = await ctx.db.findByID({
          collection: "products",
          id: input.id,
          depth: 0,
        });

        const productVendorId = typeof product.vendor === "string" 
          ? product.vendor 
          : product.vendor?.id;
        
        if (productVendorId !== vendorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this product",
          });
        }

        // Soft delete - set isArchived to true
        await ctx.db.update({
          collection: "products",
          id: input.id,
          data: {
            isArchived: true,
          },
        });

        return { success: true };
      }),

    bulkImport: vendorProcedure
      .input(
        z.object({
          csvData: z.string(), // CSV content as string
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;

        // Parse CSV using csv-parse
        let records: any[];
        let headers: string[] = [];
        
        try {
          records = parse(input.csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
          });
          
          if (records.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "CSV file must have at least a header row and one data row",
            });
          }

          // Get headers from first record keys
          headers = Object.keys(records[0]);
        } catch (parseError: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid CSV format: ${parseError.message}`,
          });
        }

        const requiredFields = ['name', 'price'];
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Missing required columns: ${missingFields.join(', ')}`,
          });
        }

        const errors: Array<{ row: number; errors: string[] }> = [];
        const productIds: string[] = [];
        let successCount = 0;
        let failedCount = 0;

        // Group rows by product name (same product can have multiple rows for variants)
        const productGroups = new Map<string, Array<{ rowData: Record<string, string>; rowIndex: number }>>();
        
        for (let i = 0; i < records.length; i++) {
          const rowData = records[i] as Record<string, string>;
          const productName = String(rowData.name || '').trim();
          
          if (!productName) {
            errors.push({
              row: i + 2,
              errors: ['Missing product name'],
            });
            failedCount++;
            continue;
          }

          if (!productGroups.has(productName)) {
            productGroups.set(productName, []);
          }
          productGroups.get(productName)!.push({ rowData, rowIndex: i });
        }

        // Process each product group
        for (const [productName, rows] of productGroups.entries()) {
          try {
            // Use first row for product-level data
            const firstRow = rows[0].rowData;

            // Validate required fields
            if (!firstRow.name || !firstRow.price) {
              throw new Error('Missing required fields: name or price');
            }

            // Parse price
            const price = parseFloat(firstRow.price);
            if (isNaN(price) || price <= 0) {
              throw new Error(`Invalid price: ${firstRow.price}`);
            }

            // Convert description to Lexical format if provided
            let description: unknown = undefined;
            if (firstRow.description) {
              description = {
                root: {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: "normal",
                          style: "",
                          text: firstRow.description,
                          type: "text",
                          version: 1,
                        },
                      ],
                      direction: "ltr",
                      format: "",
                      indent: 0,
                      type: "paragraph",
                      version: 1,
                    },
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "root",
                  version: 1,
                },
              };
            }

            // Build variants array from all rows (variantData matches product schema)
            const variants: Array<{
              variantData: Record<string, string>;
              stock: number;
              price?: number;
            }> = [];

            for (const { rowData } of rows) {
              const hasSize = rowData.size && rowData.size.trim() !== '';
              const hasColor = rowData.color && rowData.color.trim() !== '';
              const hasVariantStock = rowData.variant_stock && rowData.variant_stock.trim() !== '';

              if (hasSize || hasColor || hasVariantStock) {
                const variantStock = hasVariantStock
                  ? parseInt(rowData.variant_stock, 10)
                  : 0;

                if (isNaN(variantStock) || variantStock < 0) {
                  throw new Error(`Invalid variant_stock: ${rowData.variant_stock}`);
                }

                const variantPrice =
                  rowData.variant_price && rowData.variant_price.trim() !== ''
                    ? parseFloat(rowData.variant_price)
                    : null;

                if (variantPrice !== null && (isNaN(variantPrice) || variantPrice <= 0)) {
                  throw new Error(`Invalid variant_price: ${rowData.variant_price}`);
                }

                const variantData: Record<string, string> = {};
                if (hasSize) variantData.size = rowData.size.trim();
                if (hasColor) variantData.color = rowData.color.trim();

                variants.push({
                  variantData,
                  stock: variantStock,
                  price: variantPrice !== null ? variantPrice : undefined,
                });
              }
            }

            const vendorIdString = String(vendorId);

            // Create product with variants
            const product = await ctx.db.create({
              collection: "products",
              data: {
                name: String(firstRow.name),
                description,
                price,
                vendor: vendorIdString,
                isPrivate: true, // All imports are drafts
                isArchived: false,
                refundPolicy: (firstRow.refundPolicy as any) || "30-day",
                variants: variants.length > 0 ? variants : undefined,
              },
            });

            console.log("[BULK IMPORT] Created product:", {
              id: product.id,
              name: product.name,
              variants: variants.length,
              vendor: typeof product.vendor === "string" ? product.vendor : product.vendor?.id,
              isPrivate: product.isPrivate,
            });

            productIds.push(product.id);
            successCount++;
          } catch (error: any) {
            // Mark all rows for this product as failed
            for (const { rowIndex } of rows) {
              failedCount++;
              const errorMessage = error.message || String(error);
              console.log("[BULK IMPORT] Row failed:", {
                row: rowIndex + 2,
                productName,
                error: errorMessage,
              });
              errors.push({
                row: rowIndex + 2,
                errors: [errorMessage],
              });
            }
          }
        }

        console.log("[BULK IMPORT] Import complete:", {
          success: successCount,
          failed: failedCount,
          totalRows: records.length,
          vendorId,
        });

        return {
          success: successCount,
          failed: failedCount,
          errors,
          productIds,
        };
      }),
  }),

  orders: createTRPCRouter({
    // Task 4.1-4.10: Orders list with filters, search, sorting, pagination - tRPC procedure using vendorProcedure middleware, Payload where clause with vendor filter
    list: vendorProcedure
      .input(
        z.object({
          status: z.enum(["all", "pending", "payment_done", "processing", "complete", "canceled", "refunded"]).optional().default("all"),
          search: z.string().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
          sortBy: z.enum(["createdAt", "total", "status"]).default("createdAt"),
          sortOrder: z.enum(["asc", "desc"]).default("desc"),
        })
      )
      .query(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;
        
        // Build where clause - always filter by vendor
        const where: Where = {
          vendor: { equals: vendorId },
        };

        // Status filter
        if (input.status && input.status !== "all") {
          where.status = { equals: input.status };
        }

        // Date range filter
        if (input.dateFrom || input.dateTo) {
          where.createdAt = {};
          if (input.dateFrom) {
            where.createdAt.greater_than_equal = input.dateFrom;
          }
          if (input.dateTo) {
            where.createdAt.less_than_equal = input.dateTo;
          }
        }

        // Search filter - order number, customer name, or email
        if (input.search) {
          where.or = [
            { orderNumber: { contains: input.search } },
            { name: { contains: input.search } },
          ];
        }

        // Build sort
        const sort: Sort = `${input.sortOrder === "desc" ? "-" : ""}${input.sortBy}`;

        // Execute query
        const result = await ctx.db.find({
          collection: "orders",
          where,
          limit: input.limit,
          page: input.page,
          sort,
          depth: 2, // Include user (customer) and product relationships
        });

        return {
          docs: result.docs,
          totalDocs: result.totalDocs,
          totalPages: result.totalPages,
          page: result.page,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        };
      }),

    // Task 4.11: Get single order - verify vendor ownership, depth 2 for relationships
    getOne: vendorProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;
        
        const order = await ctx.db.findByID({
          collection: "orders",
          id: input.id,
          depth: 2,
        });

        // Verify ownership
        const orderVendorId = typeof order.vendor === "string" 
          ? order.vendor 
          : order.vendor?.id;
        
        if (orderVendorId !== vendorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this order",
          });
        }

        return order;
      }),

    // Create manual order
    create: vendorProcedure
      .input(manualOrderCreateInputSchema)
      .mutation(async ({ ctx, input }) => {
        const vendorId =
          typeof ctx.session.vendor === 'string' ? ctx.session.vendor : ctx.session.vendor.id;

        try {
          return await createManualOrder(ctx.db, input, { expectedVendorId: vendorId });
        } catch (error: unknown) {
          if (error instanceof TRPCError) throw error;
          const message = error instanceof Error ? error.message : 'Failed to create order';
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }
      }),

    // Task 4.17: Update order status - verify vendor ownership, update status and statusHistory
    updateStatus: vendorProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.enum(["pending", "payment_done", "processing", "complete", "canceled", "refunded"]),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;
        
        // Fetch order and verify ownership
        const order = await ctx.db.findByID({
          collection: "orders",
          id: input.id,
          depth: 0,
        });

        const orderVendorId = typeof order.vendor === "string" 
          ? order.vendor 
          : order.vendor?.id;
        
        if (orderVendorId !== vendorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this order",
          });
        }

        // Update order status - statusHistory is handled by collection hook
        const updatedOrder = await ctx.db.update({
          collection: "orders",
          id: input.id,
          data: {
            status: input.status,
            // Note will be added to statusHistory by the hook
          },
        });

        return updatedOrder;
      }),

    // Task 4.18: Update tracking information - verify vendor ownership, update tracking fields
    updateTracking: vendorProcedure
      .input(
        z.object({
          id: z.string(),
          trackingNumber: z.string().min(1, "Tracking number is required"),
          carrier: z.enum(["usps", "fedex", "ups", "dhl", "other"]),
          trackingUrl: z.string().optional(),
          estimatedDelivery: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;
        
        // Fetch order and verify ownership
        const order = await ctx.db.findByID({
          collection: "orders",
          id: input.id,
          depth: 0,
        });

        const orderVendorId = typeof order.vendor === "string" 
          ? order.vendor 
          : order.vendor?.id;
        
        if (orderVendorId !== vendorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this order",
          });
        }

        // Generate tracking URL based on carrier if not provided
        let trackingUrl = input.trackingUrl;
        if (!trackingUrl && input.carrier !== "other") {
          const trackingUrls: Record<string, string> = {
            usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${input.trackingNumber}`,
            fedex: `https://www.fedex.com/fedextrack/?trknbr=${input.trackingNumber}`,
            ups: `https://www.ups.com/track?tracknum=${input.trackingNumber}`,
            dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${input.trackingNumber}`,
          };
          trackingUrl = trackingUrls[input.carrier] || "";
        }

        // Update order with tracking information
        const updatedOrder = await ctx.db.update({
          collection: "orders",
          id: input.id,
          data: {
            trackingNumber: input.trackingNumber,
            carrier: input.carrier,
            trackingUrl: trackingUrl || undefined,
            estimatedDelivery: input.estimatedDelivery || undefined,
            // Auto-update shipping status to "shipped" when tracking is added
            shippingStatus: "shipped",
          },
        });

        return updatedOrder;
      }),

    // Task 4.14: Update shipping information - verify vendor ownership, update shipping fields
    updateShipping: vendorProcedure
      .input(
        z.object({
          id: z.string(),
          shippingAddress: z.object({
            fullName: z.string().min(1, "Full name is required"),
            phone: z.string().optional(),
            street: z.string().min(1, "Street address is required"),
            city: z.string().min(1, "City is required"),
            state: z.string().length(2, "State must be 2 characters"),
            zipcode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
            country: z.string().optional().default("United States"),
          }).optional(),
          shippingMethod: z.enum(["standard", "express", "overnight", "international", "local", "pickup"]).optional(),
          shippingCost: z.number().min(0).optional(),
          shippingStatus: z.enum([
            "pending",
            "label_created",
            "shipped",
            "in_transit",
            "out_for_delivery",
            "delivered",
            "exception",
            "returned",
          ]).optional(),
          actualDeliveryDate: z.string().optional(),
          shippingLabelUrl: z.string().url().optional(),
          packageWeight: z.number().min(0).optional(),
          packageDimensions: z.object({
            length: z.number().min(0).optional(),
            width: z.number().min(0).optional(),
            height: z.number().min(0).optional(),
          }).optional(),
          insuranceValue: z.number().min(0).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;
        
        // Fetch order and verify ownership
        const order = await ctx.db.findByID({
          collection: "orders",
          id: input.id,
          depth: 0,
        });

        const orderVendorId = typeof order.vendor === "string" 
          ? order.vendor 
          : order.vendor?.id;
        
        if (orderVendorId !== vendorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this order",
          });
        }

        // Build update data object with only provided fields
        const updateData: any = {};
        
        if (input.shippingAddress) {
          updateData.shippingAddress = input.shippingAddress;
        }
        if (input.shippingMethod !== undefined) {
          updateData.shippingMethod = input.shippingMethod;
        }
        if (input.shippingCost !== undefined) {
          updateData.shippingCost = input.shippingCost;
        }
        if (input.shippingStatus !== undefined) {
          updateData.shippingStatus = input.shippingStatus;
        }
        if (input.actualDeliveryDate !== undefined) {
          updateData.actualDeliveryDate = input.actualDeliveryDate || undefined;
        }
        if (input.shippingLabelUrl !== undefined) {
          updateData.shippingLabelUrl = input.shippingLabelUrl || undefined;
        }
        if (input.packageWeight !== undefined) {
          updateData.packageWeight = input.packageWeight || undefined;
        }
        if (input.packageDimensions !== undefined) {
          updateData.packageDimensions = input.packageDimensions || undefined;
        }
        if (input.insuranceValue !== undefined) {
          updateData.insuranceValue = input.insuranceValue || undefined;
        }

        // Update order with shipping information
        const updatedOrder = await ctx.db.update({
          collection: "orders",
          id: input.id,
          data: updateData,
        });

        return updatedOrder;
      }),
  }),

  // Task 5.1-5.8: Customers list with filters, search, sorting, pagination - tRPC procedure using vendorProcedure middleware
  // Customers are now stored in a separate collection, created automatically when orders are created
  customers: createTRPCRouter({
    list: vendorProcedure
      .input(
        z.object({
          search: z.string().optional(),
          status: z.enum(["all", "active", "inactive", "new"]).optional().default("all"),
          orderCountMin: z.number().optional(),
          orderCountMax: z.number().optional(),
          totalSpentMin: z.number().optional(),
          totalSpentMax: z.number().optional(),
          lastOrderDays: z.number().optional(),
          sortBy: z.enum(["name", "totalSpent", "totalOrders", "lastOrderDate"]).optional().default("lastOrderDate"),
          sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
          page: z.number().min(1).optional().default(1),
          limit: z.number().min(1).max(100).optional().default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;

        // Query orders directly from this vendor to get customers
        // This ensures we show all customers who have placed orders, even if customer records don't exist
        const ordersWhere: Where = {
          vendor: { equals: vendorId },
        };

        // Get all orders for this vendor
        const allOrders = await ctx.db.find({
          collection: "orders",
          where: ordersWhere,
          limit: 10000, // Get all orders
          depth: 2, // Include user and product relationships
          sort: "-createdAt",
        });

        // Group orders by user ID to create customer list
        const customersMap: Record<string, {
          user: any;
          orders: any[];
          userId: string;
        }> = {};

        allOrders.docs.forEach((order: any) => {
          const userId = typeof order.user === "string" ? order.user : order.user?.id;
          if (!userId) return;

          if (!customersMap[userId]) {
            const user = typeof order.user === "string" ? null : order.user;
            customersMap[userId] = {
              user: user || order.user,
              orders: [],
              userId,
            };
          }
          customersMap[userId].orders.push(order);
        });

        // Convert map to array and apply filters
        let customers = Object.values(customersMap).map((customerData) => {
          const user = customerData.user;
          const userId = customerData.userId;
          const orders = customerData.orders;
          
          // Get user details
          const userName = typeof user === "object" && user?.name 
            ? user.name 
            : typeof user === "object" && user?.email 
            ? user.email 
            : "Unknown";
          const userEmail = typeof user === "object" && user?.email 
            ? user.email 
            : "";

          // Calculate totals from orders
          const totalAmountPaid = orders.reduce((sum: number, order: any) => {
            return sum + (order.total || 0);
          }, 0);

          // Get order dates
          const orderDates = orders.map((o: any) => new Date(o.createdAt)).sort((a, b) => b.getTime() - a.getTime());
          const lastOrderDate = orderDates.length > 0 ? orderDates[0] : null;
          const firstOrderDate = orderDates.length > 0 ? orderDates[orderDates.length - 1] : null;

          return {
            user: user || userId,
            orders: orders,
            totalSpent: totalAmountPaid,
            totalAmountPaid,
            orderCount: orders.length,
            averageOrderValue: orders.length > 0 ? totalAmountPaid / orders.length : 0,
            lastOrderDate,
            firstOrderDate,
            customerId: userId,
            name: userName,
            email: userEmail,
          };
        });

        // Apply search filter
        if (input.search) {
          const searchLower = input.search.toLowerCase();
          customers = customers.filter((c) => {
            const nameMatch = c.name?.toLowerCase().includes(searchLower);
            const emailMatch = c.email?.toLowerCase().includes(searchLower);
            return nameMatch || emailMatch;
          });
        }

        // Apply status filter
        if (input.status !== "all") {
          const now = new Date();
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          customers = customers.filter((c) => {
            if (!c.lastOrderDate) return input.status === "inactive";
            
            if (input.status === "active") {
              return c.lastOrderDate >= ninetyDaysAgo;
            } else if (input.status === "inactive") {
              return c.lastOrderDate < ninetyDaysAgo;
            } else if (input.status === "new") {
              return c.orderCount === 1 && c.firstOrderDate && c.firstOrderDate >= thirtyDaysAgo;
            }
            return true;
          });
        }

        // Apply order count filter
        if (input.orderCountMin !== undefined || input.orderCountMax !== undefined) {
          customers = customers.filter((c) => {
            if (input.orderCountMin !== undefined && input.orderCountMax !== undefined) {
              return c.orderCount >= input.orderCountMin && c.orderCount <= input.orderCountMax;
            } else if (input.orderCountMin !== undefined) {
              return c.orderCount >= input.orderCountMin;
            } else if (input.orderCountMax !== undefined) {
              return c.orderCount <= input.orderCountMax;
            }
            return true;
          });
        }

        // Apply total spent filter
        if (input.totalSpentMin !== undefined || input.totalSpentMax !== undefined) {
          customers = customers.filter((c) => {
            if (input.totalSpentMin !== undefined && input.totalSpentMax !== undefined) {
              return c.totalAmountPaid >= input.totalSpentMin && c.totalAmountPaid <= input.totalSpentMax;
            } else if (input.totalSpentMin !== undefined) {
              return c.totalAmountPaid >= input.totalSpentMin;
            } else if (input.totalSpentMax !== undefined) {
              return c.totalAmountPaid <= input.totalSpentMax;
            }
            return true;
          });
        }

        // Apply last order date filter
        if (input.lastOrderDays !== undefined) {
          const daysAgo = new Date(Date.now() - input.lastOrderDays * 24 * 60 * 60 * 1000);
          customers = customers.filter((c) => {
            return c.lastOrderDate && c.lastOrderDate >= daysAgo;
          });
        }

        // Apply sorting
        customers.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          if (input.sortBy === "name") {
            aValue = a.name || "";
            bValue = b.name || "";
          } else if (input.sortBy === "totalSpent") {
            aValue = a.totalAmountPaid || 0;
            bValue = b.totalAmountPaid || 0;
          } else if (input.sortBy === "totalOrders") {
            aValue = a.orderCount || 0;
            bValue = b.orderCount || 0;
          } else {
            // lastOrderDate
            aValue = a.lastOrderDate?.getTime() || 0;
            bValue = b.lastOrderDate?.getTime() || 0;
          }

          if (input.sortOrder === "asc") {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          }
        });

        // Apply pagination
        const totalDocs = customers.length;
        const totalPages = Math.ceil(totalDocs / input.limit);
        const startIndex = (input.page - 1) * input.limit;
        const endIndex = startIndex + input.limit;
        const paginatedCustomers = customers.slice(startIndex, endIndex);

        return {
          docs: paginatedCustomers,
          totalDocs,
          totalPages,
          page: input.page,
          hasNextPage: input.page < totalPages,
          hasPrevPage: input.page > 1,
        };
      }),

    getOne: vendorProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string" 
          ? ctx.session.vendor 
          : ctx.session.vendor.id;

        // Get customer by user ID
        const customers = await ctx.db.find({
          collection: "customers",
          where: {
            user: { equals: input.id },
            vendors: { contains: vendorId },
          },
          depth: 1,
          limit: 1,
        });

        if (customers.docs.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer not found or has no orders from this vendor",
          });
        }

        const customer = customers.docs[0];

        // Get orders for this customer from this vendor
        const orders = await ctx.db.find({
          collection: "orders",
          where: {
            vendor: { equals: vendorId },
            user: { equals: input.id },
          },
          depth: 1,
          limit: 1000,
          sort: "-createdAt",
        });

        // Calculate vendor-specific statistics
        const vendorTotalSpent = orders.docs.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
        const vendorOrderCount = orders.docs.length;
        const vendorAverageOrderValue = vendorOrderCount > 0 ? vendorTotalSpent / vendorOrderCount : 0;
        const lastOrderDate = orders.docs.length > 0 
          ? new Date(orders.docs[0].createdAt)
          : customer.lastOrderDate 
            ? new Date(customer.lastOrderDate)
            : null;

        // Determine status
        const now = new Date();
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        let status = "inactive";
        if (lastOrderDate && lastOrderDate >= ninetyDaysAgo) {
          status = "active";
        } else if (vendorOrderCount === 1 && lastOrderDate && lastOrderDate >= thirtyDaysAgo) {
          status = "new";
        }

        const user = typeof customer.user === "string" 
          ? await ctx.db.findByID({ collection: "users", id: customer.user, depth: 0 })
          : customer.user;

        return {
          user,
          customer,
          orders: orders.docs,
          totalSpent: vendorTotalSpent,
          orderCount: vendorOrderCount,
          averageOrderValue: vendorAverageOrderValue,
          lastOrderDate,
          status,
        };
      }),
  }),

  // Dashboard Statistics
  dashboard: createTRPCRouter({
    getMarketingProfile: vendorProcedure.query(async ({ ctx }) => {
      const vendorId =
        typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

      const vendor = await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 1,
      });

      return toMarketingProfileResponse(vendor as Vendor);
    }),

    updateMarketingProfile: vendorProcedure
      .input(marketingProfileUpdateBodySchema)
      .mutation(async ({ ctx, input }) => {
        const vendorId =
          typeof ctx.session.vendor === "string"
            ? ctx.session.vendor
            : ctx.session.vendor.id;

        await updateVendorMarketingProfile(ctx.db, vendorId, input, {
          overrideAccess: true,
        });

        const updatedVendor = await ctx.db.findByID({
          collection: "vendors",
          id: vendorId,
          depth: 1,
        });

        return toMarketingProfileResponse(updatedVendor as Vendor);
      }),

    stats: vendorProcedure.query(async ({ ctx }) => {
      const vendorId = typeof ctx.session.vendor === "string" 
        ? ctx.session.vendor 
        : ctx.session.vendor.id;

      // Get total products count
      const productsResult = await ctx.db.find({
        collection: "products",
        where: {
          vendor: { equals: vendorId },
          isArchived: { equals: false },
        },
        limit: 0, // Just get count
      });

      // Get all orders for revenue calculation
      const allOrdersResult = await ctx.db.find({
        collection: "orders",
        where: {
          vendor: { equals: vendorId },
        },
        limit: 1000, // Get all orders for revenue calculation
        depth: 0,
      });

      // Get pending orders count
      const pendingOrdersResult = await ctx.db.find({
        collection: "orders",
        where: {
          vendor: { equals: vendorId },
          status: { equals: "pending" },
        },
        limit: 0, // Just get count
      });

      // Calculate total revenue from all orders
      const totalRevenue = allOrdersResult.docs.reduce((sum: number, order: any) => {
        return sum + (order.total || 0);
      }, 0);

      return {
        totalProducts: productsResult.totalDocs,
        totalOrders: allOrdersResult.totalDocs,
        totalRevenue,
        pendingOrders: pendingOrdersResult.totalDocs,
      };
    }),
  }),

  // Analytics & Reports
  analytics: createTRPCRouter({
      // Task 6.3: Daily report data aggregation
      getDailyReport: vendorProcedure.query(async ({ ctx }) => {
        const vendorId = ctx.session.vendor.id || ctx.session.vendor;
        const now = new Date();
        const startDate = startOfDay(now);
        const endDate = endOfDay(now);

        // Fetch orders for today
        const ordersResult = await ctx.db.find({
          collection: "orders",
          where: {
            vendor: { equals: vendorId },
            createdAt: {
              greater_than_equal: startDate.toISOString(),
              less_than_equal: endDate.toISOString(),
            },
            status: { not_equals: "canceled" },
          },
          depth: 1,
          limit: 1000,
        });

        // Fetch all products for inventory
        const productsResult = await ctx.db.find({
          collection: "products",
          where: {
            vendor: { equals: vendorId },
          },
          depth: 0,
          limit: 1000,
        });

        // Aggregate order data
        const orders = ordersResult.docs;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Status breakdown
        const statusBreakdown: Record<string, number> = {};
        orders.forEach((order: any) => {
          const status = order.status || "pending";
          statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        });

        // Top products (by revenue)
        const productRevenue: Record<string, { name: string; revenue: number; quantity: number }> = {};
        orders.forEach((order: any) => {
          const productId = typeof order.product === "string" ? order.product : order.product?.id;
          const product = productsResult.docs.find((p: any) => p.id === productId);
          if (product) {
            if (!productRevenue[productId]) {
              productRevenue[productId] = {
                name: product.name || "Unknown",
                revenue: 0,
                quantity: 0,
              };
            }
            productRevenue[productId].revenue += order.total || 0;
            productRevenue[productId].quantity += order.quantity || 1;
          }
        });
        const topProducts = Object.values(productRevenue)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Aggregate inventory data
        const products = productsResult.docs;
        const totalProducts = products.length;
        const lowStockThreshold = 10;
        const lowStockProducts = products.filter((p: any) => (p.stock || 0) > 0 && (p.stock || 0) <= lowStockThreshold);
        const outOfStockProducts = products.filter((p: any) => (p.stock || 0) === 0);
        const totalInventoryValue = products.reduce((sum: number, p: any) => {
          return sum + ((p.stock || 0) * (p.price || 0));
        }, 0);

        return {
          orders: {
            total: totalOrders,
            revenue: totalRevenue,
            averageOrderValue,
            statusBreakdown,
            topProducts,
          },
          inventory: {
            totalProducts,
            lowStockCount: lowStockProducts.length,
            outOfStockCount: outOfStockProducts.length,
            totalInventoryValue,
            lowStockProducts: lowStockProducts.slice(0, 5).map((p: any) => ({
              name: p.name || "Unknown",
              stock: p.stock || 0,
            })),
          },
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        };
      }),

      // Task 6.4: Weekly report data aggregation
      getWeeklyReport: vendorProcedure.query(async ({ ctx }) => {
        const vendorId = ctx.session.vendor.id || ctx.session.vendor;
        const now = new Date();
        const startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const endDate = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

        // Fetch orders for this week
        const ordersResult = await ctx.db.find({
          collection: "orders",
          where: {
            vendor: { equals: vendorId },
            createdAt: {
              greater_than_equal: startDate.toISOString(),
              less_than_equal: endDate.toISOString(),
            },
            status: { not_equals: "canceled" },
          },
          depth: 1,
          limit: 1000,
        });

        // Fetch all products for inventory
        const productsResult = await ctx.db.find({
          collection: "products",
          where: {
            vendor: { equals: vendorId },
          },
          depth: 0,
          limit: 1000,
        });

        // Aggregate order data (same logic as daily)
        const orders = ordersResult.docs;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const statusBreakdown: Record<string, number> = {};
        orders.forEach((order: any) => {
          const status = order.status || "pending";
          statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        });

        const productRevenue: Record<string, { name: string; revenue: number; quantity: number }> = {};
        orders.forEach((order: any) => {
          const productId = typeof order.product === "string" ? order.product : order.product?.id;
          const product = productsResult.docs.find((p: any) => p.id === productId);
          if (product) {
            if (!productRevenue[productId]) {
              productRevenue[productId] = {
                name: product.name || "Unknown",
                revenue: 0,
                quantity: 0,
              };
            }
            productRevenue[productId].revenue += order.total || 0;
            productRevenue[productId].quantity += order.quantity || 1;
          }
        });
        const topProducts = Object.values(productRevenue)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Aggregate inventory data
        const products = productsResult.docs;
        const totalProducts = products.length;
        const lowStockThreshold = 10;
        const lowStockProducts = products.filter((p: any) => (p.stock || 0) > 0 && (p.stock || 0) <= lowStockThreshold);
        const outOfStockProducts = products.filter((p: any) => (p.stock || 0) === 0);
        const totalInventoryValue = products.reduce((sum: number, p: any) => {
          return sum + ((p.stock || 0) * (p.price || 0));
        }, 0);

        return {
          orders: {
            total: totalOrders,
            revenue: totalRevenue,
            averageOrderValue,
            statusBreakdown,
            topProducts,
          },
          inventory: {
            totalProducts,
            lowStockCount: lowStockProducts.length,
            outOfStockCount: outOfStockProducts.length,
            totalInventoryValue,
            lowStockProducts: lowStockProducts.slice(0, 5).map((p: any) => ({
              name: p.name || "Unknown",
              stock: p.stock || 0,
            })),
          },
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        };
      }),

      // Task 6.5: Monthly report data aggregation
      getMonthlyReport: vendorProcedure.query(async ({ ctx }) => {
        const vendorId = ctx.session.vendor.id || ctx.session.vendor;
        const now = new Date();
        const startDate = startOfMonth(now);
        const endDate = endOfMonth(now);

        // Fetch orders for this month
        const ordersResult = await ctx.db.find({
          collection: "orders",
          where: {
            vendor: { equals: vendorId },
            createdAt: {
              greater_than_equal: startDate.toISOString(),
              less_than_equal: endDate.toISOString(),
            },
            status: { not_equals: "canceled" },
          },
          depth: 1,
          limit: 1000,
        });

        // Fetch all products for inventory
        const productsResult = await ctx.db.find({
          collection: "products",
          where: {
            vendor: { equals: vendorId },
          },
          depth: 0,
          limit: 1000,
        });

        // Aggregate order data (same logic as daily)
        const orders = ordersResult.docs;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const statusBreakdown: Record<string, number> = {};
        orders.forEach((order: any) => {
          const status = order.status || "pending";
          statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        });

        const productRevenue: Record<string, { name: string; revenue: number; quantity: number }> = {};
        orders.forEach((order: any) => {
          const productId = typeof order.product === "string" ? order.product : order.product?.id;
          const product = productsResult.docs.find((p: any) => p.id === productId);
          if (product) {
            if (!productRevenue[productId]) {
              productRevenue[productId] = {
                name: product.name || "Unknown",
                revenue: 0,
                quantity: 0,
              };
            }
            productRevenue[productId].revenue += order.total || 0;
            productRevenue[productId].quantity += order.quantity || 1;
          }
        });
        const topProducts = Object.values(productRevenue)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Aggregate inventory data
        const products = productsResult.docs;
        const totalProducts = products.length;
        const lowStockThreshold = 10;
        const lowStockProducts = products.filter((p: any) => (p.stock || 0) > 0 && (p.stock || 0) <= lowStockThreshold);
        const outOfStockProducts = products.filter((p: any) => (p.stock || 0) === 0);
        const totalInventoryValue = products.reduce((sum: number, p: any) => {
          return sum + ((p.stock || 0) * (p.price || 0));
        }, 0);

        return {
          orders: {
            total: totalOrders,
            revenue: totalRevenue,
            averageOrderValue,
            statusBreakdown,
            topProducts,
          },
          inventory: {
            totalProducts,
            lowStockCount: lowStockProducts.length,
            outOfStockCount: outOfStockProducts.length,
            totalInventoryValue,
            lowStockProducts: lowStockProducts.slice(0, 5).map((p: any) => ({
              name: p.name || "Unknown",
              stock: p.stock || 0,
            })),
          },
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        };
      }),

      // Task 6.6: LLM summary generation with caching
      generateSummary: vendorProcedure
        .input(
          z.object({
            reportType: z.enum(["daily", "weekly", "monthly"]),
            reportData: z.any(), // Report data structure
          })
        )
        .query(async ({ ctx, input }) => {
          const vendorId = ctx.session.vendor.id || ctx.session.vendor;
          const { reportType, reportData } = input;

          // Task 6.12: Check cache first (CRITICAL for cost optimization)
          const now = new Date();
          let cacheKey = "";
          let cacheExpiry = new Date();

          if (reportType === "daily") {
            const dateStr = startOfDay(now).toISOString().split("T")[0];
            cacheKey = `analytics-summary-${vendorId}-daily-${dateStr}`;
            cacheExpiry = endOfDay(now);
          } else if (reportType === "weekly") {
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            const dateStr = weekStart.toISOString().split("T")[0];
            cacheKey = `analytics-summary-${vendorId}-weekly-${dateStr}`;
            cacheExpiry = endOfWeek(now, { weekStartsOn: 1 });
          } else {
            const monthStart = startOfMonth(now);
            const dateStr = monthStart.toISOString().split("T")[0];
            cacheKey = `analytics-summary-${vendorId}-monthly-${dateStr}`;
            cacheExpiry = endOfMonth(now);
          }

          // Check if cached summary exists (using in-memory cache for now)
          // TODO: Implement database cache in AnalyticsSummaries collection
          // For now, we'll always call LLM (can be optimized later)

          // Task 6.7: Format data for LLM prompt (compressed, <500 tokens)
          const { orders, inventory } = reportData;
          const prompt = `Generate a concise 2-3 paragraph business summary for a vendor's ${reportType} report.

Key Metrics:
- Orders: ${orders.total} orders, $${orders.revenue.toFixed(2)} revenue, $${orders.averageOrderValue.toFixed(2)} average order value
- Status: ${JSON.stringify(orders.statusBreakdown)}
- Top Products: ${orders.topProducts?.slice(0, 3).map((p: any) => `${p.name} ($${p.revenue.toFixed(2)})`).join(", ") || "None"}
- Inventory: ${inventory.totalProducts} products, ${inventory.lowStockCount} low stock, ${inventory.outOfStockCount} out of stock

Provide actionable insights and recommendations. Keep it concise (2-3 paragraphs max).`;

          // Task 6.6: Call LLM API (gpt-4o-mini for cost optimization)
          try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "OpenAI API key not configured",
              });
            }

            const openai = new OpenAI({ apiKey });
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are a business analyst. Generate concise, actionable summaries for e-commerce vendor reports.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              max_tokens: 300,
              temperature: 0.7,
            });

            const summary = completion.choices[0]?.message?.content || "Unable to generate summary.";

            // TODO: Save to cache (database or in-memory)
            // For now, just return the summary

            return {
              summary,
              generatedAt: new Date(),
              cached: false,
            };
          } catch (error: any) {
            console.error("[Analytics] LLM error:", error);
            
            // Task 6.14: Fallback to formatted statistics with helpful error message
            let errorMessage = "Summary unavailable.";
            
            if (error.code === "insufficient_quota" || error.status === 429) {
              errorMessage = "OpenAI quota exceeded. Please add a payment method to your OpenAI account or check your billing settings. Showing statistics below.";
            } else if (error.message?.includes("API key")) {
              errorMessage = "OpenAI API key issue. Please check your API key configuration.";
            } else {
              errorMessage = "Unable to generate AI summary. Showing statistics below.";
            }
            
            return {
              summary: `${errorMessage}\n\nStatistics: ${orders.total} orders, $${orders.revenue.toFixed(2)} revenue, $${orders.averageOrderValue.toFixed(2)} average order value. ${inventory.lowStockCount} low stock items, ${inventory.outOfStockCount} out of stock.`,
              generatedAt: new Date(),
              cached: false,
              error: error.message,
            };
          }
        }),
  }),

  // Stripe Connect Procedures
  createStripeAccount: vendorProcedure
    .mutation(async ({ ctx }) => {
      const vendorId = ctx.session.vendor.id;
      const vendor = await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 0,
      });

      // Check if vendor already has a Stripe account
      if (vendor.stripeAccountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vendor already has a Stripe account connected",
        });
      }

      // Check if vendor is approved
      if (vendor.status !== "approved" || !vendor.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vendor must be approved and active to connect Stripe account",
        });
      }

      try {
        // Create Stripe Connect account
        const stripeAccountId = await createStripeConnectAccount(
          vendor.email,
          vendor.name
        );

        // Generate onboarding link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const onboardingLink = await createStripeOnboardingLink(
          stripeAccountId,
          `${baseUrl}/vendor/stripe-onboarding?success=true`,
          `${baseUrl}/vendor/stripe-onboarding?refresh=true`
        );

        // Update vendor with Stripe account info
        await ctx.db.update({
          collection: "vendors",
          id: vendorId,
          data: {
            stripeAccountId,
            stripeAccountStatus: "pending",
            stripeOnboardingLink: onboardingLink,
            stripeOnboardingCompleted: false,
          },
        });

        return {
          accountId: stripeAccountId,
          onboardingLink,
        };
      } catch (error: any) {
        console.error("Error creating Stripe Connect account:", error);
        
        // Provide more specific error codes
        if (error.message?.includes("Stripe Connect is not enabled")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create Stripe Connect account",
        });
      }
    }),

  getStripeAccountStatus: vendorProcedure
    .query(async ({ ctx }) => {
      const vendorId = ctx.session.vendor.id;
      const vendor = await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 0,
      });

      if (!vendor.stripeAccountId) {
        return {
          connected: false,
          status: "not_connected" as const,
          onboardingCompleted: false,
        };
      }

      try {
        const accountStatus = await getStripeAccountStatus(vendor.stripeAccountId);
        const isReady = await isStripeAccountReady(vendor.stripeAccountId);

        // Sync full vendor Stripe details
        const stripeDetails = await syncVendorStripeDetails(vendor.stripeAccountId);

        // Update vendor with all Stripe details
        await ctx.db.update({
          collection: "vendors",
          id: vendorId,
          data: stripeDetails,
        });

        return {
          connected: true,
          status: accountStatus.status,
          onboardingCompleted: accountStatus.detailsSubmitted,
          chargesEnabled: accountStatus.chargesEnabled,
          payoutsEnabled: accountStatus.payoutsEnabled,
          isReady,
          accountId: vendor.stripeAccountId,
        };
      } catch (error: any) {
        console.error("Error getting Stripe account status:", error);
        return {
          connected: true,
          status: vendor.stripeAccountStatus || "pending",
          onboardingCompleted: vendor.stripeOnboardingCompleted || false,
          error: error.message,
        };
      }
    }),

  refreshOnboardingLink: vendorProcedure
    .mutation(async ({ ctx }) => {
      const vendorId = ctx.session.vendor.id;
      const vendor = await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 0,
      });

      if (!vendor.stripeAccountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vendor does not have a Stripe account. Please create one first.",
        });
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const onboardingLink = await createStripeOnboardingLink(
          vendor.stripeAccountId,
          `${baseUrl}/vendor/stripe-onboarding?success=true`,
          `${baseUrl}/vendor/stripe-onboarding?refresh=true`
        );

        // Update vendor with new onboarding link
        await ctx.db.update({
          collection: "vendors",
          id: vendorId,
          data: {
            stripeOnboardingLink: onboardingLink,
          },
        });

        return { onboardingLink };
      } catch (error: any) {
        console.error("Error refreshing onboarding link:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to refresh onboarding link",
        });
      }
    }),

  syncStripeDetails: vendorProcedure
    .mutation(async ({ ctx }) => {
      const vendorId = ctx.session.vendor.id;
      const vendor = await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 0,
      });

      if (!vendor.stripeAccountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vendor does not have a Stripe account. Please create one first.",
        });
      }

      try {
        // Fetch and sync full Stripe account details
        const stripeDetails = await syncVendorStripeDetails(vendor.stripeAccountId);

        // Update vendor with all Stripe details
        await ctx.db.update({
          collection: "vendors",
          id: vendorId,
          data: stripeDetails,
        });

        return {
          success: true,
          message: "Stripe account details synced successfully",
          details: stripeDetails,
        };
      } catch (error: any) {
        console.error("Error syncing Stripe details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to sync Stripe account details",
        });
      }
    }),

  updatePaymentStatus: vendorProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentStatus: z.enum(["pending", "completed", "failed"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendorId = ctx.session.vendor.id;

      // Fetch order and validate vendor ownership
      const order = await ctx.db.findByID({
        collection: "orders",
        id: input.orderId,
        depth: 1,
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const orderVendorId = typeof order.vendor === "string"
        ? order.vendor
        : order.vendor?.id;

      if (orderVendorId !== vendorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update payment status for your own orders",
        });
      }

      // Only allow updating offline payment orders
      if (order.paymentMethod !== "offline") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment status can only be updated for offline payment orders",
        });
      }

      // Update order
      const updatedOrder = await ctx.db.update({
        collection: "orders",
        id: input.orderId,
        data: {
          paymentStatus: input.paymentStatus,
          ...(input.paymentStatus === "completed" && {
            status: "payment_done", // Move order to payment_done status (matching Stripe flow)
          }),
          ...(input.notes && {
            offlinePaymentNotes: input.notes,
          }),
        },
      });

      // Send email notification to customer when payment is marked as completed
      if (input.paymentStatus === "completed" && order.user) {
        try {
          const user = typeof order.user === "string"
            ? await ctx.db.findByID({ collection: "users", id: order.user, depth: 0 })
            : order.user;

          if (user?.email) {
            const { sendPaymentReceivedConfirmation } = await import("@/lib/email");
            await sendPaymentReceivedConfirmation(
              user.email,
              order.orderNumber,
              order.total
            );
          }
        } catch (error) {
          console.error("Failed to send payment received confirmation email:", error);
          // Don't fail the update if email fails
        }
      }

      return updatedOrder;
    }),

  updateHeroBanner: vendorProcedure
    .input(
      z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        backgroundImage: z.string().optional(),
        products: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendorId = typeof ctx.session.vendor === "string"
        ? ctx.session.vendor
        : ctx.session.vendor.id;

      // Validate that selected products belong to the vendor
      if (input.products && input.products.length > 0) {
        const vendorProducts = await ctx.db.find({
          collection: "products",
          where: {
            vendor: { equals: vendorId },
            id: { in: input.products },
          },
          limit: input.products.length,
        });

        if (vendorProducts.docs.length !== input.products.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Some selected products do not belong to your vendor account",
          });
        }
      }

      // Update vendor with hero banner fields
      const updatedVendor = await ctx.db.update({
        collection: "vendors",
        id: vendorId,
        data: {
          heroBanner: {
            title: input.title,
            subtitle: input.subtitle,
            backgroundImage: input.backgroundImage,
            products: input.products,
            isActive: input.isActive,
            order: input.order,
          },
        },
      });

      return updatedVendor;
    }),

  // Vendor Hero Banners (multiple banners support)
  heroBanners: {
    list: vendorProcedure
      .query(async ({ ctx }) => {
        const vendorId = typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

        const banners = await ctx.db.find({
          collection: "vendor-hero-banners",
          where: {
            vendor: { equals: vendorId },
          },
          sort: "order",
          depth: 2, // Populate products and backgroundImage
        });

        return banners.docs;
      }),

    getOne: vendorProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

        const banner = await ctx.db.findByID({
          collection: "vendor-hero-banners",
          id: input.id,
          depth: 2,
        });

        // Verify ownership
        const bannerVendorId = typeof banner.vendor === "string" ? banner.vendor : banner.vendor?.id;
        if (bannerVendorId !== vendorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only access your own banners",
          });
        }

        return banner;
      }),

    create: vendorProcedure
      .input(
        z.object({
          title: z.string().min(1),
          subtitle: z.string().optional(),
          backgroundImage: z.string().optional(),
          products: z.array(z.string()).min(1),
          isActive: z.boolean().default(true),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const vendorId = typeof ctx.session.vendor === "string"
            ? ctx.session.vendor
            : ctx.session.vendor.id;

          console.log("[vendor.heroBanners.create] Input:", JSON.stringify(input, null, 2));
          console.log("[vendor.heroBanners.create] Vendor ID:", vendorId);

          // Validate that products array is not empty
          if (!input.products || input.products.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "At least one product is required",
            });
          }

          // Validate that selected products belong to the vendor and exist
          const vendorProducts = await ctx.db.find({
            collection: "products",
            where: {
              vendor: { equals: vendorId },
              id: { in: input.products },
            },
            limit: input.products.length,
          });

          console.log("[vendor.heroBanners.create] Vendor products found:", vendorProducts.docs.length, "of", input.products.length);

          // Check if all products were found
          if (vendorProducts.docs.length !== input.products.length) {
            const foundIds = vendorProducts.docs.map((p: any) => p.id);
            const missingIds = input.products.filter((id: string) => !foundIds.includes(id));
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Some selected products do not exist or do not belong to your vendor account. Missing IDs: ${missingIds.join(", ")}`,
            });
          }

          // Extract product IDs from validated products (they're already confirmed to exist and belong to vendor)
          const productIds = vendorProducts.docs.map((p: any) => p.id);

          // Build banner data - keep it simple like the seed script
          const bannerData: any = {
            vendor: vendorId,
            title: input.title,
            products: productIds, // Direct array of product IDs (validated above)
            isActive: input.isActive ?? true,
          };

          // Only include order if provided
          if (input.order !== undefined && input.order !== null) {
            bannerData.order = input.order;
          }

          // Only include optional fields if they have values
          if (input.subtitle && input.subtitle.trim() !== "") {
            bannerData.subtitle = input.subtitle;
          }

          if (input.backgroundImage && input.backgroundImage.trim() !== "") {
            bannerData.backgroundImage = input.backgroundImage;
          }

          console.log("[vendor.heroBanners.create] Banner data to create:", JSON.stringify(bannerData, null, 2));
          console.log("[vendor.heroBanners.create] Products array:", bannerData.products);
          console.log("[vendor.heroBanners.create] Products count:", bannerData.products.length);

          const banner = await ctx.db.create({
            collection: "vendor-hero-banners",
            data: bannerData,
          });

          console.log("[vendor.heroBanners.create] Banner created successfully:", banner.id);
          return banner;
        } catch (error: any) {
          console.error("[vendor.heroBanners.create] Error:", error);
          console.error("[vendor.heroBanners.create] Error message:", error.message);
          console.error("[vendor.heroBanners.create] Error stack:", error.stack);
          
          // If it's already a TRPCError, re-throw it
          if (error instanceof TRPCError) {
            throw error;
          }
          
          // Otherwise, wrap it in a TRPCError
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to create hero banner",
            cause: error,
          });
        }
      }),

    update: vendorProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().min(1).optional(),
          subtitle: z.string().optional(),
          backgroundImage: z.string().optional(),
          products: z.array(z.string()).optional(),
          isActive: z.boolean().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

        // Verify ownership
        const banner = await ctx.db.findByID({
          collection: "vendor-hero-banners",
          id: input.id,
          depth: 0,
        });

        const bannerVendorId = typeof banner.vendor === "string" ? banner.vendor : banner.vendor?.id;
        if (bannerVendorId !== vendorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update your own banners",
          });
        }

        // Validate products if provided
        if (input.products && input.products.length > 0) {
          const vendorProducts = await ctx.db.find({
            collection: "products",
            where: {
              vendor: { equals: vendorId },
              id: { in: input.products },
            },
            limit: input.products.length,
          });

          if (vendorProducts.docs.length !== input.products.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Some selected products do not belong to your vendor account",
            });
          }
        }

        const { id, ...updateData } = input;
        
        // Build update data, only including fields that are provided
        const dataToUpdate: any = {};
        
        if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
        if (updateData.subtitle !== undefined) dataToUpdate.subtitle = updateData.subtitle;
        if (updateData.backgroundImage !== undefined) dataToUpdate.backgroundImage = updateData.backgroundImage;
        if (updateData.products !== undefined) dataToUpdate.products = updateData.products;
        if (updateData.isActive !== undefined) dataToUpdate.isActive = updateData.isActive;
        
        // Only include order if it's explicitly provided (not undefined)
        if (updateData.order !== undefined && updateData.order !== null) {
          dataToUpdate.order = updateData.order;
        }
        
        const updatedBanner = await ctx.db.update({
          collection: "vendor-hero-banners",
          id: id,
          data: dataToUpdate,
        });

        return updatedBanner;
      }),

    delete: vendorProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

        // Verify ownership
        const banner = await ctx.db.findByID({
          collection: "vendor-hero-banners",
          id: input.id,
          depth: 0,
        });

        const bannerVendorId = typeof banner.vendor === "string" ? banner.vendor : banner.vendor?.id;
        if (bannerVendorId !== vendorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own banners",
          });
        }

        await ctx.db.delete({
          collection: "vendor-hero-banners",
          id: input.id,
        });

        return { success: true };
      }),
  },

  happyBanner: createTRPCRouter({
    list: vendorProcedure.query(async ({ ctx }) => {
      const vendorId =
        typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

      const vendor = (await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 0,
      })) as VendorWithHappyBanner;

      const platformConfig = await getHappyBannerPlatformConfig(ctx.db);
      const selectedId = getHappyBannerRelationshipId(vendor.happyBanner?.selectedBanner);

      const result = await ctx.db.find({
        collection: "happy-banners",
        where: { isActive: { equals: true } },
        sort: "name",
        limit: 100,
        depth: 1,
      });

      return {
        platformEnabled: platformConfig.enabled !== false,
        selectedBannerId: selectedId,
        word1: vendor.happyBanner?.word1?.trim() || null,
        word2: vendor.happyBanner?.word2?.trim() || null,
        docs: result.docs
          .map((banner: Record<string, unknown> & { id: string }) =>
            formatHappyBannerListItem(banner as HappyBannerDocFields & { id: string }),
          )
          .map((item: ReturnType<typeof formatHappyBannerListItem>) => ({
            ...item,
            isSelected: item.id === selectedId,
          })),
      };
    }),

    get: vendorProcedure.query(async ({ ctx }) => {
      const vendorId =
        typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

      const vendor = (await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 0,
      })) as VendorWithHappyBanner;

      const platformConfig = await getHappyBannerPlatformConfig(ctx.db);
      const selectedId = getHappyBannerRelationshipId(vendor.happyBanner?.selectedBanner);
      let vendorWordSlots: ReturnType<typeof getHappyBannerVendorWordSlots> | null = null;
      let resolved = null;
      let bannerForWords: HappyBannerDocFields | null = null;

      if (selectedId) {
        const bannerDoc = await ctx.db
          .findByID({
            collection: "happy-banners",
            id: selectedId,
            depth: 0,
          })
          .catch(() => null);

        if (bannerDoc) {
          bannerForWords = bannerDoc as HappyBannerDocFields;
          vendorWordSlots = getHappyBannerVendorWordSlots(bannerForWords);
          resolved = await resolveHappyBannerForVendor(ctx.db, vendor);
        }
      }

      const words = bannerForWords
        ? resolveVendorHappyBannerWords(bannerForWords, vendor.happyBanner)
        : { word1: "MEGA", word2: "50" };

      return {
        platformEnabled: platformConfig.enabled !== false,
        selectedBannerId: selectedId,
        selectedPreset: (bannerForWords?.preset ?? null) as HappyBannerPreset | null,
        word1: vendor.happyBanner?.word1?.trim() || words.word1,
        word2: vendor.happyBanner?.word2?.trim() || words.word2,
        vendorWordSlots,
        preview: resolved,
        fixedCopy: resolved
          ? {
              eyebrowText: resolved.eyebrowText,
              secondaryWord: resolved.secondaryWord,
              ctaLabel: resolved.ctaLabel,
              discountPrefix: resolved.discountPrefix,
              discountSuffix: resolved.discountSuffix,
              bannerName: resolved.bannerName,
            }
          : null,
      };
    }),

    select: vendorProcedure
      .input(vendorHappyBannerSelectSchema)
      .mutation(async ({ ctx, input }) => {
        const vendorId =
          typeof ctx.session.vendor === "string"
            ? ctx.session.vendor
            : ctx.session.vendor.id;

        const banner = await ctx.db
          .findByID({
            collection: "happy-banners",
            id: input.bannerId,
            depth: 0,
          })
          .catch(() => null);

        if (!banner || banner.isActive === false) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Selected banner is not available",
          });
        }

        const bannerDoc = banner as HappyBannerDocFields;
        const defaults = getHappyBannerVendorWordDefaults(bannerDoc);

        const updated = await ctx.db.update({
          collection: "vendors",
          id: vendorId,
          data: {
            happyBanner: {
              selectedBanner: input.bannerId,
              word1: defaults.word1,
              word2: defaults.word2,
            },
          },
        });

        await revalidateVendorHappyBannerStorefront(ctx.db, vendorId);

        const resolved = await resolveHappyBannerForVendor(ctx.db, updated as VendorWithHappyBanner);

        return {
          selectedBannerId: input.bannerId,
          word1: updated.happyBanner?.word1 ?? defaults.word1,
          word2: updated.happyBanner?.word2 ?? defaults.word2,
          vendorWordSlots: getHappyBannerVendorWordSlots(bannerDoc),
          preview: resolved,
        };
      }),

    update: vendorProcedure
      .input(vendorHappyBannerTextSchema)
      .mutation(async ({ ctx, input }) => {
        const vendorId =
          typeof ctx.session.vendor === "string"
            ? ctx.session.vendor
            : ctx.session.vendor.id;

        const vendor = (await ctx.db.findByID({
          collection: "vendors",
          id: vendorId,
          depth: 0,
        })) as VendorWithHappyBanner;

        if (!vendor.happyBanner?.selectedBanner) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Select a Happy Banner design before saving Word 1 and Word 2",
          });
        }

        const selectedBannerId = getHappyBannerRelationshipId(vendor.happyBanner.selectedBanner);
        if (!selectedBannerId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Select a Happy Banner design before saving Word 1 and Word 2",
          });
        }

        const bannerDoc = await ctx.db
          .findByID({
            collection: "happy-banners",
            id: selectedBannerId,
            depth: 0,
          })
          .catch(() => null);

        const preset = (bannerDoc?.preset ?? "mega-sale") as HappyBannerPreset;
        const normalized = normalizeVendorHappyBannerWords(
          preset,
          input.word1,
          input.word2,
        );

        const updated = await ctx.db.update({
          collection: "vendors",
          id: vendorId,
          data: {
            happyBanner: {
              selectedBanner: selectedBannerId,
              word1: normalized.word1,
              word2: normalized.word2,
            },
          },
        });

        await revalidateVendorHappyBannerStorefront(ctx.db, vendorId);

        const resolved = await resolveHappyBannerForVendor(ctx.db, updated as VendorWithHappyBanner);

        return {
          word1: updated.happyBanner?.word1 ?? input.word1,
          word2: updated.happyBanner?.word2 ?? input.word2,
          preview: resolved,
        };
      }),

    previewBanner: vendorProcedure
      .input(
        z.object({
          bannerId: z.string(),
          word1: z.string().optional(),
          word2: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const banner = await ctx.db
          .findByID({
            collection: "happy-banners",
            id: input.bannerId,
            depth: 0,
          })
          .catch(() => null);

        if (!banner || banner.isActive === false) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Banner not found" });
        }

        const vendorId =
          typeof ctx.session.vendor === "string"
            ? ctx.session.vendor
            : ctx.session.vendor.id;

        const vendor = await ctx.db.findByID({
          collection: "vendors",
          id: vendorId,
          depth: 0,
        });

        return buildResolvedHappyBanner(banner as HappyBannerDocFields & { id: string }, {
          word1: input.word1,
          word2: input.word2,
          vendorSlug: vendor.slug ?? "",
        });
      }),

    clear: vendorProcedure.mutation(async ({ ctx }) => {
      const vendorId =
        typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

      await ctx.db.update({
        collection: "vendors",
        id: vendorId,
        data: {
          happyBanner: {
            selectedBanner: null,
            word1: null,
            word2: null,
          },
        },
      });

      await revalidateVendorHappyBannerStorefront(ctx.db, vendorId);

      return { success: true };
    }),
  }),

  logoTemplate: vendorLogoTemplateRouter,

  // Template Management
  templates: createTRPCRouter({
    // List all available templates
    list: vendorProcedure
      .input(
        z.object({
          category: z.string().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

        // Get vendor's current template
        const vendor = await ctx.db.findByID({
          collection: "vendors",
          id: vendorId,
          depth: 0,
        });

        const where: Where = {
          isActive: { equals: true },
        };

        if (input.category) {
          where.category = { equals: input.category };
        }

        if (input.search) {
          where.or = [
            { name: { contains: input.search } },
            { description: { contains: input.search } },
          ];
        }

        const { fetchAllVendorTemplates } = await import("@/lib/templates/fetch-all-templates");
        const allTemplates = await fetchAllVendorTemplates(ctx.db, {
          where,
          sort: "name",
          depth: 1,
        });

        const selectedTemplateId =
          typeof vendor.selectedTemplate === "string"
            ? vendor.selectedTemplate
            : vendor.selectedTemplate?.id ?? null;

        const docs = allTemplates.map((template) => {
          const thumb = template.thumbnailImage;
          const preview = template.previewImage;
          const thumbnailUrl =
            typeof thumb === "object" && thumb?.url
              ? thumb.url
              : typeof preview === "object" && preview?.url
                ? preview.url
                : null;

          return {
            ...template,
            isSelected: template.id === selectedTemplateId,
            thumbnailUrl,
          };
        });

        return {
          docs,
          totalDocs: docs.length,
          vendorSlug: vendor.slug ?? null,
        };
      }),

    // Get current vendor's template and customization
    getCustomization: vendorProcedure
      .query(async ({ ctx }) => {
        const vendorId = typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

        const vendor = await ctx.db.findByID({
          collection: "vendors",
          id: vendorId,
          depth: 1, // Include template
        });

        const { resolveVendorTemplate } = await import("@/lib/templates/template-engine");
        const resolvedTemplate = await resolveVendorTemplate(vendorId, ctx.db);

        return {
          template: resolvedTemplate,
          customization: vendor.templateCustomization || {},
        };
      }),

    // Select a template
    select: vendorProcedure
      .input(z.object({ templateId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

        // Verify template exists and is active
        const template = await ctx.db.findByID({
          collection: "vendor-templates",
          id: input.templateId,
        });

        if (!template.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Template is not available",
          });
        }

        // Update vendor template
        await ctx.db.update({
          collection: "vendors",
          id: vendorId,
          data: {
            selectedTemplate: input.templateId,
            templateCustomization: {}, // Reset to defaults
          },
        });

        return { success: true };
      }),

    // Customize template
    customize: vendorProcedure
      .input(
        z.object({
          customization: z.object({
            colors: z
              .object({
                primary: z.string().optional(),
                secondary: z.string().optional(),
                accent: z.string().optional(),
                background: z.string().optional(),
                text: z.string().optional(),
                textSecondary: z.string().optional(),
                border: z.string().optional(),
                cardBackground: z.string().optional(),
              })
              .optional(),
            fonts: z
              .object({
                heading: z.string().optional(),
                body: z.string().optional(),
              })
              .optional(),
            spacing: z
              .object({
                sectionPadding: z.string().optional(),
                cardGap: z.string().optional(),
                containerMaxWidth: z.string().optional(),
              })
              .optional(),
            layout: z
              .object({
                productGridColumns: z.number().min(2).max(6).optional(),
                showBanner: z.boolean().optional(),
                showCategories: z.boolean().optional(),
                showFilters: z.boolean().optional(),
                showReviews: z.boolean().optional(),
              })
              .optional(),
            components: z
              .object({
                heroBanner: z
                  .object({
                    enabled: z.boolean().optional(),
                    style: z.enum(["minimal", "full-width", "split"]).optional(),
                    height: z.string().optional(),
                  })
                  .optional(),
                productCard: z
                  .object({
                    style: z.enum(["minimal", "detailed", "compact"]).optional(),
                    showPrice: z.boolean().optional(),
                    showRating: z.boolean().optional(),
                    showDescription: z.boolean().optional(),
                    borderRadius: z.string().optional(),
                  })
                  .optional(),
                navigation: z
                  .object({
                    style: z.enum(["top", "sidebar", "sticky"]).optional(),
                    backgroundColor: z.string().optional(),
                  })
                  .optional(),
              })
              .optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const vendorId = typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

        const vendor = await ctx.db.findByID({
          collection: "vendors",
          id: vendorId,
          depth: 0,
        });

        // Merge with existing customization
        const updatedCustomization = {
          ...(vendor.templateCustomization || {}),
          ...input.customization,
        };

        await ctx.db.update({
          collection: "vendors",
          id: vendorId,
          data: {
            templateCustomization: updatedCustomization,
          },
        });

        return { customization: updatedCustomization };
      }),
  }),
});
