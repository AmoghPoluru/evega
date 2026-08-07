import type { VendorLogoDocFields, VendorLogoPreset } from "./types";
import { resolveVendorLogoTheme } from "./format-logo";
import { getVendorLogoWordDefaults, getVendorLogoWordSlots } from "./vendor-words";

type MediaLike = { url?: string | null; id?: string };

function getPreviewImageUrl(previewImage: string | MediaLike | null | undefined): string | null {
  if (!previewImage || typeof previewImage === "string") return null;
  return typeof previewImage.url === "string" ? previewImage.url : null;
}

export function formatVendorLogoListItem(
  template: VendorLogoDocFields & {
    id: string;
    updatedAt?: string;
    previewImage?: string | MediaLike | null;
  },
) {
  return {
    id: template.id,
    name: template.name ?? "",
    slug: template.slug ?? "",
    description: template.description ?? null,
    preset: template.preset ?? "lotus-grace",
    defaultWord1: getVendorLogoWordDefaults(template).word1,
    defaultWord2: getVendorLogoWordDefaults(template).word2,
    vendorWordSlots: getVendorLogoWordSlots(template),
    theme: resolveVendorLogoTheme(template, template.preset as VendorLogoPreset | null),
    thumbnailUrl: getPreviewImageUrl(template.previewImage),
    isDefault: template.isDefault ?? false,
    isActive: template.isActive ?? true,
    updatedAt: template.updatedAt ?? "",
  };
}
