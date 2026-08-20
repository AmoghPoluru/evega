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

async function brandingFromVendorDoc(
  db: Payload,
  vendor: VendorWithLogoTemplate & { name?: string | null; slug?: string | null; logoSource?: string | null },
): Promise<VendorStorefrontBranding | null> {
  if (!vendor?.slug || !vendor.name) return null;

  const logoSource = (vendor.logoSource ?? "upload") as VendorLogoSource;
  const uploadLogoUrl = getVendorLogoUploadUrl(vendor);

  let templateLogo: ResolvedVendorLogoTemplate | null = null;
  if (logoSource === "template") {
    templateLogo = await resolveVendorLogoTemplate(db, vendor);
  }

  return {
    vendorName: vendor.name,
    slug: vendor.slug,
    logoSource,
    uploadLogoUrl: logoSource === "upload" ? uploadLogoUrl : null,
    templateLogo,
  };
}

export async function getVendorStorefrontBranding(
  db: Payload,
  slug: string,
): Promise<VendorStorefrontBranding | null> {
  const vendor = await loadApprovedVendorBySlug(db, slug);
  if (!vendor) return null;
  return brandingFromVendorDoc(db, vendor as VendorWithLogoTemplate);
}

export async function getVendorStorefrontBrandingForProduct(
  db: Payload,
  productId: string,
): Promise<VendorStorefrontBranding | null> {
  const product = await db
    .findByID({
      collection: "products",
      id: productId,
      depth: 2,
      overrideAccess: true,
    })
    .catch(() => null);

  if (!product || product.isArchived) return null;

  const vendor = product.vendor;
  if (vendor && typeof vendor === "object") {
    const fromDoc = await brandingFromVendorDoc(db, vendor as VendorWithLogoTemplate);
    if (fromDoc) return fromDoc;
  }

  const vendorId =
    typeof vendor === "string"
      ? vendor
      : vendor && typeof vendor === "object" && "id" in vendor
        ? String((vendor as { id: string }).id)
        : null;

  if (!vendorId) return null;

  const vendorDoc = await db
    .findByID({
      collection: "vendors",
      id: vendorId,
      depth: 2,
      overrideAccess: true,
    })
    .catch(() => null);

  if (!vendorDoc) return null;
  return brandingFromVendorDoc(db, vendorDoc as VendorWithLogoTemplate);
}
