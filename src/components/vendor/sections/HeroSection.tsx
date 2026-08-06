"use client";

import Image from "next/image";
import { VendorHeroBannersSection } from "@/components/vendor-hero-banners-section";
import { HappyBanner } from "@/components/happy-banner/HappyBanner";
import { getDescriptionText, getMediaUrl } from "@/components/vendor/layouts/utils";
import { HeroCarouselPeek } from "./HeroCarouselPeek";
import type { SectionProps } from "./types";

type HeroVariant =
  | "full-bleed"
  | "full-width"
  | "split-media"
  | "split"
  | "minimal-type"
  | "minimal"
  | "carousel-peek";

function resolveHeroVariant(settings: Record<string, unknown>, template: SectionProps["template"]): HeroVariant {
  const fromSettings = settings.variant;
  if (typeof fromSettings === "string") return fromSettings as HeroVariant;
  const fromConfig = template.templateConfig.components?.heroBanner?.style;
  if (fromConfig === "split") return "split-media";
  if (fromConfig === "minimal") return "minimal-type";
  return "full-bleed";
}

function renderTemplateHero({
  variant,
  template,
  title,
  subtitle,
  backgroundImageUrl,
  height,
}: {
  variant: HeroVariant;
  template: SectionProps["template"];
  title: string;
  subtitle: string | null;
  backgroundImageUrl: string | null;
  height: string;
}) {
  if (variant === "carousel-peek") {
    return <HeroCarouselPeek template={template} title={title} subtitle={subtitle ?? undefined} />;
  }

  if (variant === "minimal-type" || variant === "minimal") {
    return (
      <section
        className="mx-auto px-6 py-20 text-center"
        style={{ maxWidth: "var(--template-container-width)" }}
      >
        <h1
          className="template-type-hero font-bold"
          style={{
            fontSize: "var(--template-hero-title-size, 3rem)",
            fontWeight: "var(--template-hero-title-weight, 700)",
            textTransform: "var(--template-h1-transform, none)" as React.CSSProperties["textTransform"],
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className="template-type-hero mx-auto mt-4 max-w-2xl"
            style={{
              fontSize: "var(--template-hero-subtitle-size, 1.25rem)",
              opacity: 0.9,
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
          <h1 className="template-type-hero text-3xl font-bold md:text-5xl">{title}</h1>
          {subtitle ? <p className="template-type-hero mt-4 text-lg opacity-90">{subtitle}</p> : null}
        </div>
      </section>
    );
  }

  return (
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
}

/**
 * HeroSection with variant branches driven by settings.variant or components.heroBanner.style.
 * Vendor-created hero banners take precedence on the live storefront when any are active.
 */
export function HeroSection({ settings, vendor, template, preview, happyBanner }: SectionProps) {
  const variant = resolveHeroVariant(settings, template);
  const preferVendorBanners = settings.useVendorBanners !== false;
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

  const templateHero = renderTemplateHero({
    variant,
    template,
    title,
    subtitle,
    backgroundImageUrl,
    height,
  });

  if (preview) {
    return templateHero;
  }

  if (happyBanner?.enabled) {
    return <HappyBanner banner={happyBanner} />;
  }

  return (
    <VendorHeroBannersSection
      vendorSlug={vendor.slug}
      fallback={templateHero}
      preferVendorBanners={preferVendorBanners}
    />
  );
}
