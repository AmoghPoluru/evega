import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Sort, Where } from 'payload';
import type { Product, User, Vendor, VendorTemplate } from '@/payload-types';
import { createLocalReq, getFieldsToSign, jwtSign } from 'payload';
import { addSessionToUser } from 'payload/shared';
import { adminProcedure, baseProcedure, createTRPCRouter, staffProcedure } from '@/trpc/init';
import {
  clearImpersonatorCookie,
  generateAuthCookie,
  getAuthCookie,
  getImpersonatorCookie,
  setImpersonatorCookie,
} from '@/modules/auth/utils';
import {
  processProductCreateInput,
  staffProductCreateInputSchema,
} from '@/modules/products/product-create-input';
import { createManualOrder } from '@/modules/orders/create-manual-order';
import { manualOrderCreateInputSchema } from '@/modules/orders/manual-order-schema';
import {
  marketingProfileUpdateBodySchema,
  toMarketingProfileResponse,
  updateVendorMarketingProfile,
} from '@/modules/marketing/marketing-profile-trpc';
import {
  assertRegionUnique,
  buildPotentialVendorRegionData,
  formatPotentialVendorRegion,
  listPotentialVendorRegions,
  potentialVendorRegionInputSchema,
} from '@/modules/marketing/potential-vendors-trpc';
import {
  getHappyBannerPlatformConfig,
  updateHappyBannerPlatformConfig,
} from '@/lib/happy-banner/config';
import { buildResolvedHappyBanner } from '@/lib/happy-banner/format-banner';
import { normalizeHappyBannerWriteData } from '@/lib/happy-banner/normalize-banner-data';
import {
  formatHappyBannerListItem,
  getHappyBannerPreviewImageId,
  getHappyBannerPreviewImageUrl,
} from '@/lib/happy-banner/preview-image';
import {
  happyBannerCreateSchema,
  happyBannerPlatformSettingsSchema,
  happyBannerUpdateSchema,
} from '@/lib/happy-banner/schema';
import type { HappyBannerDocFields } from '@/lib/happy-banner/types';

const productStatusSchema = z.enum(['all', 'published', 'draft', 'archived']);

const listInputSchema = z.object({
  status: productStatusSchema.optional().default('all'),
  search: z.string().optional(),
  category: z.string().optional(),
  vendorId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

function buildProductStatusWhere(status: z.infer<typeof productStatusSchema>): Where {
  if (status === 'published') {
    return { isPrivate: { equals: false }, isArchived: { equals: false } };
  }
  if (status === 'draft') {
    return { isPrivate: { equals: true }, isArchived: { equals: false } };
  }
  if (status === 'archived') {
    return { isArchived: { equals: true } };
  }
  return { isArchived: { equals: false } };
}

function getRemainingStock(product: {
  variants?: { stock?: number | null }[] | null;
  stock?: number | null;
}): number {
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
  }
  if (product.stock !== undefined && product.stock !== null) {
    return product.stock || 0;
  }
  return 0;
}

function statusToFlags(status: 'published' | 'draft' | 'archived') {
  if (status === 'published') {
    return { isPrivate: false, isArchived: false };
  }
  if (status === 'archived') {
    return { isPrivate: true, isArchived: true };
  }
  return { isPrivate: true, isArchived: false };
}

function flagsToStatus(isPrivate?: boolean | null, isArchived?: boolean | null): 'published' | 'draft' | 'archived' {
  if (isArchived) return 'archived';
  if (isPrivate) return 'draft';
  return 'published';
}

const userRoleSchema = z.enum(['user', 'vendor', 'admin', 'bdo']);

const staffUserUpdateInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
  vendorId: z.string().nullable().optional(),
  password: z.string().min(8).optional(),
});

function formatStaffUser(user: User) {
  const vendor = user.vendor;
  const vendorId = typeof vendor === 'string' ? vendor : vendor?.id ?? null;
  const vendorName =
    typeof vendor === 'object' && vendor ? vendor.name || vendor.slug || null : null;

  return {
    id: user.id,
    email: user.email,
    username: user.username ?? null,
    name: user.name ?? null,
    role: user.role ?? 'user',
    oauthProvider: user.oauthProvider ?? 'email',
    vendorId,
    vendorName,
    createdAt: user.createdAt,
  };
}

const vendorStatusSchema = z.enum(['pending', 'approved', 'suspended', 'rejected']);
const preferredPaymentMethodSchema = z.enum(['stripe', 'offline', 'both']);

const staffVendorUpdateInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  status: vendorStatusSchema.optional(),
  isActive: z.boolean().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().nullable(),
  preferredPaymentMethod: preferredPaymentMethodSchema.optional(),
  offlinePaymentInstructions: z.string().optional(),
  selectedTemplateId: z.string().nullable().optional(),
  whatsappBusinessNumber: z.string().optional(),
  whatsappNotificationsEnabled: z.boolean().optional(),
});

function formatStaffVendor(vendor: Vendor) {
  const selectedTemplate = vendor.selectedTemplate;
  const selectedTemplateId =
    typeof selectedTemplate === 'string' ? selectedTemplate : selectedTemplate?.id ?? null;
  const selectedTemplateName =
    typeof selectedTemplate === 'object' && selectedTemplate ? selectedTemplate.name : null;

  return {
    id: vendor.id,
    name: vendor.name,
    slug: vendor.slug,
    email: vendor.email,
    phone: vendor.phone ?? null,
    website: vendor.website ?? null,
    status: vendor.status ?? 'pending',
    isActive: vendor.isActive ?? false,
    commissionRate: vendor.commissionRate ?? 10,
    contactPhone: vendor.contactPhone ?? null,
    contactEmail: vendor.contactEmail ?? null,
    preferredPaymentMethod: vendor.preferredPaymentMethod ?? 'both',
    offlinePaymentInstructions: vendor.offlinePaymentInstructions ?? null,
    selectedTemplateId,
    selectedTemplateName,
    whatsappBusinessNumber: vendor.whatsappConfig?.businessNumber ?? null,
    whatsappNotificationsEnabled: vendor.whatsappConfig?.notificationsEnabled ?? true,
    stripeAccountId: vendor.stripeAccountId ?? null,
    stripeAccountStatus: vendor.stripeAccountStatus ?? 'not_connected',
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
  };
}

const jsonObjectSchema = z.custom<Record<string, unknown>>(
  (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  { message: 'Must be a JSON object' },
);

export const adminRouter = createTRPCRouter({
  users: createTRPCRouter({
    list: staffProcedure
      .input(
        z.object({
          search: z.string().optional(),
          limit: z.number().min(1).max(200).default(50),
          page: z.number().min(1).default(1),
        }),
      )
      .query(async ({ ctx, input }) => {
        const where: Where = {};
        const search = input.search?.trim();

        if (search) {
          where.or = [
            { email: { contains: search } },
            { username: { contains: search } },
            { name: { contains: search } },
          ];
        }

        const result = await ctx.db.find({
          collection: 'users',
          where,
          limit: input.limit,
          page: input.page,
          sort: '-createdAt',
          depth: 0,
          overrideAccess: true,
        });

        return {
          users: result.docs.map((user: User) => formatStaffUser(user)),
          totalPages: result.totalPages,
          totalDocs: result.totalDocs,
          page: result.page ?? input.page,
        };
      }),

    getOne: adminProcedure
      .input(z.object({ id: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        const user = await ctx.db
          .findByID({
            collection: 'users',
            id: input.id,
            depth: 1,
            overrideAccess: true,
          })
          .catch(() => null);

        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        return formatStaffUser(user as User);
      }),

    update: adminProcedure
      .input(staffUserUpdateInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { id, vendorId, password, ...fields } = input;

        const existing = await ctx.db
          .findByID({
            collection: 'users',
            id,
            depth: 0,
            overrideAccess: true,
          })
          .catch(() => null);

        if (!existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        const data: Record<string, unknown> = {};

        if (fields.name !== undefined) {
          data.name = fields.name.trim() || null;
        }
        if (fields.username !== undefined) {
          data.username = fields.username.trim() || null;
        }
        if (fields.email !== undefined) {
          data.email = fields.email.trim();
        }
        if (fields.role !== undefined) {
          data.role = fields.role;
          if (fields.role === 'admin' || fields.role === 'bdo') {
            data.vendor = null;
          }
        }

        const effectiveRole = (fields.role ?? existing.role) as z.infer<typeof userRoleSchema>;

        if (vendorId !== undefined) {
          if (effectiveRole === 'vendor') {
            if (vendorId) {
              try {
                await ctx.db.findByID({
                  collection: 'vendors',
                  id: vendorId,
                  depth: 0,
                  overrideAccess: true,
                });
              } catch {
                throw new TRPCError({
                  code: 'BAD_REQUEST',
                  message: 'Selected vendor does not exist',
                });
              }
              data.vendor = vendorId;
            } else {
              data.vendor = null;
            }
          }
        }

        if (password) {
          data.password = password;
        }

        if (Object.keys(data).length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No fields to update' });
        }

        try {
          const updated = await ctx.db.update({
            collection: 'users',
            id,
            data,
            overrideAccess: true,
          });

          return formatStaffUser(updated as User);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to update user';
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }
      }),

    impersonate: adminProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.session.user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You are already signed in as this user',
          });
        }

        const targetUser = await ctx.db
          .findByID({
            collection: 'users',
            id: input.userId,
            depth: 0,
            overrideAccess: true,
          })
          .catch(() => null);

        if (!targetUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        const cookiePrefix = ctx.db.config.cookiePrefix;
        const adminToken = await getAuthCookie({ prefix: cookiePrefix });

        if (!adminToken) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing admin session token',
          });
        }

        // Keep the first (real admin) token so nested impersonation still returns home.
        const existingImpersonator = await getImpersonatorCookie();
        if (!existingImpersonator) {
          await setImpersonatorCookie(adminToken);
        }

        const collectionConfig = ctx.db.collections.users.config;
        const req = await createLocalReq({}, ctx.db);
        const { sid } = await addSessionToUser({
          collectionConfig,
          payload: ctx.db,
          req,
          user: targetUser,
        });

        const { token } = await jwtSign({
          fieldsToSign: getFieldsToSign({
            collectionConfig,
            email: targetUser.email,
            sid,
            user: targetUser,
          }),
          secret: ctx.db.secret,
          tokenExpiration: collectionConfig.auth.tokenExpiration,
        });

        await generateAuthCookie({ prefix: cookiePrefix, value: token });

        return { success: true };
      }),

    stopImpersonating: baseProcedure.mutation(async ({ ctx }) => {
      const impersonatorToken = await getImpersonatorCookie();

      if (!impersonatorToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Not impersonating',
        });
      }

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: impersonatorToken,
      });
      await clearImpersonatorCookie();

      return { success: true };
    }),

    impersonationStatus: baseProcedure.query(async () => {
      const impersonatorToken = await getImpersonatorCookie();

      return {
        impersonating: Boolean(impersonatorToken),
        originalPresent: Boolean(impersonatorToken),
      };
    }),
  }),

  vendors: createTRPCRouter({
    list: staffProcedure
      .input(
        z.object({
          search: z.string().optional(),
          status: z.enum(['all', 'pending', 'approved', 'suspended', 'rejected']).optional(),
          limit: z.number().min(1).max(200).default(50),
          page: z.number().min(1).default(1),
        }),
      )
      .query(async ({ ctx, input }) => {
        const where: Where = {};
        const search = input.search?.trim();

        if (search) {
          where.or = [
            { name: { contains: search } },
            { slug: { contains: search } },
            { email: { contains: search } },
          ];
        }

        if (input.status && input.status !== 'all') {
          where.status = { equals: input.status };
        }

        const result = await ctx.db.find({
          collection: 'vendors',
          where,
          limit: input.limit,
          page: input.page,
          sort: 'name',
          depth: 1,
          overrideAccess: true,
        });

        return {
          vendors: result.docs.map((vendor: Vendor) => formatStaffVendor(vendor)),
          totalPages: result.totalPages,
          totalDocs: result.totalDocs,
          page: result.page ?? input.page,
        };
      }),

    getOne: staffProcedure
      .input(z.object({ id: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        const vendor = await ctx.db
          .findByID({
            collection: 'vendors',
            id: input.id,
            depth: 1,
            overrideAccess: true,
          })
          .catch(() => null);

        if (!vendor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' });
        }

        return formatStaffVendor(vendor as Vendor);
      }),

    update: staffProcedure
      .input(staffVendorUpdateInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { id, selectedTemplateId, whatsappBusinessNumber, whatsappNotificationsEnabled, ...fields } =
          input;

        const existing = await ctx.db
          .findByID({
            collection: 'vendors',
            id,
            depth: 0,
            overrideAccess: true,
          })
          .catch(() => null);

        if (!existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' });
        }

        const data: Record<string, unknown> = {};

        if (fields.name !== undefined) data.name = fields.name.trim();
        if (fields.slug !== undefined) data.slug = fields.slug.trim();
        if (fields.email !== undefined) data.email = fields.email.trim();
        if (fields.phone !== undefined) data.phone = fields.phone.trim() || null;
        if (fields.website !== undefined) data.website = fields.website.trim() || null;
        if (fields.status !== undefined) data.status = fields.status;
        if (fields.isActive !== undefined) data.isActive = fields.isActive;
        if (fields.commissionRate !== undefined) data.commissionRate = fields.commissionRate;
        if (fields.contactPhone !== undefined) data.contactPhone = fields.contactPhone.trim() || null;
        if (fields.contactEmail !== undefined) {
          data.contactEmail = fields.contactEmail?.trim() || null;
        }
        if (fields.preferredPaymentMethod !== undefined) {
          data.preferredPaymentMethod = fields.preferredPaymentMethod;
        }
        if (fields.offlinePaymentInstructions !== undefined) {
          data.offlinePaymentInstructions = fields.offlinePaymentInstructions.trim() || null;
        }

        if (selectedTemplateId !== undefined) {
          if (selectedTemplateId) {
            try {
              await ctx.db.findByID({
                collection: 'vendor-templates',
                id: selectedTemplateId,
                depth: 0,
                overrideAccess: true,
              });
            } catch {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Selected template does not exist',
              });
            }
            data.selectedTemplate = selectedTemplateId;
          } else {
            data.selectedTemplate = null;
          }
        }

        if (
          whatsappBusinessNumber !== undefined ||
          whatsappNotificationsEnabled !== undefined
        ) {
          data.whatsappConfig = {
            ...(existing.whatsappConfig ?? {}),
            ...(whatsappBusinessNumber !== undefined
              ? { businessNumber: whatsappBusinessNumber.trim() || null }
              : {}),
            ...(whatsappNotificationsEnabled !== undefined
              ? { notificationsEnabled: whatsappNotificationsEnabled }
              : {}),
          };
        }

        if (Object.keys(data).length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No fields to update' });
        }

        try {
          const updated = await ctx.db.update({
            collection: 'vendors',
            id,
            data,
            overrideAccess: true,
          });

          const withTemplate = await ctx.db.findByID({
            collection: 'vendors',
            id: updated.id,
            depth: 1,
            overrideAccess: true,
          });

          return formatStaffVendor(withTemplate as Vendor);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to update vendor';
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }
      }),

    approve: staffProcedure
      .input(z.object({ id: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        try {
          const updated = await ctx.db.update({
            collection: 'vendors',
            id: input.id,
            data: {
              status: 'approved',
              isActive: true,
            },
            overrideAccess: true,
          });

          const withTemplate = await ctx.db.findByID({
            collection: 'vendors',
            id: updated.id,
            depth: 1,
            overrideAccess: true,
          });

          return formatStaffVendor(withTemplate as Vendor);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to approve vendor';
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }
      }),

    setActive: staffProcedure
      .input(z.object({ id: z.string().min(1), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const updated = await ctx.db.update({
            collection: 'vendors',
            id: input.id,
            data: { isActive: input.isActive },
            overrideAccess: true,
          });

          const withTemplate = await ctx.db.findByID({
            collection: 'vendors',
            id: updated.id,
            depth: 1,
            overrideAccess: true,
          });

          return formatStaffVendor(withTemplate as Vendor);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Failed to update vendor active status';
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }
      }),

    listOptions: staffProcedure.query(async ({ ctx }) => {
      const result = await ctx.db.find({
        collection: 'vendors',
        limit: 200,
        sort: 'name',
        depth: 0,
        overrideAccess: true,
      });

      return result.docs.map((v: Vendor) => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        status: v.status,
      }));
    }),

    listTemplateOptions: staffProcedure.query(async ({ ctx }) => {
      const { fetchAllVendorTemplates } = await import('@/lib/templates/fetch-all-templates');
      const docs = await fetchAllVendorTemplates(ctx.db, {
        where: { isActive: { equals: true } },
        sort: 'name',
        depth: 0,
        overrideAccess: true,
      });

      return docs.map((template: { id: string; name: string; slug: string; isDefault?: boolean | null }) => ({
        id: template.id,
        name: template.name,
        slug: template.slug,
        isDefault: template.isDefault ?? false,
      }));
    }),
  }),

  potentialVendors: createTRPCRouter({
    list: staffProcedure.query(async ({ ctx }) => {
      return listPotentialVendorRegions(ctx.db);
    }),

    create: staffProcedure
      .input(potentialVendorRegionInputSchema)
      .mutation(async ({ ctx, input }) => {
        const data = buildPotentialVendorRegionData(input);
        await assertRegionUnique(ctx.db, data.region);

        const doc = await ctx.db.create({
          collection: 'potential-vendor-regions',
          data,
          overrideAccess: true,
        });

        return formatPotentialVendorRegion(
          doc as Parameters<typeof formatPotentialVendorRegion>[0]
        );
      }),

    update: staffProcedure
      .input(
        potentialVendorRegionInputSchema.extend({
          id: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...body } = input;
        const data = buildPotentialVendorRegionData(body);
        await assertRegionUnique(ctx.db, data.region, id);

        const doc = await ctx.db.update({
          collection: 'potential-vendor-regions',
          id,
          data,
          overrideAccess: true,
        });

        return formatPotentialVendorRegion(
          doc as Parameters<typeof formatPotentialVendorRegion>[0]
        );
      }),

    delete: staffProcedure
      .input(z.object({ id: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db.delete({
          collection: 'potential-vendor-regions',
          id: input.id,
          overrideAccess: true,
        });
        return { success: true };
      }),
  }),

  marketing: createTRPCRouter({
    getProfile: staffProcedure
      .input(z.object({ vendorId: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        const vendor = await ctx.db.findByID({
          collection: 'vendors',
          id: input.vendorId,
          depth: 1,
          overrideAccess: true,
        });

        return toMarketingProfileResponse(vendor);
      }),

    updateProfile: staffProcedure
      .input(
        marketingProfileUpdateBodySchema.extend({
          vendorId: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { vendorId, ...body } = input;
        return updateVendorMarketingProfile(ctx.db, vendorId, body, {
          overrideAccess: true,
        });
      }),
  }),

  products: createTRPCRouter({
    list: staffProcedure.input(listInputSchema).query(async ({ ctx, input }) => {
      const where: Where = {
        ...buildProductStatusWhere(input.status),
      };

      if (input.vendorId) {
        where.vendor = { equals: input.vendorId };
      }

      if (input.search?.trim()) {
        where.name = { contains: input.search.trim() };
      }

      if (input.category) {
        where.category = { equals: input.category };
      }

      const sort: Sort = `${input.sortOrder === 'desc' ? '-' : ''}${input.sortBy}`;

      const result = await ctx.db.find({
        collection: 'products',
        where,
        limit: input.limit,
        page: input.page,
        sort,
        depth: 1,
        overrideAccess: true,
      });

      const docs = result.docs.map((product: Product) => ({
        ...product,
        remainingStock: getRemainingStock(product),
        statusLabel: flagsToStatus(product.isPrivate, product.isArchived),
      }));

      return {
        docs,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      };
    }),

    create: staffProcedure.input(staffProductCreateInputSchema).mutation(async ({ ctx, input }) => {
      const { vendor: vendorId, ...body } = input;

      try {
        await ctx.db.findByID({
          collection: 'vendors',
          id: vendorId,
          depth: 0,
          overrideAccess: true,
        });
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Selected vendor does not exist' });
      }

      let processedInput: Record<string, unknown>;
      try {
        processedInput = processProductCreateInput(body) as Record<string, unknown>;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid product data';
        throw new TRPCError({ code: 'BAD_REQUEST', message });
      }

      try {
        const product = await ctx.db.create({
          collection: 'products',
          data: {
            ...processedInput,
            vendor: vendorId,
            isArchived: false,
          },
          overrideAccess: true,
        });

        return product;
      } catch (error: unknown) {
        const err = error as {
          errors?: { path?: string; message?: string }[];
          message?: string;
          name?: string;
          status?: number;
        };
        console.error("[admin.products.create]", {
          message: err?.message,
          name: err?.name,
        });
        if (
          err?.message?.includes("not allowed") ||
          err?.name === "Forbidden" ||
          err?.status === 403
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not allowed to create products. Check staff account permissions.",
          });
        }
        if (err?.errors && Array.isArray(err.errors)) {
          const messages = err.errors.map((e) => e.message || e.path || 'Validation error');
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: messages.join('; ') || 'Failed to create product',
          });
        }
        const message = error instanceof Error ? error.message : 'Failed to create product';
        throw new TRPCError({ code: 'BAD_REQUEST', message });
      }
    }),

    update: staffProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          vendor: z.string().min(1).optional(),
          price: z.number().min(0.01).optional(),
          category: z.string().min(1).optional(),
          status: z.enum(['published', 'draft', 'archived']).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...fields } = input;
        const data: Record<string, unknown> = {};

        if (fields.name !== undefined) data.name = fields.name;
        if (fields.vendor !== undefined) data.vendor = fields.vendor;
        if (fields.price !== undefined) data.price = fields.price;
        if (fields.category !== undefined) data.category = fields.category;
        if (fields.status !== undefined) {
          Object.assign(data, statusToFlags(fields.status));
        }

        try {
          const product = await ctx.db.update({
            collection: 'products',
            id,
            data,
            overrideAccess: true,
          });

          return product;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to update product';
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }
      }),

    delete: staffProcedure
      .input(
        z.object({
          id: z.string().optional(),
          ids: z.array(z.string()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const ids = input.ids?.length ? input.ids : input.id ? [input.id] : [];

        if (ids.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No product id provided' });
        }

        await Promise.all(
          ids.map((id) =>
            ctx.db.update({
              collection: 'products',
              id,
              data: { isArchived: true },
              overrideAccess: true,
            }),
          ),
        );

        return { success: true, count: ids.length };
      }),
  }),

  orders: createTRPCRouter({
    list: staffProcedure
      .input(
        z.object({
          status: z
            .enum(['all', 'pending', 'payment_done', 'processing', 'complete', 'canceled', 'refunded'])
            .optional()
            .default('all'),
          search: z.string().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
          vendorId: z.string().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
          sortBy: z.enum(['createdAt', 'total', 'status']).default('createdAt'),
          sortOrder: z.enum(['asc', 'desc']).default('desc'),
        }),
      )
      .query(async ({ ctx, input }) => {
        const where: Where = {};

        if (input.status && input.status !== 'all') {
          where.status = { equals: input.status };
        }

        if (input.vendorId) {
          where.vendor = { equals: input.vendorId };
        }

        if (input.dateFrom || input.dateTo) {
          where.createdAt = {};
          if (input.dateFrom) {
            where.createdAt.greater_than_equal = input.dateFrom;
          }
          if (input.dateTo) {
            where.createdAt.less_than_equal = input.dateTo;
          }
        }

        if (input.search?.trim()) {
          const term = input.search.trim();
          where.or = [
            { orderNumber: { contains: term } },
            { name: { contains: term } },
          ];
        }

        const sort: Sort = `${input.sortOrder === 'desc' ? '-' : ''}${input.sortBy}`;

        const result = await ctx.db.find({
          collection: 'orders',
          where,
          limit: input.limit,
          page: input.page,
          sort,
          depth: 2,
          overrideAccess: true,
        });

        const docs = result.docs.map((order: (typeof result.docs)[number]) => {
          const user = order.user;
          const vendor = order.vendor;
          const product = order.product;
          const customerLabel =
            (typeof user === 'object' && user
              ? user.name || user.email
              : null) ||
            order.name ||
            'Unknown';
          const vendorName =
            typeof vendor === 'object' && vendor
              ? vendor.name || vendor.slug || '—'
              : '—';
          const productName =
            typeof product === 'object' && product ? product.name || 'Product' : 'Product';
          const qty = order.quantity || 1;
          const variantParts: string[] = [];
          if (order.size) variantParts.push(`Size ${order.size}`);
          if (order.color) variantParts.push(order.color);
          const itemsSummary =
            variantParts.length > 0
              ? `${qty} × ${productName} — ${variantParts.join(' · ')}`
              : `${qty} × ${productName}`;

          return {
            ...order,
            customerLabel,
            vendorName,
            productName,
            itemsCount: qty,
            itemsSummary,
          };
        });

        return {
          docs,
          totalDocs: result.totalDocs,
          totalPages: result.totalPages,
          page: result.page,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        };
      }),

    updateStatus: staffProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.enum([
            'pending',
            'payment_done',
            'processing',
            'complete',
            'canceled',
            'refunded',
          ]),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const updated = await ctx.db.update({
          collection: 'orders',
          id: input.id,
          data: { status: input.status },
          overrideAccess: true,
        });

        return updated;
      }),

    update: staffProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          product: z.string().min(1).optional(),
          quantity: z.number().int().min(1).optional(),
          size: z.string().optional(),
          color: z.string().optional(),
          total: z.number().min(0.01).optional(),
          status: z
            .enum(['pending', 'payment_done', 'processing', 'complete', 'canceled', 'refunded'])
            .optional(),
          recalculateTotal: z.boolean().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, recalculateTotal, ...fields } = input;

        const existing = await ctx.db.findByID({
          collection: 'orders',
          id,
          depth: 0,
          overrideAccess: true,
        });

        const productId =
          fields.product ??
          (typeof existing.product === 'string' ? existing.product : existing.product?.id);
        const quantity = fields.quantity ?? existing.quantity ?? 1;

        const data: Record<string, unknown> = {};

        if (fields.name !== undefined) data.name = fields.name;
        if (fields.quantity !== undefined) data.quantity = fields.quantity;
        if (fields.size !== undefined) data.size = fields.size || undefined;
        if (fields.color !== undefined) data.color = fields.color || undefined;
        if (fields.status !== undefined) data.status = fields.status;

        if (fields.product !== undefined) {
          const product = await ctx.db.findByID({
            collection: 'products',
            id: fields.product,
            depth: 0,
            overrideAccess: true,
          });

          data.product = fields.product;

          if (product.vendor) {
            data.vendor =
              typeof product.vendor === 'string' ? product.vendor : product.vendor.id;
          }
        }

        if (recalculateTotal && productId) {
          const product = await ctx.db.findByID({
            collection: 'products',
            id: productId,
            depth: 0,
            overrideAccess: true,
          });
          data.total = Math.round(product.price * quantity * 100) / 100;
        } else if (fields.total !== undefined) {
          data.total = fields.total;
        }

        if (Object.keys(data).length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No fields to update' });
        }

        const updated = await ctx.db.update({
          collection: 'orders',
          id,
          data,
          overrideAccess: true,
        });

        return updated;
      }),

    productsForCreate: staffProcedure
      .input(
        z.object({
          vendorId: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(200).default(100),
        }),
      )
      .query(async ({ ctx, input }) => {
        const where: Where = { isArchived: { equals: false } };

        if (input.vendorId) {
          where.vendor = { equals: input.vendorId };
        }

        if (input.search?.trim()) {
          where.name = { contains: input.search.trim() };
        }

        const result = await ctx.db.find({
          collection: 'products',
          where,
          limit: input.limit,
          sort: 'name',
          depth: 0,
          overrideAccess: true,
        });

        return {
          docs: result.docs.map((p: (typeof result.docs)[number]) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            variants: p.variants ?? [],
            vendorId:
              typeof p.vendor === 'string' ? p.vendor : (p.vendor as { id?: string })?.id,
          })),
        };
      }),

    create: staffProcedure.input(manualOrderCreateInputSchema).mutation(async ({ ctx, input }) => {
      try {
        return await createManualOrder(ctx.db, input, { overrideAccess: true });
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        const message = error instanceof Error ? error.message : 'Failed to create order';
        throw new TRPCError({ code: 'BAD_REQUEST', message });
      }
    }),

    productPicker: staffProcedure
      .input(
        z.object({
          vendorId: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(200).default(100),
        }),
      )
      .query(async ({ ctx, input }) => {
        const where: Where = { isArchived: { equals: false } };

        if (input.vendorId) {
          where.vendor = { equals: input.vendorId };
        }

        if (input.search?.trim()) {
          where.name = { contains: input.search.trim() };
        }

        const result = await ctx.db.find({
          collection: 'products',
          where,
          limit: input.limit,
          sort: 'name',
          depth: 0,
          overrideAccess: true,
        });

        return result.docs.map((p: Product) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          vendorId: typeof p.vendor === 'string' ? p.vendor : (p.vendor as { id?: string })?.id,
        }));
      }),

    delete: staffProcedure
      .input(
        z.object({
          id: z.string().optional(),
          ids: z.array(z.string()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const ids = input.ids?.length ? input.ids : input.id ? [input.id] : [];

        if (ids.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No order id provided' });
        }

        await Promise.all(
          ids.map((id) =>
            ctx.db.delete({
              collection: 'orders',
              id,
              overrideAccess: true,
            }),
          ),
        );

        return { success: true, count: ids.length };
      }),
  }),

  templates: createTRPCRouter({
    list: staffProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            category: z
              .enum(['minimal', 'elegant', 'bold', 'colorful', 'classic', 'all'])
              .optional()
              .default('all'),
            includeInactive: z.boolean().optional().default(true),
          })
          .optional(),
      )
      .query(async ({ ctx, input }) => {
        const where: Where = {};

        if (input?.category && input.category !== 'all') {
          where.category = { equals: input.category };
        }

        if (!input?.includeInactive) {
          where.isActive = { equals: true };
        }

        if (input?.search?.trim()) {
          where.or = [
            { name: { contains: input.search.trim() } },
            { slug: { contains: input.search.trim() } },
          ];
        }

        const { fetchAllVendorTemplates } = await import('@/lib/templates/fetch-all-templates');
        const allTemplates = await fetchAllVendorTemplates(ctx.db, {
          where,
          sort: 'name',
          depth: 1,
          overrideAccess: true,
        });

        return allTemplates.map((template: VendorTemplate) => {
          const thumb = template.thumbnailImage;
          const preview = template.previewImage;
          const thumbnailUrl =
            typeof thumb === 'object' && thumb?.url
              ? thumb.url
              : typeof preview === 'object' && preview?.url
                ? preview.url
                : null;

          return {
            id: template.id,
            name: template.name,
            slug: template.slug,
            description: template.description ?? null,
            category: template.category,
            isDefault: template.isDefault ?? false,
            isActive: template.isActive ?? true,
            version: template.version ?? '1.0.0',
            author: template.author ?? null,
            thumbnailUrl,
            updatedAt: template.updatedAt,
          };
        });
      }),

    getOne: staffProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const template = await ctx.db
          .findByID({
            collection: 'vendor-templates',
            id: input.id,
            depth: 1,
            overrideAccess: true,
          })
          .catch(() => null);

        if (!template) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });
        }

        const doc = template as VendorTemplate;

        return {
          id: doc.id,
          name: doc.name,
          slug: doc.slug,
          description: doc.description ?? '',
          category: doc.category,
          isDefault: doc.isDefault ?? false,
          isActive: doc.isActive ?? true,
          version: doc.version ?? '1.0.0',
          author: doc.author ?? '',
          templateConfig: doc.templateConfig ?? {},
          cssVariables: doc.cssVariables ?? {},
          componentMapping: doc.componentMapping ?? {},
          updatedAt: doc.updatedAt,
        };
      }),

    update: staffProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          description: z.string().nullable().optional(),
          category: z.enum(['minimal', 'elegant', 'bold', 'colorful', 'classic']).optional(),
          isDefault: z.boolean().optional(),
          isActive: z.boolean().optional(),
          version: z.string().min(1).optional(),
          author: z.string().optional(),
          templateConfig: jsonObjectSchema.optional(),
          cssVariables: jsonObjectSchema.optional(),
          componentMapping: jsonObjectSchema.optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;

        try {
          const updated = await ctx.db.update({
            collection: 'vendor-templates',
            id,
            data,
            overrideAccess: true,
          });
          return updated as VendorTemplate;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Failed to update template';
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }
      }),

    previewVendors: staffProcedure.query(async ({ ctx }) => {
      const result = await ctx.db.find({
        collection: 'vendors',
        where: {
          status: { equals: 'approved' },
          isActive: { equals: true },
        },
        limit: 200,
        sort: 'name',
        depth: 0,
        overrideAccess: true,
      });

      return result.docs.map((vendor: Vendor) => ({
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug ?? '',
      }));
    }),
  }),

  happyBanners: createTRPCRouter({
    list: staffProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            includeInactive: z.boolean().optional().default(true),
          })
          .optional(),
      )
      .query(async ({ ctx, input }) => {
        const where: Where = {};

        if (!input?.includeInactive) {
          where.isActive = { equals: true };
        }

        if (input?.search?.trim()) {
          where.or = [
            { name: { contains: input.search.trim() } },
            { slug: { contains: input.search.trim() } },
          ];
        }

        const result = await ctx.db.find({
          collection: 'happy-banners',
          where,
          sort: 'name',
          limit: 100,
          depth: 1,
          overrideAccess: true,
        });

        return result.docs.map((banner: Record<string, unknown> & { id: string; updatedAt: string }) =>
          formatHappyBannerListItem(banner as HappyBannerDocFields & { id: string; updatedAt: string }),
        );
      }),

    getOne: staffProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const banner = await ctx.db
          .findByID({
            collection: 'happy-banners',
            id: input.id,
            depth: 1,
            overrideAccess: true,
          })
          .catch(() => null);

        if (!banner) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Happy Banner not found' });
        }

        const doc = banner as HappyBannerDocFields & { id: string };
        return {
          ...doc,
          previewImageId: getHappyBannerPreviewImageId(doc.previewImage),
          previewImageUrl: getHappyBannerPreviewImageUrl(doc.previewImage),
        };
      }),

    create: staffProcedure.input(happyBannerCreateSchema).mutation(async ({ ctx, input }) => {
      try {
        const created = await ctx.db.create({
          collection: 'happy-banners',
          data: normalizeHappyBannerWriteData(input),
          overrideAccess: true,
        });
        return created as HappyBannerDocFields & { id: string };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create Happy Banner';
        throw new TRPCError({ code: 'BAD_REQUEST', message });
      }
    }),

    update: staffProcedure.input(happyBannerUpdateSchema).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      try {
        const updated = await ctx.db.update({
          collection: 'happy-banners',
          id,
          data: normalizeHappyBannerWriteData(data),
          overrideAccess: true,
        });
        return updated as HappyBannerDocFields & { id: string };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update Happy Banner';
        throw new TRPCError({ code: 'BAD_REQUEST', message });
      }
    }),

    delete: staffProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await ctx.db.delete({
            collection: 'happy-banners',
            id: input.id,
            overrideAccess: true,
          });
          return { success: true };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to delete Happy Banner';
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }
      }),

    getPlatformSettings: staffProcedure.query(async ({ ctx }) => {
      return getHappyBannerPlatformConfig(ctx.db);
    }),

    updatePlatformSettings: staffProcedure
      .input(happyBannerPlatformSettingsSchema)
      .mutation(async ({ ctx, input }) => {
        return updateHappyBannerPlatformConfig(ctx.db, input);
      }),

    preview: staffProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const banner = await ctx.db
          .findByID({
            collection: 'happy-banners',
            id: input.id,
            depth: 0,
            overrideAccess: true,
          })
          .catch(() => null);

        if (!banner) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Happy Banner not found' });
        }

        return buildResolvedHappyBanner(banner as HappyBannerDocFields & { id: string });
      }),
  }),
});
