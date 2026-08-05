import { defineTheme } from "@/lib/templates/manifests/define-theme";
import { applyChromePreset } from "@/lib/templates/manifests/chrome-presets";

/**
 * Triumph Sport — utility bar, carousel-peek hero, dual CTAs, dense product grid.
 * Clone this file to author new chrome-heavy themes.
 */
export const kiranaTheme = defineTheme({
  name: "Kirana",
  slug: "kirana",
  description:
    "Sport-street storefront with Triumph-style chrome — utility bar, category nav, carousel-peek hero, and pill CTAs. Compact product grid below.",
  category: "classic",
  niche: "Neighbourhood retail",
  mood: "bold",
  tags: ["chrome", "carousel-hero", "sport-street", "compact"],
  skeleton: "dense",
  seedColors: { primary: "#CE7A50", secondary: "#4B3F7A", accent: "#A87FE0", background: "#FFFFFF" },
  fonts: { heading: '"Archivo Black", sans-serif', body: "Inter, sans-serif" },
  typeScale: { base: 0.9375, ratio: 1.2 },
  rhythm: { section: "compact", gap: "compact" },
  containerWidth: "1200px",
  shape: { radiusScale: "pill", borderWidth: "1px", shadowScale: "none" },
  surface: { cardTreatment: "flat", imageAspect: "1 / 1" },
  motion: "none",
  gridColumns: 4,
  heroVariant: "carousel-peek",
  heroHeight: "660px",
  gridVariant: "dense-compact",
  cardStyle: "compact",
  navStyle: "top",
  featured: true,
  starterLabel: "Triumph Sport",
  chrome: applyChromePreset("triumph", {
    content: {
      wordmark: "ZVASTRA",
      heroHeadline: "MOVE WITH CONFIDENCE",
      sectionHeadline: "ACTIVEWEAR FOR EVERY GOAL",
    },
  }),
  sections: [
    { type: "hero", settings: { variant: "carousel-peek", useVendorBanners: true } },
    { type: "product-grid", settings: { variant: "dense-compact", title: "Available now", showCount: true } },
  ],
});
