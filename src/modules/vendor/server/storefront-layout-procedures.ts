import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import { revalidatePath } from "next/cache";
import { createTRPCRouter, vendorProcedure } from "@/trpc/init";
import {
  isStorefrontLayoutId,
  STOREFRONT_LAYOUT_IDS,
  STOREFRONT_LAYOUTS,
  resolveEffectiveStorefrontLayout,
} from "@/lib/templates/storefront-layouts";
import { type TemplateDocLike } from "@/lib/templates/resolve-template-doc";
import { getDefaultTemplate } from "@/lib/templates/template-engine";

async function revalidateVendorStorefront(db: Payload, vendorId: string) {
  const vendor = await db.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 0,
  });
  if (vendor.slug) {
    revalidatePath(`/vendors/${vendor.slug}`);
  }
}

function getTemplateLayoutFromDoc(template: TemplateDocLike | null | undefined): string | null {
  const mapping = template?.componentMapping as { layout?: string } | null | undefined;
  return typeof mapping?.layout === "string" ? mapping.layout : null;
}

async function loadVendorThemeTemplate(
  db: Payload,
  selectedTemplate: string | { id: string } | null | undefined,
): Promise<TemplateDocLike | null> {
  if (!selectedTemplate) {
    return getDefaultTemplate(db);
  }

  try {
    if (typeof selectedTemplate === "string") {
      return (await db.findByID({
        collection: "vendor-templates",
        id: selectedTemplate,
        depth: 0,
      })) as TemplateDocLike;
    }
    return selectedTemplate as TemplateDocLike;
  } catch {
    return getDefaultTemplate(db);
  }
}

export const vendorStorefrontLayoutRouter = createTRPCRouter({
  list: vendorProcedure.query(async ({ ctx }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    const vendor = await ctx.db.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 0,
    });

    const themeTemplate = await loadVendorThemeTemplate(ctx.db, vendor.selectedTemplate);
    const templateLayoutId = getTemplateLayoutFromDoc(themeTemplate);
    const selectedLayoutId =
      typeof vendor.selectedLayoutId === "string" ? vendor.selectedLayoutId : null;
    const effectiveLayoutId = resolveEffectiveStorefrontLayout(
      selectedLayoutId,
      templateLayoutId,
    );

    return {
      docs: STOREFRONT_LAYOUTS.map((layout) => ({
        ...layout,
        isSelected: layout.id === effectiveLayoutId,
        isExplicitSelection: selectedLayoutId === layout.id,
      })),
      selectedLayoutId,
      templateLayoutId,
      effectiveLayoutId,
      usesThemeDefault: !selectedLayoutId,
    };
  }),

  select: vendorProcedure
    .input(
      z.object({
        layoutId: z.enum(STOREFRONT_LAYOUT_IDS),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isStorefrontLayoutId(input.layoutId)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid layout" });
      }

      const vendorId =
        typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

      await ctx.db.update({
        collection: "vendors",
        id: vendorId,
        data: {
          selectedLayoutId: input.layoutId,
        },
      });

      await revalidateVendorStorefront(ctx.db, vendorId);

      const layout = STOREFRONT_LAYOUTS.find((item) => item.id === input.layoutId);

      return {
        selectedLayoutId: input.layoutId,
        label: layout?.label ?? input.layoutId,
      };
    }),

  clear: vendorProcedure.mutation(async ({ ctx }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    const vendor = await ctx.db.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 0,
    });

    const themeTemplate = await loadVendorThemeTemplate(ctx.db, vendor.selectedTemplate);
    const templateLayoutId = getTemplateLayoutFromDoc(themeTemplate);

    await ctx.db.update({
      collection: "vendors",
      id: vendorId,
      data: {
        selectedLayoutId: null,
      },
    });

    await revalidateVendorStorefront(ctx.db, vendorId);

    return {
      selectedLayoutId: null,
      effectiveLayoutId: resolveEffectiveStorefrontLayout(null, templateLayoutId),
    };
  }),
});
