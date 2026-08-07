import type { Payload } from "payload";
import type { Vendor } from "@/payload-types";
import { buildResolvedVendorLogoTemplate } from "./format-logo";
import type { ResolvedVendorLogoTemplate, VendorLogoDocFields, VendorLogoSource } from "./types";
import { getVendorLogoRelationshipId } from "./relationship-id";

export type VendorWithLogoTemplate = Vendor & {
  logoSource?: VendorLogoSource | null;
  logoTemplate?: {
    selectedTemplate?: string | { id: string } | null;
    word1?: string | null;
    word2?: string | null;
  } | null;
};

export function getVendorLogoUploadUrl(vendor: Vendor): string | null {
  const logo = vendor.logo;
  if (!logo || typeof logo === "string") return null;
  return logo.url ?? null;
}

export async function resolveVendorLogoTemplate(
  db: Payload,
  vendor: VendorWithLogoTemplate,
): Promise<ResolvedVendorLogoTemplate | null> {
  if (vendor.logoSource !== "template") return null;

  const templateId = getVendorLogoRelationshipId(vendor.logoTemplate?.selectedTemplate);
  if (!templateId) return null;

  const template = await db
    .findByID({
      collection: "vendor-logo-templates",
      id: templateId,
      depth: 0,
    })
    .catch(() => null);

  if (!template || template.isActive === false) return null;

  return buildResolvedVendorLogoTemplate(template as VendorLogoDocFields & { id: string }, {
    word1: vendor.logoTemplate?.word1,
    word2: vendor.logoTemplate?.word2,
  });
}
