import type { Payload } from "payload";
import { loadApprovedVendorBySlug } from "@/lib/templates/load-vendor-storefront-page";
import {
  getVendorLogoUploadUrl,
  resolveVendorLogoTemplate,
  type VendorWithLogoTemplate,
} from "./resolve";
import type { ResolvedVendorLogoTemplate, VendorLogoSource } from "./types";

export type VendorStorefrontBranding = {
  vendorName: string;
  slug: string;
  logoSource: VendorLogoSource;
  uploadLogoUrl: string | null;
  templateLogo: ResolvedVendorLogoTemplate | null;
};

export async function getVendorStorefrontBranding(
  db: Payload,
  slug: string,
): Promise<VendorStorefrontBranding | null> {
  const vendor = await loadApprovedVendorBySlug(db, slug);
  if (!vendor) return null;

  const logoSource = (vendor.logoSource ?? "upload") as VendorLogoSource;
  const uploadLogoUrl = getVendorLogoUploadUrl(vendor);

  let templateLogo: ResolvedVendorLogoTemplate | null = null;
  if (logoSource === "template") {
    templateLogo = await resolveVendorLogoTemplate(db, vendor as VendorWithLogoTemplate);
  }

  return {
    vendorName: vendor.name,
    slug: vendor.slug,
    logoSource,
    uploadLogoUrl: logoSource === "upload" ? uploadLogoUrl : null,
    templateLogo,
  };
}
