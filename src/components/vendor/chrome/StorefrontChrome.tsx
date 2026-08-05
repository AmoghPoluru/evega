"use client";

import type { CSSProperties } from "react";
import { Search, ShoppingBag, User } from "lucide-react";

import { resolveStorefrontChrome, type StorefrontChrome } from "@/lib/templates/storefront-chrome";
import type { ResolvedTemplate } from "@/types/template-customization";

interface StorefrontChromeProps {
  template: ResolvedTemplate;
  vendorName: string;
}

function CountdownStrip() {
  const units = [
    { label: "DAY", value: "02" },
    { label: "HR", value: "14" },
    { label: "MIN", value: "32" },
    { label: "SEC", value: "08" },
  ];

  return (
    <div
      className="flex items-center gap-[var(--chrome-countdown-gap,4px)]"
      aria-label="Promotional countdown"
    >
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center gap-0.5">
          <div
            className="flex items-center justify-center rounded text-xs font-semibold tabular-nums"
            style={{
              width: "var(--chrome-countdown-size, 40px)",
              height: "var(--chrome-countdown-size, 40px)",
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "var(--chrome-utility-text)",
            }}
          >
            {unit.value}
          </div>
          <span className="text-[9px] uppercase tracking-wider opacity-80">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function roleStyle(roleKey: string, skewVar: string): CSSProperties {
  return {
    fontFamily: `var(--chrome-font-${roleKey})`,
    color: `var(--chrome-color-${roleKey})`,
    fontWeight: `var(--chrome-weight-${roleKey})` as CSSProperties["fontWeight"],
    letterSpacing: `var(--chrome-spacing-${roleKey})`,
    textTransform: `var(--chrome-transform-${roleKey})` as CSSProperties["textTransform"],
    transform: `skewX(var(${skewVar}, 0deg))`,
    display: "inline-block",
  };
}

export function StorefrontChromeBar({ template, vendorName }: StorefrontChromeProps) {
  const chrome = resolveStorefrontChrome(template.templateConfig);
  if (chrome.enabled !== true) return null;

  const content = chrome.content ?? {};
  const features = chrome.features ?? {};
  const wordmark = content.wordmark || vendorName.toUpperCase();

  return (
    <header className="w-full shrink-0">
      {features.showUtilityBar !== false && (
        <div
          className="flex items-center justify-between px-4 text-xs"
          style={{
            height: "var(--chrome-utility-height)",
            backgroundColor: "var(--chrome-utility-bg)",
            color: "var(--chrome-utility-text)",
            fontFamily: "var(--chrome-font-body, Inter, sans-serif)",
          }}
        >
          <span>{content.utilityMessage ?? "Free shipping on orders over ₹999"}</span>
          <div className="flex items-center gap-6">
            {features.showCountdown !== false && <CountdownStrip />}
            <span className="hidden sm:inline opacity-90">₹ INR</span>
          </div>
        </div>
      )}

      <div
        className="flex items-center justify-between border-b px-4 md:px-8"
        style={{
          height: "var(--chrome-nav-height)",
          backgroundColor: "var(--chrome-nav-bg)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <span style={roleStyle("wordmark", "--chrome-skew-wordmark")}>{wordmark}</span>

        <nav className="hidden items-center gap-8 md:flex">
          {(content.navLinks ?? ["WOMEN", "MEN", "KIDS"]).map((link) => (
            <button
              key={link}
              type="button"
              className="bg-transparent"
              style={roleStyle("nav-links", "--chrome-skew-nav-links")}
            >
              {link}
            </button>
          ))}
        </nav>

        <div
          className="flex items-center gap-3"
          style={{ color: "var(--chrome-color-nav-links, #171717)" }}
        >
          <Search className="h-5 w-5" aria-hidden />
          <User className="h-5 w-5" aria-hidden />
          <ShoppingBag className="h-5 w-5" aria-hidden />
        </div>
      </div>

      {features.showSubNav !== false && (
        <div
          className="flex items-center justify-center gap-6 overflow-x-auto px-4 text-xs md:gap-10"
          style={{
            height: "var(--chrome-subnav-height)",
            backgroundColor: "var(--chrome-subnav-bg)",
          }}
        >
          {(content.subNavCategories ?? ["CLOTHING", "SHOES", "ACCESSORIES"]).map((cat) => (
            <button
              key={cat}
              type="button"
              className="shrink-0 bg-transparent"
              style={roleStyle("nav-links", "--chrome-skew-nav-links")}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

export function ChromeSectionHeader({ chrome: chromeInput }: { chrome?: StorefrontChrome | null }) {
  const chrome = resolveStorefrontChrome({ chrome: chromeInput ?? undefined });
  if (chrome.enabled !== true) return null;

  const content = chrome.content ?? {};
  if (!content.sectionLabel && !content.sectionHeadline) return null;

  return (
    <div className="mb-8 text-center">
      {content.sectionLabel ? (
        <p
          className="mb-2 font-medium uppercase"
          style={{
            fontSize: "var(--chrome-section-label-size)",
            letterSpacing: "2px",
            color: "var(--chrome-section-label)",
            fontFamily: "var(--chrome-font-small-labels, Inter, sans-serif)",
          }}
        >
          {content.sectionLabel}
        </p>
      ) : null}
      {content.sectionHeadline ? (
        <h2
          style={{
            fontSize: "var(--chrome-section-headline-size)",
            ...roleStyle("section-headline", "--chrome-skew-section-headline"),
          }}
        >
          {content.sectionHeadline}
        </h2>
      ) : null}
    </div>
  );
}
