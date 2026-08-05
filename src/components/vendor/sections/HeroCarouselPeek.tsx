"use client";

import type { CSSProperties } from "react";

import { resolveStorefrontChrome } from "@/lib/templates/storefront-chrome";
import type { ResolvedTemplate } from "@/types/template-customization";

interface HeroCarouselPeekProps {
  template: ResolvedTemplate;
  title: string;
  subtitle?: string;
}

function heroHeadlineStyle(): CSSProperties {
  return {
    fontFamily: "var(--template-font-hero, var(--chrome-font-hero-headline, Anton, sans-serif))",
    color: "var(--template-color-hero, var(--chrome-hero-text))",
    fontWeight: "var(--chrome-weight-hero-headline, 400)" as CSSProperties["fontWeight"],
    letterSpacing: "var(--chrome-spacing-hero-headline, 0.02em)",
    textTransform: "var(--chrome-transform-hero-headline, uppercase)" as CSSProperties["textTransform"],
    transform: "skewX(var(--chrome-skew-hero-headline, -8deg))",
    display: "inline-block",
    fontSize: "var(--chrome-hero-headline-size, 68px)",
    lineHeight: 1.05,
  };
}

export function HeroCarouselPeek({ template, title, subtitle }: HeroCarouselPeekProps) {
  const chrome = resolveStorefrontChrome(template.templateConfig);
  const content = chrome.content ?? {};
  const features = chrome.features ?? {};
  const peek = features.heroCarouselPeek !== false;

  const headline = content.heroHeadline || title;
  const subtext = content.heroSubtext || subtitle;
  const label = content.heroLabel;
  const primaryCta = content.primaryCta ?? "Shop new collection";
  const secondaryCta = content.secondaryCta ?? "Explore best sellers";
  const showDualCta = features.dualCta !== false;

  const slideStyle = (bg: string): CSSProperties => ({
    backgroundColor: bg,
    height: "var(--chrome-hero-height, 660px)",
  });

  return (
    <section className="relative w-full overflow-hidden">
      <div className="flex w-full">
        {peek ? (
          <div
            className="hidden shrink-0 md:block"
            style={{ width: "var(--chrome-carousel-peek, 8%)", ...slideStyle("var(--chrome-hero-panel-left)") }}
            aria-hidden
          />
        ) : null}

        <div
          className="relative flex flex-1 flex-col justify-end"
          style={{
            ...slideStyle("var(--chrome-hero-panel-main)"),
            padding: "var(--chrome-hero-padding, 64px)",
            paddingBottom: "80px",
          }}
        >
          <div
            className="pointer-events-none absolute right-[8%] top-[18%] h-48 w-36 rounded-2xl opacity-90 md:h-64 md:w-48"
            style={{ backgroundColor: "var(--chrome-hero-accent)" }}
            aria-hidden
          />

          {label ? (
            <p
              className="mb-3 text-xs"
              style={{
                fontFamily: "var(--chrome-font-small-labels, Inter, sans-serif)",
                color: "var(--chrome-hero-text)",
                letterSpacing: "var(--chrome-spacing-small-labels, 2px)",
                textTransform: "uppercase",
              }}
            >
              {label}
            </p>
          ) : null}

          <h1 className="template-type-hero" style={heroHeadlineStyle()}>{headline}</h1>

          {subtext ? (
            <p
              className="template-type-hero mt-4 max-w-lg text-base md:text-lg"
              style={{
                color: "var(--template-color-hero, var(--chrome-hero-text))",
                opacity: 0.92,
                fontFamily: "var(--template-font-hero, var(--chrome-font-body, Inter, sans-serif))",
              }}
            >
              {subtext}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="text-sm font-semibold"
              style={{
                padding: "var(--chrome-btn-padding, 14px 28px)",
                borderRadius: "var(--chrome-btn-radius, 999px)",
                backgroundColor: "var(--chrome-btn-primary-bg)",
                color: "var(--chrome-btn-primary-text)",
              }}
            >
              {primaryCta}
            </button>
            {showDualCta ? (
              <button
                type="button"
                className="bg-transparent text-sm font-semibold"
                style={{
                  padding: "var(--chrome-btn-padding, 14px 28px)",
                  borderRadius: "var(--chrome-btn-radius, 999px)",
                  border: "2px solid var(--chrome-btn-secondary-border)",
                  color: "var(--chrome-hero-text)",
                }}
              >
                {secondaryCta}
              </button>
            ) : null}
          </div>
        </div>

        {peek ? (
          <div
            className="hidden shrink-0 md:block"
            style={{
              width: "var(--chrome-carousel-peek, 8%)",
              ...slideStyle("#D4A574"),
            }}
            aria-hidden
          />
        ) : null}
      </div>
    </section>
  );
}
