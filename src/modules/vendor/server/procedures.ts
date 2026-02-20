import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";
import type { Where, Sort } from "payload";
import { parse } from "csv-parse/sync";

import { baseProcedure, createTRPCRouter, protectedProcedure, vendorProcedure } from "@/trpc/init";

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
      depth: 2, // Populate vendor with full details
    });

    const vendor = user.vendor;
    if (!vendor) {
      return {
        hasVendor: false,
        status: "none" as const,
        isActive: false,
      };
    }

    const vendorDoc = typeof vendor === "string"
      ? await ctx.db.findByID({ collection: "vendors", id: vendor, depth: 0 })
      : vendor;

    return {
      hasVendor: true,
      status: vendorDoc.status || "pending",
      isActive: vendorDoc.isActive ?? false,
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
        },
      });

      return {
        success: true,
        vendorId: vendor.id,
        message: "Vendor application submitted successfully. You will be notified once approved.",
      };
    }),

  products: createTRPCRouter({
    list: vendorProcedure
      .input(
        z.object({
          status: z.enum(["all", "published", "draft", "archived"]).optional().default("all"),
          search: z.string().optional(),
          category: z.string().optional(),
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

        // Category filter
        if (input.category) {
          where.category = { equals: input.category };
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
          depth: 1, // Include category, image
        });

        console.log("[PRODUCTS LIST] Query result:", {
          totalDocs: result.totalDocs,
          docsCount: result.docs.length,
          vendorId,
          where,
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
          category: z.string().min(1, "Category is required"),
          subcategory: z.string().optional(),
          image: z.string().optional(),
          cover: z.string().optional(),
          refundPolicy: z.enum(["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"]).optional(),
          tags: z.array(z.string()).optional(),
          variants: z.array(
            z.object({
              size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]).optional(),
              color: z.string().optional(),
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

        // Create product with vendor auto-assigned
        const product = await ctx.db.create({
          collection: "products",
          data: {
            ...input,
            vendor: vendorId,
            isArchived: false,
          },
        });

        return product;
      }),

    update: vendorProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          description: z.any().optional(),
          price: z.number().min(0.01).optional(),
          category: z.string().optional(),
          subcategory: z.string().optional(),
          image: z.string().optional(),
          cover: z.string().optional(),
          refundPolicy: z.enum(["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"]).optional(),
          tags: z.array(z.string()).optional(),
          variants: z.array(
            z.object({
              size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]).optional(),
              color: z.string().optional(),
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

        const { id, ...updateData } = input;

        // Verify ownership
        const existingProduct = await ctx.db.findByID({
          collection: "products",
          id,
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

        // Update product
        const product = await ctx.db.update({
          collection: "products",
          id,
          data: safeUpdateData,
        });

        return product;
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

        const requiredFields = ['name', 'price', 'category'];
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

        // Process each row
        for (let i = 0; i < records.length; i++) {
          const rowData = records[i] as Record<string, string>;

          try {
            // Validate required fields
            if (!rowData.name || !rowData.price || !rowData.category) {
              throw new Error('Missing required fields: name, price, or category');
            }

            // Parse price
            const price = parseFloat(rowData.price);
            if (isNaN(price) || price <= 0) {
              throw new Error(`Invalid price: ${rowData.price}`);
            }

            // Find category by name or slug
            const categories = await ctx.db.find({
              collection: "categories",
              where: {
                or: [
                  { name: { equals: rowData.category } },
                  { slug: { equals: rowData.category.toLowerCase().replace(/\s+/g, '-') } },
                ],
              },
              limit: 1,
            });

            if (categories.docs.length === 0) {
              throw new Error(`Category not found: ${rowData.category}`);
            }

            const categoryId = String(categories.docs[0].id);

            // Find subcategory if provided
            let subcategoryId: string | undefined;
            if (rowData.subcategory) {
              const subcategories = await ctx.db.find({
                collection: "categories",
                where: {
                  or: [
                    { name: { equals: rowData.subcategory } },
                    { slug: { equals: rowData.subcategory.toLowerCase().replace(/\s+/g, '-') } },
                  ],
                },
                limit: 1,
              });
              subcategoryId = subcategories.docs[0]?.id ? String(subcategories.docs[0].id) : undefined;
            }

            // Tags are relationship fields, so we need to find or create tag IDs
            // For now, skip tags since they require tag IDs, not tag names
            // TODO: Implement tag lookup/creation if needed
            const tags: string[] = [];

            // Convert description to Lexical format if provided
            let description: any = undefined;
            if (rowData.description) {
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
                          text: rowData.description,
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

            // Ensure vendorId is a string
            const vendorIdString = String(vendorId);

            // Create product
            const product = await ctx.db.create({
              collection: "products",
              data: {
                name: String(rowData.name),
                description,
                price,
                category: categoryId,
                subcategory: subcategoryId || undefined,
                vendor: vendorIdString,
                isPrivate: true, // All imports are drafts
                isArchived: false,
                refundPolicy: (rowData.refundPolicy as any) || "30-day",
                // Skip tags for now - they require tag relationship IDs
              },
            });

            console.log("[BULK IMPORT] Created product:", {
              id: product.id,
              name: product.name,
              vendor: typeof product.vendor === "string" ? product.vendor : product.vendor?.id,
              isPrivate: product.isPrivate,
            });

            productIds.push(product.id);
            successCount++;
          } catch (error: any) {
            failedCount++;
            const errorMessage = error.message || String(error);
            console.log("[BULK IMPORT] Row failed:", {
              row: i + 2,
              productName: rowData.name,
              error: errorMessage,
            });
            errors.push({
              row: i + 2, // +2 because row 1 is header, and we're 0-indexed
              errors: [errorMessage],
            });
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
});
