"use client";

import { VendorHeroBannerSlide } from "@/components/vendor-hero-banner/VendorHeroBannerSlide";
import type { VendorHeroBannerProduct } from "@/components/vendor-hero-banner/types";

interface HeroBannerPreviewProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string | null;
  products?: VendorHeroBannerProduct[];
}

export function HeroBannerPreview({
  title,
  subtitle,
  backgroundImage,
  products = [],
}: HeroBannerPreviewProps) {
  return (
    <VendorHeroBannerSlide
      title={title}
      subtitle={subtitle}
      backgroundImage={backgroundImage}
      products={products}
      className="rounded-lg border"
    />
  );
}
