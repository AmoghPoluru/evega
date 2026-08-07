import type { Payload } from "payload";
import type { Vendor } from "@/payload-types";
import { isHappyBannerPlatformEnabled } from "./config";
import { buildResolvedHappyBanner } from "./format-banner";
import { getHappyBannerRelationshipId } from "./relationship-id";
import type { HappyBannerDocFields, ResolvedHappyBanner } from "./types";

type HappyBannerRecord = HappyBannerDocFields & { id: string };

type VendorDoc = Vendor & {
  happyBanner?: {
    selectedBanner?: string | HappyBannerRecord | null;
    word1?: string | null;
    word2?: string | null;
  } | null;
};

async function getVendorSelectedHappyBanner(
  payload: Payload,
  vendor: VendorDoc,
): Promise<HappyBannerRecord | null> {
  const selectedId = getHappyBannerRelationshipId(vendor.happyBanner?.selectedBanner);
  if (!selectedId) {
    return null;
  }

  const selected = await payload
    .findByID({
      collection: "happy-banners",
      id: selectedId,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null);

  if (!selected || selected.isActive === false) {
    return null;
  }

  return selected as HappyBannerRecord;
}

export async function resolveHappyBannerForVendor(
  payload: Payload,
  vendor: VendorDoc,
): Promise<ResolvedHappyBanner | null> {
  const platformEnabled = await isHappyBannerPlatformEnabled(payload);
  if (!platformEnabled) {
    return null;
  }

  const bannerDoc = await getVendorSelectedHappyBanner(payload, vendor);
  if (!bannerDoc) {
    return null;
  }

  return buildResolvedHappyBanner(bannerDoc, {
    word1: vendor.happyBanner?.word1,
    word2: vendor.happyBanner?.word2,
    vendorSlug: vendor.slug ?? "",
  });
}

export async function resolveHappyBannerForSlug(
  payload: Payload,
  vendorSlug: string,
): Promise<ResolvedHappyBanner | null> {
  const result = await payload.find({
    collection: "vendors",
    where: {
      slug: { equals: vendorSlug },
      status: { equals: "approved" },
      isActive: { equals: true },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const vendor = result.docs[0] as VendorDoc | undefined;
  if (!vendor) return null;

  return resolveHappyBannerForVendor(payload, vendor);
}
