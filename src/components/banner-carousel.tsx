"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** Shape every banner feed (marketplace or vendor storefront) exposes. */
export interface CarouselBanner<TProduct> {
  id: string;
  title: string;
  subtitle?: string | null;
  backgroundImage?: string | null;
  products?: TProduct[] | null;
}

export interface BannerCarouselClassNames {
  /** Background slide (image wrapper and the gradient fallback). */
  background?: string;
  /** Row holding the product cards when they fit without scrolling. */
  flexRow?: string;
  flexItem?: string;
  /** Row holding the product cards in horizontal scroll mode. */
  scrollRegion?: string;
  scrollRow?: string;
  scrollItem?: string;
}

interface BannerCarouselProps<TProduct> {
  banners: CarouselBanner<TProduct>[];
  renderProductCard: (product: TProduct) => React.ReactNode;
  getProductKey: (product: TProduct) => string;
  titleAs?: "h1" | "h2";
  /** Adds `data-template-hero-banner`, which storefront templates size via CSS. */
  templateSized?: boolean;
  classNames?: BannerCarouselClassNames;
  /** Rendered instead of the product row when a banner has no products. */
  emptyProducts?: React.ReactNode;
}

/** Products spread across the full banner width up to this count, then scroll. */
const MAX_FLEX_PRODUCTS = 6;
const AUTOPLAY_INTERVAL_MS = 3000;

export function BannerCarousel<TProduct>({
  banners,
  renderProductCard,
  getProductKey,
  titleAs = "h2",
  templateSized = false,
  classNames,
  emptyProducts = null,
}: BannerCarouselProps<TProduct>) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const bannerCount = banners.length;

  const nextSlide = React.useCallback(() => {
    if (bannerCount === 0) return;
    setCurrentIndex((prev) => (prev + 1) % bannerCount);
  }, [bannerCount]);

  const prevSlide = React.useCallback(() => {
    if (bannerCount === 0) return;
    setCurrentIndex((prev) => (prev - 1 + bannerCount) % bannerCount);
  }, [bannerCount]);

  React.useEffect(() => {
    if (bannerCount <= 1) return;
    const timer = setInterval(nextSlide, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [nextSlide, bannerCount]);

  React.useEffect(() => {
    setCurrentIndex((prev) => (prev < bannerCount ? prev : 0));
  }, [bannerCount]);

  if (bannerCount === 0) return null;

  const Title = titleAs;
  const backgroundAttrs = templateSized ? { "data-template-hero-banner": true } : {};

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <div className="relative">
        {banners.map((banner, index) => {
          const products = banner.products ?? [];
          const useFlex = products.length <= MAX_FLEX_PRODUCTS;

          return (
            <div
              key={banner.id}
              className={cn(
                "transition-opacity duration-500",
                index === currentIndex
                  ? "relative opacity-100"
                  : "absolute inset-0 opacity-0",
              )}
            >
              {banner.backgroundImage ? (
                <div
                  {...backgroundAttrs}
                  className={cn("relative w-full", classNames?.background)}
                >
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
                <div
                  {...backgroundAttrs}
                  className={cn(
                    "w-full bg-gradient-to-r from-gray-800 to-gray-600",
                    classNames?.background,
                  )}
                />
              )}

              <div className="absolute inset-0 flex flex-col">
                <div className="px-8 lg:px-16 pt-8 pb-4 z-10">
                  <Title className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    {banner.title}
                  </Title>
                  {banner.subtitle && (
                    <p className="text-lg md:text-xl text-white drop-shadow-lg">
                      {banner.subtitle}
                    </p>
                  )}
                </div>

                {products.length === 0 ? (
                  emptyProducts
                ) : useFlex ? (
                  <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8">
                    <div
                      className={cn(
                        "flex gap-2 md:gap-3 lg:gap-4 w-full",
                        classNames?.flexRow,
                      )}
                    >
                      {products.map((product) => (
                        <div
                          key={getProductKey(product)}
                          className={cn("flex-1 min-w-0", classNames?.flexItem)}
                        >
                          {renderProductCard(product)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8",
                      classNames?.scrollRegion,
                    )}
                  >
                    <div
                      className={cn(
                        "flex gap-2 md:gap-3 lg:gap-4 w-full overflow-x-auto scrollbar-hide",
                        classNames?.scrollRow,
                      )}
                    >
                      {products.map((product) => (
                        <div
                          key={getProductKey(product)}
                          className={cn("shrink-0", classNames?.scrollItem)}
                        >
                          {renderProductCard(product)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {bannerCount > 1 && (
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
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75",
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
