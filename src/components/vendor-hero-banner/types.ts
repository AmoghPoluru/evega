export interface VendorHeroBannerProduct {
  id: string;
  name: string;
  slug?: string;
  price?: number;
  image?: string | { url?: string | null } | null;
}

export interface VendorHeroBannerSlideData {
  title: string;
  subtitle?: string | null;
  backgroundImage?: string | null;
  products?: VendorHeroBannerProduct[];
}

export function resolveProductImageUrl(
  image: VendorHeroBannerProduct["image"],
): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (typeof image === "object" && image.url) return image.url;
  return null;
}
