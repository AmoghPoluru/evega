"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { VendorHeroBannerSlide } from "@/components/vendor-hero-banner/VendorHeroBannerSlide";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";

interface VendorHeroBannersSectionProps {
  vendorSlug: string;
  fallback?: React.ReactNode;
  preferVendorBanners?: boolean;
}

export function VendorHeroBannersSection({
  vendorSlug,
  fallback = null,
  preferVendorBanners = true,
}: VendorHeroBannersSectionProps) {
  const { data: banners, isLoading, error } = trpc.vendorHeroBanners.useQuery({ vendorSlug });
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextSlide = React.useCallback(() => {
    if (!banners || banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners]);

  const prevSlide = React.useCallback(() => {
    if (!banners || banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners]);

  React.useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, [nextSlide, banners]);

  if (isLoading) {
    if (preferVendorBanners) {
      return (
        <div className="relative h-[300px] w-full overflow-hidden animate-pulse bg-gray-200" />
      );
    }
    return <>{fallback}</>;
  }

  if (error) {
    console.error("Error loading vendor hero banners:", error);
    return <>{fallback}</>;
  }

  if (!banners || banners.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <div className="relative">
        {banners.map(
          (
            banner: {
              id: string;
              title: string;
              subtitle?: string;
              backgroundImage?: string;
              products?: Array<{
                id: string;
                name: string;
                image: string | null;
                slug: string;
                price?: number;
              }>;
            },
            index: number,
          ) => (
            <div
              key={banner.id}
              className={cn(
                "transition-opacity duration-500",
                index === currentIndex ? "opacity-100" : "absolute inset-0 opacity-0",
              )}
            >
              <VendorHeroBannerSlide
                title={banner.title}
                subtitle={banner.subtitle}
                backgroundImage={banner.backgroundImage ?? null}
                products={banner.products?.map((product) => ({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image: product.image,
                }))}
                interactive
              />
            </div>
          ),
        )}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((_banner: unknown, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75",
                )}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
