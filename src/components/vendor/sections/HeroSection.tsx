"use client";

import Image from "next/image";
import { Suspense } from "react";
import { VendorHeroBannersSection } from "@/components/vendor-hero-banners-section";
import { getDescriptionText, getMediaUrl } from "@/components/vendor/layouts/utils";
import type { SectionProps } from "./types";

type HeroVariant = "full-bleed" | "full-width" | "split-media" | "split" | "minimal-type" | "minimal";

function resolveHeroVariant(settings: Record<string, unknown>, template: SectionProps["template"]): HeroVariant {
  const fromSettings = settings.variant;
  if (typeof fromSettings === "string") return fromSettings as HeroVariant;
  const fromConfig = template.templateConfig.components?.heroBanner?.style;
  if (fromConfig === "split") return "split-media";
  if (fromConfig === "minimal") return "minimal-type";
  return "full-bleed";
}

/**
 * HeroSection with variant branches driven by settings.variant or components.heroBanner.style.
 */
export function HeroSection({ settings, vendor, products, template, preview }: SectionProps) {
  const variant = resolveHeroVariant(settings, template);
  const useVendorBanners = settings.useVendorBanners !== false && !preview;
  const height =
    typeof settings.height === "string"
      ? settings.height
      : template.templateConfig.components?.heroBanner?.height ?? "400px";

  const title = typeof settings.title === "string" && settings.title ? settings.title : vendor.name;
  const subtitle =
    typeof settings.subtitle === "string" && settings.subtitle
      ? settings.subtitle
      : getDescriptionText(vendor.description);

  const backgroundImageUrl = getMediaUrl(vendor.coverImage) ?? getMediaUrl(vendor.logo);
  const featuredProducts = products.slice(0, 6);

  if (variant === "minimal-type" || variant === "minimal") {
    return (
      <section
        className="mx-auto px-6 py-20 text-center"
        style={{ maxWidth: "var(--template-container-width)" }}
      >
        <h1
          className="font-bold"
          style={{
            fontFamily: "var(--template-font-heading)",
            fontSize: "var(--template-hero-title-size, 3rem)",
            fontWeight: "var(--template-hero-title-weight, 700)",
            color: "var(--template-text)",
            textTransform: "var(--template-h1-transform, none)" as React.CSSProperties["textTransform"],
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className="mx-auto mt-4 max-w-2xl"
            style={{
              fontFamily: "var(--template-font-body)",
              color: "var(--template-text-secondary)",
              fontSize: "var(--template-hero-subtitle-size, 1.25rem)",
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </section>
    );
  }

  if (variant === "split-media" || variant === "split") {
    return (
      <section className="grid min-h-[420px] md:grid-cols-2">
        <div className="relative min-h-[320px]">
          {backgroundImageUrl ? (
            <Image src={backgroundImageUrl} alt={title} fill priority className="object-cover" />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, var(--template-primary), var(--template-secondary))",
              }}
            />
          )}
        </div>
        <div
          className="flex flex-col justify-center px-8 py-12 md:px-16"
          style={{ backgroundColor: "var(--template-card-bg)" }}
        >
          <h1
            className="text-3xl font-bold md:text-5xl"
            style={{ fontFamily: "var(--template-font-heading)", color: "var(--template-text)" }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-lg" style={{ color: "var(--template-text-secondary)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  const fallbackBanner = (
    <div className="relative w-full overflow-hidden">
      {backgroundImageUrl ? (
        <div className="relative" style={{ height }}>
          <Image src={backgroundImageUrl} alt={title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <h1
              className="text-4xl font-bold text-white md:text-6xl"
              style={{
                fontFamily: "var(--template-font-heading)",
                textShadow: "var(--template-hero-text-shadow, 2px 2px 8px rgba(0,0,0,0.5))",
              }}
            >
              {title}
            </h1>
            {subtitle ? <p className="mt-4 max-w-2xl text-lg text-white/90">{subtitle}</p> : null}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{
            height,
            background: "linear-gradient(to right, var(--template-primary), var(--template-secondary))",
          }}
        >
          <div className="px-8 text-center">
            <h1
              className="text-3xl font-bold text-white md:text-5xl"
              style={{ fontFamily: "var(--template-font-heading)" }}
            >
              {title}
            </h1>
            {subtitle ? <p className="mt-4 text-lg text-white/90">{subtitle}</p> : null}
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
      {!backgroundImageUrl && featuredProducts.length === 0 && fallbackBanner}
    </>
  );
}
