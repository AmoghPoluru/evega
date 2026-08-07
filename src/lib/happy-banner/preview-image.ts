import type { HappyBannerDocFields } from "./types";
import { getHappyBannerVendorWordDefaults, getHappyBannerVendorWordSlots } from "./vendor-words";

type MediaLike = {
  url?: string | null;
  id?: string;
};

/** Resolve preview image URL from a Payload media relationship. */
export function getHappyBannerPreviewImageUrl(
  previewImage: string | MediaLike | null | undefined,
): string | null {
  if (!previewImage || typeof previewImage === "string") return null;
  return typeof previewImage.url === "string" ? previewImage.url : null;
}

export function getHappyBannerPreviewImageId(
  previewImage: string | MediaLike | null | undefined,
): string | null {
  if (!previewImage) return null;
  if (typeof previewImage === "string") return previewImage;
  return previewImage.id ?? null;
}

export function formatHappyBannerListItem(
  banner: HappyBannerDocFields & {
    id: string;
    updatedAt?: string;
    previewImage?: string | MediaLike | null;
  },
) {
  return {
    id: banner.id,
    name: banner.name ?? "",
    slug: banner.slug ?? "",
    description: banner.description ?? null,
    preset: banner.preset ?? "mega-sale",
    defaultWord1: getHappyBannerVendorWordDefaults(banner).word1,
    defaultWord2: getHappyBannerVendorWordDefaults(banner).word2,
    vendorWordSlots: getHappyBannerVendorWordSlots(banner),
    eyebrowText: banner.eyebrowText ?? "LIMITED TIME ONLY",
    secondaryWord: banner.secondaryWord ?? "SALE",
    ctaLabel: banner.ctaLabel ?? "SHOP NOW",
    discountPrefix: banner.discountPrefix ?? "UP TO",
    discountSuffix: banner.discountSuffix ?? "OFF",
    theme: banner.theme ?? null,
    thumbnailUrl: getHappyBannerPreviewImageUrl(banner.previewImage),
    isDefault: banner.isDefault ?? false,
    isActive: banner.isActive ?? true,
    updatedAt: banner.updatedAt ?? "",
  };
}
