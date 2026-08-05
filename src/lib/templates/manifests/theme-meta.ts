import type { ThemeManifestMeta } from "./types";

/**
 * Catalog metadata for each seeded theme.
 * Runway is explicitly preserved on its legacy layout component.
 */
export const THEME_META: Record<string, ThemeManifestMeta> = {
  fun: {
    skeleton: "classic",
    legacyLayout: "default",
    niche: "Creative & lifestyle",
    mood: "playful",
    tags: ["colorful", "gradient", "youthful"],
    tokenPack: "fun-vibrant",
    variants: { hero: "full-bleed", productGrid: "standard", productCard: "detailed" },
    minEngineVersion: "1.0.0",
  },
  elegant: {
    skeleton: "classic",
    legacyLayout: "default",
    niche: "Premium retail",
    mood: "luxury",
    tags: ["serif", "refined", "neutral"],
    tokenPack: "elegant-neutral",
    variants: { hero: "full-bleed", productGrid: "standard", productCard: "detailed" },
    minEngineVersion: "1.0.0",
  },
  bold: {
    skeleton: "classic",
    legacyLayout: "default",
    niche: "Streetwear & sport",
    mood: "bold",
    tags: ["high-contrast", "uppercase", "impact"],
    tokenPack: "bold-contrast",
    variants: { hero: "full-bleed", productGrid: "standard", productCard: "minimal" },
    minEngineVersion: "1.0.0",
  },
  zen: {
    skeleton: "classic",
    legacyLayout: "default",
    niche: "Minimal & wellness",
    mood: "minimal",
    tags: ["whitespace", "calm", "simple"],
    tokenPack: "zen-minimal",
    variants: { hero: "minimal-type", productGrid: "standard", productCard: "minimal" },
    minEngineVersion: "1.0.0",
  },
  reloop: {
    skeleton: "classic",
    legacyLayout: "reloop",
    niche: "Sustainable & circular",
    mood: "playful",
    tags: ["eco", "circular", "modern"],
    tokenPack: "reloop-expressive",
    variants: { hero: "split-media", productGrid: "standard", productCard: "detailed" },
    minEngineVersion: "1.0.0",
  },
  emporium: {
    skeleton: "showcase",
    legacyLayout: "emporium",
    niche: "Home décor & furniture",
    mood: "warm",
    tags: ["catalog", "sidebar", "warm-neutral"],
    tokenPack: "emporium-warm",
    variants: { hero: "full-bleed", productGrid: "standard", productCard: "detailed" },
    minEngineVersion: "1.0.0",
  },
  runway: {
    skeleton: "editorial",
    legacyLayout: "runway",
    preserveLegacyLayout: true,
    niche: "Fashion & apparel",
    mood: "luxury",
    tags: ["editorial", "lookbook", "luxury", "fashion"],
    tokenPack: "runway-editorial",
    variants: {
      hero: "full-bleed",
      productGrid: "editorial-rows",
      productCard: "bordered-portrait",
    },
    minEngineVersion: "1.0.0",
  },
};
