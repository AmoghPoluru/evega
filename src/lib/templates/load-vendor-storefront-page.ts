import type { Payload } from "payload";
import type { TemplateCustomization } from "@/types/template-customization";
import {
  resolveVendorTemplate,
  resolveVendorTemplatePreview,
} from "@/lib/templates/template-engine";
import { buildFallbackResolvedTemplate } from "@/lib/templates/default-template";
import { resolveHappyBannerForVendor } from "@/lib/happy-banner/resolve";
import type { Vendor } from "@/payload-types";
import { resolveVendorLogoTemplate, type VendorWithLogoTemplate } from "@/lib/vendor-logo/resolve";
import type { ResolvedVendorLogoTemplate } from "@/lib/vendor-logo/types";

export type VendorStorefrontPageData = {
  vendor: Vendor;
  products: Awaited<ReturnType<Payload["find"]>>["docs"];
  resolvedTemplate: Awaited<ReturnType<typeof resolveVendorTemplate>>;
  happyBanner: Awaited<ReturnType<typeof resolveHappyBannerForVendor>>;
  resolvedLogoTemplate: ResolvedVendorLogoTemplate | null;
  previewMode: boolean;
};

export async function loadVendorStorefrontPageData(
  payload: Payload,
  vendor: Vendor,
  options?: { previewTemplateId?: string },
): Promise<VendorStorefrontPageData> {
  const productsData = await payload.find({
    collection: "products",
    where: {
      vendor: { equals: vendor.id },
      isPrivate: { equals: false },
      isArchived: { equals: false },
    },
    limit: 100,
    depth: 2,
    sort: "-createdAt",
  });

  const previewTemplateId = options?.previewTemplateId?.trim();
  let resolvedTemplate;
  try {
    if (previewTemplateId) {
      resolvedTemplate = await resolveVendorTemplatePreview(
        vendor.id,
        previewTemplateId,
        payload,
      );
    } else {
      resolvedTemplate = await resolveVendorTemplate(vendor.id, payload);
    }
  } catch (error) {
    console.error("Error resolving vendor template:", error);
    const customization =
      (vendor.templateCustomization as TemplateCustomization) || {};
    resolvedTemplate = buildFallbackResolvedTemplate(customization);
  }

  const happyBanner = await resolveHappyBannerForVendor(payload, vendor);
  const resolvedLogoTemplate = await resolveVendorLogoTemplate(
    payload,
    vendor as VendorWithLogoTemplate,
  );

  return {
    vendor,
    products: productsData.docs,
    resolvedTemplate,
    happyBanner,
    resolvedLogoTemplate,
    previewMode: Boolean(previewTemplateId),
  };
}

/** Load an approved vendor by storefront slug. */
export async function loadApprovedVendorBySlug(
  payload: Payload,
  slug: string,
): Promise<Vendor | null> {
  const vendorsResult = await payload.find({
    collection: "vendors",
    where: {
      slug: { equals: slug },
      status: { equals: "approved" },
      isActive: { equals: true },
    },
    limit: 1,
    depth: 2,
  });

  return vendorsResult.docs[0] ?? null;
}
