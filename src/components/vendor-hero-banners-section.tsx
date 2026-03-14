"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function VendorHeroBannerProductCard({
  id,
  name,
  imageUrl,
  slug,
}: {
  id: string;
  name: string;
  imageUrl: string | null;
  slug: string;
}) {
  return (
    <Link href={`/products/${slug}`} className="block h-full">
      <div className="relative h-full w-full rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
        {imageUrl ? (
          <div className="relative w-full h-3/4">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain p-2"
            />
          </div>
        ) : (
          <div className="w-full h-3/4 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-xs">No Image</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white text-xs font-semibold line-clamp-2 drop-shadow-lg group-hover:underline">
            {name}
          </h3>
        </div>
      </div>
    </Link>
  );
}

interface VendorHeroBannersSectionProps {
  vendorSlug: string;
}

export function VendorHeroBannersSection({ vendorSlug }: VendorHeroBannersSectionProps) {
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

  // Auto-play carousel - 3 seconds
  React.useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, [nextSlide, banners]);

  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden h-[500px] bg-gray-200 animate-pulse" />
    );
  }

  if (error) {
    console.error('Error loading vendor hero banners:', error);
    return null; // Fail silently, fallback to default vendor display
  }

  if (!banners || banners.length === 0) {
    return null; // No banners, fallback to default vendor display
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* Banner Container */}
      <div className="relative">
        {banners.map((banner: { id: string; title: string; subtitle?: string; backgroundImage?: string; products?: Array<{ id: string; name: string; image: string | null; slug: string }> }, index: number) => (
          <div
            key={banner.id}
            className={cn(
              'transition-opacity duration-500',
              index === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
            )}
          >
            {/* Background Image (if available) */}
            {banner.backgroundImage ? (
              <div className="relative h-[400px] lg:h-[500px]">
                <Image
                  src={banner.backgroundImage}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              </div>
            ) : (
              <div className="h-[400px] lg:h-[500px] bg-gradient-to-r from-gray-800 to-gray-600" />
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col">
              {/* Title and Subtitle - Top */}
              <div className="px-8 lg:px-16 pt-8 pb-4 z-10">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {banner.title}
                </h1>
                {banner.subtitle && (
                  <p className="text-lg md:text-xl text-white drop-shadow-lg">
                    {banner.subtitle}
                  </p>
                )}
              </div>

              {/* Featured Products - Bottom */}
              {banner.products && banner.products.length > 0 ? (() => {
                const productCount = banner.products.length;
                const useFlex = productCount <= 6;
                
                if (useFlex) {
                  // Flexbox mode: Products spread evenly across full banner width
                  return (
                    <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8">
                      <div className="flex gap-2 md:gap-3 lg:gap-4 w-full" style={{ height: '280px' }}>
                        {banner.products.map((product: any) => (
                          <div key={product.id} className="flex-1">
                            <VendorHeroBannerProductCard
                              id={product.id}
                              name={product.name}
                              imageUrl={product.image}
                              slug={product.slug}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  // Scroll mode: Horizontal scrolling for more than 6 products
                  return (
                    <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8">
                      <div className="flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide" style={{ height: '280px' }}>
                        {banner.products.map((product: any) => (
                          <div key={product.id} className="flex-shrink-0" style={{ width: '200px' }}>
                            <VendorHeroBannerProductCard
                              id={product.id}
                              name={product.name}
                              imageUrl={product.image}
                              slug={product.slug}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              })() : null}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_banner: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
