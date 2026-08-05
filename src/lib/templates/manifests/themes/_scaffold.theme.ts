import { defineTheme } from "@/lib/templates/manifests/define-theme";
import { applyChromePreset } from "@/lib/templates/manifests/chrome-presets";

/**
 * Scaffold — copy this file to create a new catalog theme.
 *
 * Example: duplicate as `triumph-variant.theme.ts`, edit, register in `./index.ts`.
 */
export const scaffoldThemeExample = defineTheme({
  name: "Your Theme Name",
  slug: "your-theme-slug",
  description: "One sentence describing the niche, layout, and visual tone of this theme.",
  category: "bold",
  niche: "Your niche",
  mood: "bold",
  tags: ["tag-one", "tag-two"],
  skeleton: "classic",
  seedColors: {
    primary: "#171717",
    secondary: "#CE7A50",
    accent: "#A87FE0",
    background: "#FFFFFF",
  },
  fonts: {
    heading: "Anton, sans-serif",
    body: "Inter, sans-serif",
  },
  heroVariant: "carousel-peek",
  heroHeight: "660px",
  gridVariant: "standard",
  cardStyle: "detailed",
  featured: false,
  starterLabel: "Optional builder card title",
  chrome: applyChromePreset("triumph", {
    content: {
      wordmark: "YOUR BRAND",
      heroHeadline: "YOUR HEADLINE",
      primaryCta: "Shop now",
      secondaryCta: "Learn more",
    },
  }),
  sections: [
    { type: "hero", settings: { variant: "carousel-peek", useVendorBanners: true } },
    { type: "product-grid", settings: { variant: "standard", title: "Products", showCount: true } },
  ],
});

// Do NOT add scaffoldThemeExample to modularThemeSpecs — documentation-only.
