import type { Payload } from "payload";
import type { Vendor } from "@/payload-types";
import { buildResolvedVendorLogoTemplate } from "./format-logo";
import { getVendorLogoRelationshipId } from "./relationship-id";
import type { ResolvedVendorLogoTemplate, VendorLogoDocFields, VendorLogoSource } from "./types";

export type VendorListLogoFields = Pick<Vendor, "id" | "logo" | "logoSource"> & {
  logoTemplate?: {
    selectedTemplate?: string | { id?: string } | null;
    word1?: string | null;
    word2?: string | null;
  } | null;
};

export type VendorListLogoBranding = {
  logoSource: VendorLogoSource;
  logoUrl: string | null;
  templateLogo: ResolvedVendorLogoTemplate | null;
};

function getVendorUploadLogoUrl(vendor: VendorListLogoFields): string | null {
  const logo = vendor.logo;
  if (!logo || typeof logo === "string") return null;
  return logo.url ?? null;
}

/**
 * Resolve upload + template logos for marketplace vendor list cards (batched).
 */
export async function resolveVendorListLogoBranding(
  db: Payload,
  vendors: VendorListLogoFields[],
): Promise<Map<string, VendorListLogoBranding>> {
  const templateIds = new Set<string>();

  for (const vendor of vendors) {
    if (vendor.logoSource !== "template") continue;
    const templateId = getVendorLogoRelationshipId(vendor.logoTemplate?.selectedTemplate);
    if (templateId) templateIds.add(templateId);
  }

  const templatesById = new Map<string, VendorLogoDocFields & { id: string }>();

  if (templateIds.size > 0) {
    const templates = await db.find({
      collection: "vendor-logo-templates",
      where: {
        and: [
          { id: { in: Array.from(templateIds) } },
          { isActive: { equals: true } },
        ],
      },
      limit: templateIds.size,
      depth: 0,
    });

    for (const doc of templates.docs) {
      templatesById.set(doc.id, doc as VendorLogoDocFields & { id: string });
    }
  }

  const brandingByVendorId = new Map<string, VendorListLogoBranding>();

  for (const vendor of vendors) {
    const logoSource = (vendor.logoSource ?? "upload") as VendorLogoSource;
    const logoUrl = logoSource === "upload" ? getVendorUploadLogoUrl(vendor) : null;

    let templateLogo: ResolvedVendorLogoTemplate | null = null;
    if (logoSource === "template") {
      const templateId = getVendorLogoRelationshipId(vendor.logoTemplate?.selectedTemplate);
      const template = templateId ? templatesById.get(templateId) : undefined;
      if (template) {
        templateLogo = buildResolvedVendorLogoTemplate(template, {
          word1: vendor.logoTemplate?.word1,
          word2: vendor.logoTemplate?.word2,
        });
      }
    }

    brandingByVendorId.set(vendor.id, {
      logoSource,
      logoUrl,
      templateLogo,
    });
  }

  return brandingByVendorId;
}
