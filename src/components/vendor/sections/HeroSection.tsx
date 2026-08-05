import Image from "next/image";
import { Suspense } from "react";
import { VendorHeroBannersSection } from "@/components/vendor-hero-banners-section";
import { getDescriptionText } from "@/components/vendor/layouts/utils";
import type { SectionProps } from "./types";

/**
 * HeroSection
 * The vendor hero banner carousel with the gradient/cover-image fallback,
 * extracted from the original DefaultLayout.
 */
export function HeroSection({ settings, vendor, products, preview }: SectionProps) {
  const useVendorBanners = settings.useVendorBanners !== false && !preview;
  const height = typeof settings.height === "string" ? settings.height : null;

  const title = typeof settings.title === "string" && settings.title ? settings.title : vendor.name;
  const subtitle =
    typeof settings.subtitle === "string" && settings.subtitle
      ? settings.subtitle
      : getDescriptionText(vendor.description);

  const backgroundImageUrl =
    vendor.coverImage && typeof vendor.coverImage === "object" && vendor.coverImage.url
      ? vendor.coverImage.url
      : null;
  const featuredProducts = products.slice(0, 6);

  const fallbackBanner = (
    <div className="relative w-full overflow-hidden">
      {backgroundImageUrl ? (
        <div className="relative h-[400px] lg:h-[500px]" style={height ? { height } : undefined}>
          <Image src={backgroundImageUrl} alt={title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
      ) : (
        <div
          className="h-[400px] lg:h-[500px] flex items-center justify-center"
          style={{
            background: `linear-gradient(to right, var(--template-primary), var(--template-secondary))`,
            ...(height ? { height } : {}),
          }}
        >
          <div className="text-center px-8">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg"
              style={{
                color: "white",
                fontFamily: "var(--template-font-heading)",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-lg md:text-xl drop-shadow-lg"
                style={{
                  color: "white",
                  fontFamily: "var(--template-font-body)",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (!useVendorBanners) {
    return fallbackBanner;
  }

  return (
    <>
      <Suspense fallback={fallbackBanner}>
        <VendorHeroBannersSection vendorSlug={vendor.slug} />
      </Suspense>

      {/* Fallback banner when the vendor has neither a cover image nor products */}
      {!backgroundImageUrl && featuredProducts.length === 0 && fallbackBanner}
    </>
  );
}
