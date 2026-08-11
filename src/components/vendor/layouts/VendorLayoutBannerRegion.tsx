"use client";

import { Suspense } from "react";
import Image from "next/image";

import { HappyBannerDisplay } from "@/components/happy-banner/HappyBannerDisplay";
import { VendorHeroBannersSection } from "@/components/vendor-hero-banners-section";
import type { ResolvedTemplate } from "@/types/template-customization";

import type { VendorLayoutProps } from "./types";
import { getDescriptionText, getMediaUrl } from "./utils";

type VendorLayoutBannerRegionProps = Pick<
  VendorLayoutProps,
  "vendor" | "template" | "happyBanner"
>;

export function isLayoutBannerEnabled(template: ResolvedTemplate): boolean {
  return template.templateConfig.layout?.showBanner !== false;
}

function HeroBannerFallback({
  vendorName,
  subtitle,
  backgroundImageUrl,
}: {
  vendorName: string;
  subtitle: string | null;
  backgroundImageUrl: string | null;
}) {
  return (
    <div className="relative w-full overflow-hidden">
      {backgroundImageUrl ? (
        <div data-template-hero-banner className="relative w-full">
          <Image
            src={backgroundImageUrl}
            alt={vendorName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
      ) : (
        <div
          data-template-hero-banner
          className="flex w-full items-center justify-center"
          style={{
            background: "linear-gradient(to right, var(--template-primary), var(--template-secondary))",
          }}
        >
          <div className="px-8 text-center">
            <h1
              className="text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--template-font-heading)" }}
            >
              {vendorName}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-lg text-white drop-shadow-lg md:text-xl">{subtitle}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/** Happy + hero banner stack shared across storefront layouts. */
export function VendorLayoutBannerRegion({
  vendor,
  template,
  happyBanner,
}: VendorLayoutBannerRegionProps) {
  const showBanner = isLayoutBannerEnabled(template);
  const subtitle = getDescriptionText(vendor.description);
  const backgroundImageUrl = getMediaUrl(vendor.coverImage);

  return (
    <>
      {happyBanner ? <HappyBannerDisplay banner={happyBanner} /> : null}

      {showBanner ? (
        <Suspense
          fallback={
            <HeroBannerFallback
              vendorName={vendor.name}
              subtitle={subtitle}
              backgroundImageUrl={backgroundImageUrl}
            />
          }
        >
          <VendorHeroBannersSection vendorSlug={vendor.slug} enabled />
        </Suspense>
      ) : null}
    </>
  );
}
