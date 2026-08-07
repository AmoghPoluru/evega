import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import { createTRPCRouter, vendorProcedure } from "@/trpc/init";
import { buildResolvedVendorLogoTemplate } from "@/lib/vendor-logo/format-logo";
import { formatVendorLogoListItem } from "@/lib/vendor-logo/format-list-item";
import {
  getVendorLogoWordDefaults,
  getVendorLogoWordSlots,
} from "@/lib/vendor-logo/vendor-words";
import { getVendorLogoRelationshipId } from "@/lib/vendor-logo/relationship-id";
import {
  vendorLogoSelectSchema,
  vendorLogoSourceSchema,
  vendorLogoTextSchema,
} from "@/lib/vendor-logo/schema";
import type { VendorLogoDocFields } from "@/lib/vendor-logo/types";
import {
  resolveVendorLogoTemplate,
  type VendorWithLogoTemplate,
} from "@/lib/vendor-logo/resolve";
import { revalidatePath } from "next/cache";

async function revalidateVendorLogoStorefront(db: Payload, vendorId: string) {
  const vendor = await db.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 0,
  });
  if (vendor.slug) {
    revalidatePath(`/vendors/${vendor.slug}`);
  }
}

export const vendorLogoTemplateRouter = createTRPCRouter({
  list: vendorProcedure.query(async ({ ctx }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    const vendor = (await ctx.db.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 0,
    })) as VendorWithLogoTemplate;

    const selectedId = getVendorLogoRelationshipId(vendor.logoTemplate?.selectedTemplate);

    const result = await ctx.db.find({
      collection: "vendor-logo-templates",
      where: { isActive: { equals: true } },
      sort: "name",
      limit: 100,
      depth: 1,
    });

    return {
      logoSource: (vendor.logoSource ?? "upload") as "upload" | "template",
      selectedTemplateId: selectedId,
      word1: vendor.logoTemplate?.word1?.trim() || null,
      word2: vendor.logoTemplate?.word2?.trim() || null,
      uploadLogoUrl:
        typeof vendor.logo === "object" && vendor.logo?.url ? vendor.logo.url : null,
      uploadLogoId:
        typeof vendor.logo === "string"
          ? vendor.logo
          : typeof vendor.logo === "object"
            ? vendor.logo?.id ?? null
            : null,
      docs: result.docs
        .map((template: Record<string, unknown> & { id: string }) =>
          formatVendorLogoListItem(template as VendorLogoDocFields & { id: string }),
        )
        .map((item: ReturnType<typeof formatVendorLogoListItem>) => ({
          ...item,
          isSelected: item.id === selectedId,
        })),
    };
  }),

  get: vendorProcedure.query(async ({ ctx }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    const vendor = (await ctx.db.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 1,
    })) as VendorWithLogoTemplate;

    const selectedId = getVendorLogoRelationshipId(vendor.logoTemplate?.selectedTemplate);
    let templateDoc: VendorLogoDocFields | null = null;
    let resolved = await resolveVendorLogoTemplate(ctx.db, vendor);

    if (selectedId) {
      templateDoc = (await ctx.db
        .findByID({
          collection: "vendor-logo-templates",
          id: selectedId,
          depth: 0,
        })
        .catch(() => null)) as VendorLogoDocFields | null;
    }

    const words = templateDoc
      ? getVendorLogoWordDefaults(templateDoc)
      : { word1: "ANAYA", word2: "SILKS" };

    return {
      logoSource: (vendor.logoSource ?? "upload") as "upload" | "template",
      selectedTemplateId: selectedId,
      selectedPreset: templateDoc?.preset ?? null,
      word1: vendor.logoTemplate?.word1?.trim() || words.word1,
      word2: vendor.logoTemplate?.word2?.trim() || words.word2,
      vendorWordSlots: templateDoc ? getVendorLogoWordSlots(templateDoc) : null,
      preview: resolved,
      uploadLogoUrl:
        typeof vendor.logo === "object" && vendor.logo?.url ? vendor.logo.url : null,
    };
  }),

  select: vendorProcedure.input(vendorLogoSelectSchema).mutation(async ({ ctx, input }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    const template = await ctx.db
      .findByID({
        collection: "vendor-logo-templates",
        id: input.templateId,
        depth: 0,
      })
      .catch(() => null);

    if (!template || template.isActive === false) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Logo template is not available" });
    }

    const templateDoc = template as VendorLogoDocFields;
    const defaults = getVendorLogoWordDefaults(templateDoc);

    const updated = await ctx.db.update({
      collection: "vendors",
      id: vendorId,
      data: {
        logoSource: "template",
        logoTemplate: {
          selectedTemplate: input.templateId,
          word1: defaults.word1,
          word2: defaults.word2,
        },
      },
    });

    await revalidateVendorLogoStorefront(ctx.db, vendorId);

    const resolved = await resolveVendorLogoTemplate(ctx.db, updated as VendorWithLogoTemplate);

    return {
      selectedTemplateId: input.templateId,
      word1: updated.logoTemplate?.word1 ?? defaults.word1,
      word2: updated.logoTemplate?.word2 ?? defaults.word2,
      vendorWordSlots: getVendorLogoWordSlots(templateDoc),
      preview: resolved,
    };
  }),

  updateWords: vendorProcedure.input(vendorLogoTextSchema).mutation(async ({ ctx, input }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    const vendor = (await ctx.db.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 0,
    })) as VendorWithLogoTemplate;

    const selectedId = getVendorLogoRelationshipId(vendor.logoTemplate?.selectedTemplate);
    if (!selectedId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Select a logo design before saving your words",
      });
    }

    const updated = await ctx.db.update({
      collection: "vendors",
      id: vendorId,
      data: {
        logoSource: "template",
        logoTemplate: {
          selectedTemplate: selectedId,
          word1: input.word1.trim().toUpperCase(),
          word2: input.word2.trim().toUpperCase(),
        },
      },
    });

    await revalidateVendorLogoStorefront(ctx.db, vendorId);

    const resolved = await resolveVendorLogoTemplate(ctx.db, updated as VendorWithLogoTemplate);

    return {
      word1: updated.logoTemplate?.word1 ?? input.word1,
      word2: updated.logoTemplate?.word2 ?? input.word2,
      preview: resolved,
    };
  }),

  setSource: vendorProcedure.input(vendorLogoSourceSchema).mutation(async ({ ctx, input }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    await ctx.db.update({
      collection: "vendors",
      id: vendorId,
      data: { logoSource: input.source },
    });

    await revalidateVendorLogoStorefront(ctx.db, vendorId);

    return { logoSource: input.source };
  }),

  previewTemplate: vendorProcedure
    .input(
      z.object({
        templateId: z.string(),
        word1: z.string().optional(),
        word2: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const template = await ctx.db
        .findByID({
          collection: "vendor-logo-templates",
          id: input.templateId,
          depth: 0,
        })
        .catch(() => null);

      if (!template || template.isActive === false) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Logo template not found" });
      }

      return buildResolvedVendorLogoTemplate(template as VendorLogoDocFields & { id: string }, {
        word1: input.word1,
        word2: input.word2,
      });
    }),

  clearTemplate: vendorProcedure.mutation(async ({ ctx }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    await ctx.db.update({
      collection: "vendors",
      id: vendorId,
      data: {
        logoSource: "upload",
        logoTemplate: {
          selectedTemplate: null,
          word1: null,
          word2: null,
        },
      },
    });

    await revalidateVendorLogoStorefront(ctx.db, vendorId);

    return { success: true };
  }),
});
