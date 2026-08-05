/**
 * Curated theme catalog.
 *
 * Every theme here is *data*: a compact spec expanded into a full manifest by
 * `buildThemeManifest`. No theme requires its own layout component — visual
 * distinctness comes from skeleton + derived palette + design tokens + section
 * variants, which is how Shopify's Horizon collection and Squarespace 7.1 ship
 * many "templates" from one engine.
 *
 * To add a theme: append one spec below. Nothing else needs to change.
 */

import { derivePalette, type ContrastIntent } from "../derive-palette";
import { generateCSSVariables } from "../css-variables";
import type { TemplateSeedData } from "../seed-templates";
import type { TemplateConfig } from "@/types/template-customization";
import type { StorefrontSection, StorefrontSectionType } from "@/types/template-sections";
import type { StorefrontSkeleton, ThemeManifest, ThemeMood } from "./types";

type HeroVariant = "full-bleed" | "split-media" | "minimal-type";
type GridVariant = "standard" | "dense-compact" | "editorial-rows";
type CardStyle = TemplateSeedData["templateConfig"]["components"]["productCard"]["style"];
type NavStyle = TemplateSeedData["templateConfig"]["components"]["navigation"]["style"];
type BackgroundStyle = TemplateSeedData["templateConfig"]["backgroundStyle"];
type Rhythm = "compact" | "normal" | "airy";
type RadiusScale = "sharp" | "soft" | "pill";
type ShadowScale = "none" | "soft" | "elevated";
type CardTreatment = "flat" | "bordered" | "elevated" | "glass";
type Motion = "none" | "subtle" | "expressive";

interface SectionSpec {
  type: StorefrontSectionType;
  settings?: Record<string, unknown>;
  enabled?: boolean;
}

interface ThemeSpec {
  name: string;
  slug: string;
  description: string;
  category: TemplateSeedData["category"];
  niche: string;
  mood: ThemeMood;
  tags: string[];
  skeleton: StorefrontSkeleton;
  /** 1–3 seed colors; the rest of the palette is derived for guaranteed contrast. */
  seedColors: { primary: string; secondary?: string; accent?: string; background?: string };
  contrast?: ContrastIntent;
  fonts: { heading: string; body: string; display?: string };
  /** Base font size in rem and modular scale ratio — drives the whole type scale. */
  typeScale?: { base?: number; ratio?: number };
  headingCase?: "none" | "uppercase";
  headingTracking?: string;
  rhythm?: { section?: Rhythm; gap?: Rhythm };
  containerWidth?: string;
  shape?: { radiusScale?: RadiusScale; borderWidth?: string; shadowScale?: ShadowScale };
  surface?: { cardTreatment?: CardTreatment; imageAspect?: string };
  motion?: Motion;
  gridColumns?: number;
  heroVariant?: HeroVariant;
  heroHeight?: string;
  gridVariant?: GridVariant;
  cardStyle?: CardStyle;
  navStyle?: NavStyle;
  footer?: string;
  background?: BackgroundStyle;
  sections: SectionSpec[];
}

const RHYTHM_SECTION: Record<Rhythm, string> = {
  compact: "48px 0",
  normal: "80px 0",
  airy: "120px 0",
};

const RHYTHM_GAP: Record<Rhythm, string> = {
  compact: "16px",
  normal: "24px",
  airy: "40px",
};

const SHAPE_RADIUS: Record<RadiusScale, string> = {
  sharp: "0px",
  soft: "10px",
  pill: "999px",
};

const CATALOG_VERSION = "1.0.0";
const MIN_ENGINE_VERSION = "1.0.0";

function rem(value: number): string {
  return `${Math.round(value * 1000) / 1000}rem`;
}

/** Build a full modular type scale from a base size and a modular ratio. */
function buildTextStyles(
  spec: ThemeSpec,
): NonNullable<TemplateSeedData["templateConfig"]["textStyles"]> {
  const base = spec.typeScale?.base ?? 1;
  const ratio = spec.typeScale?.ratio ?? 1.25;
  const tracking = spec.headingTracking ?? "-0.01em";
  const transform = spec.headingCase ?? "none";

  return {
    heading1: {
      fontSize: rem(base * ratio ** 3),
      fontWeight: spec.mood === "luxury" || spec.mood === "minimal" ? "500" : "700",
      letterSpacing: tracking,
      lineHeight: "1.15",
      textTransform: transform,
    },
    heading2: {
      fontSize: rem(base * ratio ** 2),
      fontWeight: spec.mood === "luxury" || spec.mood === "minimal" ? "500" : "600",
      letterSpacing: tracking,
      lineHeight: "1.25",
      textTransform: transform,
    },
    body: {
      fontSize: rem(base),
      fontWeight: "400",
      letterSpacing: "0",
      lineHeight: spec.rhythm?.section === "airy" ? "1.8" : "1.6",
    },
    heroBanner: {
      titleSize: rem(base * ratio ** 4),
      titleWeight: spec.mood === "bold" ? "800" : spec.mood === "luxury" ? "500" : "700",
      subtitleSize: rem(base * ratio),
      subtitleWeight: "400",
      textShadow:
        spec.heroVariant === "full-bleed"
          ? "0 2px 18px rgba(0, 0, 0, 0.45)"
          : "0 1px 2px rgba(0, 0, 0, 0.15)",
    },
  };
}

function buildSections(spec: ThemeSpec): StorefrontSection[] {
  return spec.sections.map((section, index) => ({
    id: `${spec.slug}-${section.type}-${index + 1}`,
    type: section.type,
    enabled: section.enabled !== false,
    order: index,
    settings: section.settings ?? {},
  }));
}

/** Expand a compact spec into a complete, seedable theme manifest. */
export function buildThemeManifest(spec: ThemeSpec): ThemeManifest {
  const contrast = spec.contrast ?? "light";
  const colors = derivePalette(spec.seedColors, contrast);
  const sections = buildSections(spec);

  const templateConfig: TemplateSeedData["templateConfig"] &
    Pick<TemplateConfig, "tokens" | "sections"> = {
    colors,
    fonts: {
      heading: spec.fonts.heading,
      body: spec.fonts.body,
    },
    spacing: {
      sectionPadding: RHYTHM_SECTION[spec.rhythm?.section ?? "normal"],
      cardGap: RHYTHM_GAP[spec.rhythm?.gap ?? "normal"],
      containerMaxWidth: spec.containerWidth ?? "1280px",
    },
    layout: {
      productGridColumns: spec.gridColumns ?? 4,
      showBanner: true,
      showCategories: true,
      showFilters: spec.skeleton !== "editorial",
      showReviews: true,
    },
    components: {
      heroBanner: {
        style:
          spec.heroVariant === "split-media"
            ? "split"
            : spec.heroVariant === "minimal-type"
              ? "minimal"
              : "full-width",
        height: spec.heroHeight ?? "520px",
      },
      productCard: {
        style: spec.cardStyle ?? "detailed",
        showPrice: true,
        showRating: spec.mood !== "luxury",
        showDescription: spec.skeleton === "editorial",
        borderRadius: SHAPE_RADIUS[spec.shape?.radiusScale ?? "soft"],
      },
      navigation: {
        style: spec.navStyle ?? "top",
        backgroundColor: colors.primary,
      },
    },
    textStyles: buildTextStyles(spec),
    backgroundStyle: spec.background ?? { type: "solid", value: colors.background },
    tokens: {
      contrast,
      displayFont: spec.fonts.display,
      typeScale: {
        base: rem(spec.typeScale?.base ?? 1),
        ratio: String(spec.typeScale?.ratio ?? 1.25),
      },
      rhythm: {
        section: spec.rhythm?.section ?? "normal",
        gap: spec.rhythm?.gap ?? "normal",
      },
      shape: {
        radiusScale: spec.shape?.radiusScale ?? "soft",
        borderWidth: spec.shape?.borderWidth ?? "1px",
        shadowScale: spec.shape?.shadowScale ?? "soft",
      },
      surface: {
        cardTreatment: spec.surface?.cardTreatment ?? "elevated",
        imageAspect: spec.surface?.imageAspect ?? "1 / 1",
      },
      motion: spec.motion ?? "subtle",
    },
    sections,
  };

  return {
    name: spec.name,
    slug: spec.slug,
    description: spec.description,
    category: spec.category,
    isDefault: false,
    isActive: true,
    version: CATALOG_VERSION,
    author: "Evega Team",
    templateConfig,
    cssVariables: generateCSSVariables(templateConfig),
    componentMapping: {
      layout: "modular",
      heroBanner: spec.heroVariant ?? "full-bleed",
      productCard: spec.cardStyle ?? "detailed",
      navigation: spec.navStyle ?? "top",
      footer: spec.footer ?? "default",
    },
    skeleton: spec.skeleton,
    legacyLayout: "modular",
    niche: spec.niche,
    mood: spec.mood,
    tags: spec.tags,
    tokenPack: `${spec.slug}-pack`,
    variants: {
      hero: spec.heroVariant ?? "full-bleed",
      productGrid: spec.gridVariant ?? "standard",
      productCard: spec.cardStyle ?? "detailed",
      navigation: spec.navStyle ?? "top",
    },
    themeVersion: CATALOG_VERSION,
    minEngineVersion: MIN_ENGINE_VERSION,
    defaultSections: sections,
  };
}

/** Shared vendor-info header settings — every theme opens with vendor identity. */
function vendorInfo(overrides: Record<string, unknown> = {}): SectionSpec {
  return {
    type: "vendor-info",
    settings: { showBreadcrumb: true, showContact: true, sticky: true, ...overrides },
  };
}

export const THEME_CATALOG_SPECS: ThemeSpec[] = [
  {
    name: "Atelier",
    slug: "atelier",
    description:
      "Quiet-luxury editorial storefront with oversized serif headlines, generous whitespace and unadorned product cards. Built for designer labels and made-to-order studios where the product photography carries the page.",
    category: "elegant",
    niche: "Luxury fashion",
    mood: "luxury",
    tags: ["editorial", "serif", "whitespace", "luxury"],
    skeleton: "editorial",
    seedColors: { primary: "#1C1B19", secondary: "#6F6A61", accent: "#B08D57", background: "#FBFAF8" },
    fonts: {
      heading: '"Cormorant Garamond", serif',
      body: "Jost, sans-serif",
      display: '"Cormorant Garamond", serif',
    },
    typeScale: { base: 1.0625, ratio: 1.333 },
    headingTracking: "-0.02em",
    rhythm: { section: "airy", gap: "airy" },
    containerWidth: "1240px",
    shape: { radiusScale: "sharp", borderWidth: "1px", shadowScale: "none" },
    surface: { cardTreatment: "flat", imageAspect: "4 / 5" },
    motion: "subtle",
    gridColumns: 3,
    heroVariant: "minimal-type",
    gridVariant: "editorial-rows",
    cardStyle: "minimal",
    navStyle: "top",
    footer: "elegant",
    sections: [
      vendorInfo({ showContact: false }),
      { type: "hero", settings: { variant: "minimal-type", useVendorBanners: false } },
      {
        type: "rich-text",
        settings: {
          heading: "The atelier",
          body: "Every piece is cut, finished and inspected by hand in limited runs.\n\nWe work with a small circle of mills and keep production intentionally slow, so each collection stays true to the original sketch.",
          align: "center",
        },
      },
      { type: "product-lookbook", settings: { sectionLabel: "The Collection", showIndex: true, ctaLabel: "View piece" } },
      { type: "product-grid", settings: { variant: "editorial-rows", title: "All pieces", showCount: false } },
    ],
  },
  {
    name: "Saree",
    slug: "saree",
    description:
      "Rich jewel-toned showcase designed for handloom, silk and occasion wear. Tall 4:5 imagery, gold detailing and a catalog-forward grid that flatters textile close-ups.",
    category: "elegant",
    niche: "Ethnic & handloom",
    mood: "luxury",
    tags: ["handloom", "jewel-tone", "textile", "india"],
    skeleton: "showcase",
    seedColors: { primary: "#6B1E3C", secondary: "#8C2F4A", accent: "#C9A227", background: "#FFF9F2" },
    fonts: { heading: "Marcellus, serif", body: '"Noto Sans Devanagari", sans-serif' },
    typeScale: { base: 1.0625, ratio: 1.25 },
    rhythm: { section: "normal", gap: "normal" },
    containerWidth: "1320px",
    shape: { radiusScale: "soft", borderWidth: "1px", shadowScale: "soft" },
    surface: { cardTreatment: "bordered", imageAspect: "4 / 5" },
    gridColumns: 4,
    heroVariant: "full-bleed",
    heroHeight: "560px",
    gridVariant: "standard",
    cardStyle: "detailed",
    navStyle: "sticky",
    footer: "elegant",
    sections: [
      vendorInfo(),
      { type: "hero", settings: { variant: "full-bleed", useVendorBanners: true, height: "560px" } },
      { type: "product-grid", settings: { variant: "standard", title: "The collection", showCount: true } },
      {
        type: "rich-text",
        settings: {
          heading: "Woven by hand",
          body: "Each weave is sourced directly from the loom, with no intermediaries.\n\nColours are natural-dyed in small batches, so slight variation between pieces is a mark of authenticity rather than a defect.",
        },
      },
      {
        type: "testimonials",
        settings: {
          title: "From our customers",
          testimonials: [
            { quote: "The drape and finish were far better than anything I found in store.", author: "Meera R.", role: "Verified buyer" },
            { quote: "Arrived beautifully packed and exactly the shade shown online.", author: "Anita K.", role: "Verified buyer" },
            { quote: "You can feel the difference in a genuine handloom weave.", author: "Sowmya P.", role: "Verified buyer" },
          ],
        },
      },
    ],
  },
  {
    name: "Vault",
    slug: "vault",
    description:
      "Dark, spotlight-driven storefront for fine jewellery and watches. Deep charcoal surfaces make metal and stone read as the brightest thing on screen.",
    category: "elegant",
    niche: "Jewellery & watches",
    mood: "luxury",
    tags: ["dark", "premium", "spotlight", "jewellery"],
    skeleton: "showcase",
    seedColors: { primary: "#C9A227", secondary: "#8A6F1E", accent: "#E8D9A0", background: "#0E0E10" },
    contrast: "dark",
    fonts: { heading: '"Bodoni Moda", serif', body: "Manrope, sans-serif" },
    typeScale: { base: 1, ratio: 1.333 },
    headingTracking: "0.01em",
    rhythm: { section: "airy", gap: "normal" },
    containerWidth: "1240px",
    shape: { radiusScale: "sharp", borderWidth: "1px", shadowScale: "elevated" },
    surface: { cardTreatment: "elevated", imageAspect: "1 / 1" },
    motion: "subtle",
    gridColumns: 3,
    heroVariant: "full-bleed",
    heroHeight: "600px",
    gridVariant: "standard",
    cardStyle: "minimal",
    navStyle: "sticky",
    footer: "elegant",
    sections: [
      vendorInfo({ sticky: true }),
      { type: "hero", settings: { variant: "full-bleed", useVendorBanners: true, height: "600px" } },
      { type: "product-grid", settings: { variant: "standard", title: "Signature pieces", showCount: false } },
      { type: "product-lookbook", settings: { sectionLabel: "Craftsmanship", showIndex: false, ctaLabel: "Enquire" } },
    ],
  },
  {
    name: "Dwell",
    slug: "dwell",
    description:
      "Warm, calm catalog for home décor and furniture. Soft neutrals, wide landscape imagery and a filter-forward showcase grid built for long, browsable ranges.",
    category: "classic",
    niche: "Home décor & furniture",
    mood: "warm",
    tags: ["warm-neutral", "catalog", "interiors", "landscape"],
    skeleton: "showcase",
    seedColors: { primary: "#8A6A4F", secondary: "#5C4433", accent: "#C99B6A", background: "#FAF6F1" },
    fonts: { heading: "Fraunces, serif", body: '"Work Sans", sans-serif' },
    typeScale: { base: 1.0625, ratio: 1.2 },
    rhythm: { section: "normal", gap: "normal" },
    containerWidth: "1360px",
    shape: { radiusScale: "soft", borderWidth: "1px", shadowScale: "soft" },
    surface: { cardTreatment: "elevated", imageAspect: "3 / 2" },
    gridColumns: 3,
    heroVariant: "split-media",
    gridVariant: "standard",
    cardStyle: "detailed",
    navStyle: "sticky",
    sections: [
      vendorInfo(),
      { type: "hero", settings: { variant: "split-media", useVendorBanners: false } },
      { type: "product-grid", settings: { variant: "standard", title: "Shop the range", showCount: true } },
      {
        type: "rich-text",
        settings: {
          heading: "Made to live with",
          body: "Solid timber, natural finishes and joinery meant to outlast trends.\n\nEvery item is finished to order, so lead times reflect real workshop time rather than warehouse stock.",
        },
      },
    ],
  },
  {
    name: "Ritual",
    slug: "ritual",
    description:
      "Soft, unhurried storefront for beauty, fragrance and wellness. Pastel surfaces, rounded shapes and slow motion create a spa-like browsing pace.",
    category: "minimal",
    niche: "Beauty & wellness",
    mood: "minimal",
    tags: ["pastel", "soft", "wellness", "rounded"],
    skeleton: "classic",
    seedColors: { primary: "#A98CA0", secondary: "#7E6377", accent: "#E7C6C2", background: "#FDF8F6" },
    fonts: { heading: '"DM Serif Display", serif', body: "Karla, sans-serif" },
    typeScale: { base: 1.0625, ratio: 1.2 },
    rhythm: { section: "airy", gap: "airy" },
    containerWidth: "1180px",
    shape: { radiusScale: "pill", borderWidth: "0px", shadowScale: "soft" },
    surface: { cardTreatment: "flat", imageAspect: "1 / 1" },
    motion: "expressive",
    gridColumns: 3,
    heroVariant: "split-media",
    gridVariant: "standard",
    cardStyle: "minimal",
    navStyle: "top",
    sections: [
      vendorInfo({ showBreadcrumb: false }),
      { type: "hero", settings: { variant: "split-media", useVendorBanners: false } },
      {
        type: "rich-text",
        settings: {
          heading: "A slower routine",
          body: "Small-batch formulations with short ingredient lists and no synthetic fragrance.\n\nEvery batch is dated at the point of blending, so you always know how fresh your product is.",
          align: "center",
        },
      },
      { type: "product-grid", settings: { variant: "standard", title: "Shop all", showCount: false } },
      {
        type: "testimonials",
        settings: {
          title: "Loved by our regulars",
          testimonials: [
            { quote: "My skin settled within two weeks of switching.", author: "Priya S.", role: "Verified buyer" },
            { quote: "The scent is subtle and lasts all day without being heavy.", author: "Nikhil D.", role: "Verified buyer" },
            { quote: "Beautiful packaging and genuinely gentle formulas.", author: "Rhea M.", role: "Verified buyer" },
          ],
        },
      },
    ],
  },
  {
    name: "Fabric",
    slug: "fabric",
    description:
      "Photography-first apparel storefront with edge-to-edge imagery and minimal chrome. Portrait crops and a quiet interface keep attention on fit and material.",
    category: "minimal",
    niche: "Apparel & textiles",
    mood: "minimal",
    tags: ["photo-led", "apparel", "portrait", "clean"],
    skeleton: "showcase",
    seedColors: { primary: "#2B2B2B", secondary: "#5A5A5A", accent: "#A3B18A", background: "#FFFFFF" },
    fonts: { heading: '"Space Grotesk", sans-serif', body: "Inter, system-ui, sans-serif" },
    typeScale: { base: 1, ratio: 1.25 },
    rhythm: { section: "normal", gap: "compact" },
    containerWidth: "1400px",
    shape: { radiusScale: "sharp", borderWidth: "1px", shadowScale: "none" },
    surface: { cardTreatment: "flat", imageAspect: "4 / 5" },
    gridColumns: 4,
    heroVariant: "full-bleed",
    heroHeight: "560px",
    gridVariant: "standard",
    cardStyle: "minimal",
    navStyle: "sticky",
    sections: [
      vendorInfo({ showContact: false }),
      { type: "hero", settings: { variant: "full-bleed", useVendorBanners: true, height: "560px" } },
      { type: "product-grid", settings: { variant: "standard", title: "New in", showCount: true } },
      { type: "product-lookbook", settings: { sectionLabel: "Worn", showIndex: true, ctaLabel: "Shop the look" } },
    ],
  },
  {
    name: "Heritage",
    slug: "heritage",
    description:
      "Traditional, ink-on-paper storefront for legacy brands and craft houses. Classic serif hierarchy, hairline rules and an unhurried editorial rhythm.",
    category: "classic",
    niche: "Legacy & craft",
    mood: "warm",
    tags: ["serif", "traditional", "editorial", "ink"],
    skeleton: "editorial",
    seedColors: { primary: "#2F3E46", secondary: "#52796F", accent: "#B08968", background: "#F7F4EE" },
    fonts: { heading: '"EB Garamond", serif', body: "Cardo, serif" },
    typeScale: { base: 1.125, ratio: 1.25 },
    rhythm: { section: "airy", gap: "normal" },
    containerWidth: "1160px",
    shape: { radiusScale: "sharp", borderWidth: "1px", shadowScale: "none" },
    surface: { cardTreatment: "bordered", imageAspect: "3 / 2" },
    gridColumns: 3,
    heroVariant: "minimal-type",
    gridVariant: "editorial-rows",
    cardStyle: "detailed",
    navStyle: "top",
    sections: [
      vendorInfo(),
      { type: "hero", settings: { variant: "minimal-type", useVendorBanners: false } },
      {
        type: "rich-text",
        settings: {
          heading: "Since the beginning",
          body: "Four generations of the same workshop, the same tools and largely the same methods.\n\nWe publish our sourcing and our pricing because provenance is the product.",
        },
      },
      { type: "product-grid", settings: { variant: "editorial-rows", title: "The catalogue", showCount: true } },
    ],
  },
  {
    name: "Studio",
    slug: "studio",
    description:
      "Gallery-style storefront for art, prints and photography. Wide margins, caption-led product rows and a neutral canvas that never competes with the work.",
    category: "minimal",
    niche: "Art & prints",
    mood: "minimal",
    tags: ["gallery", "neutral", "captions", "art"],
    skeleton: "editorial",
    seedColors: { primary: "#111111", secondary: "#4D4D4D", accent: "#D6D3CD", background: "#FCFCFC" },
    fonts: { heading: '"Instrument Serif", serif', body: "Archivo, sans-serif" },
    typeScale: { base: 1, ratio: 1.414 },
    headingTracking: "-0.03em",
    rhythm: { section: "airy", gap: "airy" },
    containerWidth: "1120px",
    shape: { radiusScale: "sharp", borderWidth: "1px", shadowScale: "none" },
    surface: { cardTreatment: "flat", imageAspect: "1 / 1" },
    gridColumns: 2,
    heroVariant: "minimal-type",
    gridVariant: "editorial-rows",
    cardStyle: "minimal",
    navStyle: "top",
    sections: [
      vendorInfo({ showContact: false, sticky: false }),
      { type: "hero", settings: { variant: "minimal-type", useVendorBanners: false } },
      { type: "product-lookbook", settings: { sectionLabel: "Current works", showIndex: true, ctaLabel: "Enquire" } },
      { type: "product-grid", settings: { variant: "editorial-rows", title: "Available works", showCount: false } },
    ],
  },
  {
    name: "Bazaar",
    slug: "bazaar",
    description:
      "High-density grocery and FMCG storefront. Five-column compact cards, tight vertical rhythm and minimal chrome so hundreds of SKUs stay scannable.",
    category: "bold",
    niche: "Grocery & essentials",
    mood: "catalog",
    tags: ["dense", "grocery", "high-sku", "fast"],
    skeleton: "dense",
    seedColors: { primary: "#1B7F52", secondary: "#12633F", accent: "#F2A007", background: "#FFFFFF" },
    fonts: { heading: "Rubik, sans-serif", body: "Rubik, sans-serif" },
    typeScale: { base: 0.9375, ratio: 1.2 },
    rhythm: { section: "compact", gap: "compact" },
    containerWidth: "1440px",
    shape: { radiusScale: "soft", borderWidth: "1px", shadowScale: "none" },
    surface: { cardTreatment: "bordered", imageAspect: "1 / 1" },
    motion: "none",
    gridColumns: 5,
    heroVariant: "full-bleed",
    heroHeight: "320px",
    gridVariant: "dense-compact",
    cardStyle: "compact",
    navStyle: "sticky",
    sections: [
      vendorInfo(),
      { type: "hero", settings: { variant: "full-bleed", useVendorBanners: true, height: "320px" } },
      { type: "product-grid", settings: { variant: "dense-compact", title: "All products", showCount: true } },
    ],
  },
  {
    name: "Tech",
    slug: "tech",
    description:
      "Spec-forward storefront for gadgets and accessories. Cool neutral surfaces, bento-style cards and a compact grid that keeps model names and prices legible.",
    category: "minimal",
    niche: "Electronics & gadgets",
    mood: "catalog",
    tags: ["cool-neutral", "bento", "spec-led", "compact"],
    skeleton: "dense",
    seedColors: { primary: "#2563EB", secondary: "#1E3A8A", accent: "#22D3EE", background: "#F7F9FC" },
    fonts: { heading: "Sora, sans-serif", body: "Inter, system-ui, sans-serif" },
    typeScale: { base: 0.9375, ratio: 1.25 },
    rhythm: { section: "compact", gap: "compact" },
    containerWidth: "1400px",
    shape: { radiusScale: "soft", borderWidth: "1px", shadowScale: "soft" },
    surface: { cardTreatment: "bordered", imageAspect: "1 / 1" },
    gridColumns: 4,
    heroVariant: "split-media",
    gridVariant: "dense-compact",
    cardStyle: "compact",
    navStyle: "sticky",
    sections: [
      vendorInfo(),
      { type: "hero", settings: { variant: "split-media", useVendorBanners: false } },
      { type: "product-grid", settings: { variant: "dense-compact", title: "Shop all", showCount: true } },
      {
        type: "rich-text",
        settings: {
          heading: "Warranty & support",
          body: "Every unit ships with a manufacturer warranty and a 7-day replacement window.\n\nSupport is handled directly by our team, not a third-party call centre.",
        },
      },
    ],
  },
  {
    name: "Savor",
    slug: "savor",
    description:
      "Appetite-forward storefront for food, beverage and artisanal producers. Warm tones, rounded cards and generous imagery that makes packaged goods look fresh.",
    category: "colorful",
    niche: "Food & beverage",
    mood: "warm",
    tags: ["warm", "rounded", "food", "artisanal"],
    skeleton: "classic",
    seedColors: { primary: "#C2410C", secondary: "#7C2D12", accent: "#FBBF24", background: "#FFFBF5" },
    fonts: { heading: "Fraunces, serif", body: "Nunito, sans-serif" },
    typeScale: { base: 1.0625, ratio: 1.25 },
    rhythm: { section: "normal", gap: "normal" },
    containerWidth: "1240px",
    shape: { radiusScale: "soft", borderWidth: "1px", shadowScale: "soft" },
    surface: { cardTreatment: "elevated", imageAspect: "3 / 2" },
    motion: "expressive",
    gridColumns: 4,
    heroVariant: "full-bleed",
    heroHeight: "480px",
    gridVariant: "standard",
    cardStyle: "detailed",
    navStyle: "top",
    footer: "colorful",
    sections: [
      vendorInfo(),
      { type: "hero", settings: { variant: "full-bleed", useVendorBanners: true, height: "480px" } },
      { type: "product-grid", settings: { variant: "standard", title: "Fresh from the kitchen", showCount: true } },
      {
        type: "rich-text",
        settings: {
          heading: "Made in small batches",
          body: "Cooked, jarred and labelled the same week it ships.\n\nNo preservatives, which is why our shelf lives are shorter than supermarket equivalents.",
        },
      },
    ],
  },
  {
    name: "Marquee",
    slug: "marquee",
    description:
      "Conversion-focused storefront for events, rentals and services. A large hero statement, social proof above the fold and clear calls to action throughout.",
    category: "bold",
    niche: "Events & services",
    mood: "bold",
    tags: ["cta-led", "testimonials", "services", "events"],
    skeleton: "classic",
    seedColors: { primary: "#7C3AED", secondary: "#4C1D95", accent: "#F59E0B", background: "#FFFFFF" },
    fonts: { heading: "Syne, sans-serif", body: "Manrope, sans-serif" },
    typeScale: { base: 1.0625, ratio: 1.333 },
    headingTracking: "-0.02em",
    rhythm: { section: "normal", gap: "normal" },
    containerWidth: "1280px",
    shape: { radiusScale: "soft", borderWidth: "1px", shadowScale: "elevated" },
    surface: { cardTreatment: "elevated", imageAspect: "3 / 2" },
    motion: "expressive",
    gridColumns: 3,
    heroVariant: "full-bleed",
    heroHeight: "540px",
    gridVariant: "standard",
    cardStyle: "detailed",
    navStyle: "sticky",
    sections: [
      vendorInfo(),
      { type: "hero", settings: { variant: "full-bleed", useVendorBanners: true, height: "540px" } },
      {
        type: "testimonials",
        settings: {
          title: "Trusted for over 200 events",
          testimonials: [
            { quote: "Setup was on time and the team handled every last-minute change.", author: "Vikram T.", role: "Wedding, 400 guests" },
            { quote: "Pricing was transparent with no surprise add-ons at the end.", author: "Deepa N.", role: "Corporate offsite" },
            { quote: "They ran the whole evening so we could actually enjoy it.", author: "Arun & Kavya", role: "Reception" },
          ],
        },
      },
      { type: "product-grid", settings: { variant: "standard", title: "Packages", showCount: false } },
      {
        type: "rich-text",
        settings: {
          heading: "How booking works",
          body: "Pick a package, share your date, and we confirm availability within one working day.\n\nA 25% deposit holds the date; the balance is due one week before the event.",
          align: "center",
        },
      },
    ],
  },
  {
    name: "Kirana",
    slug: "kirana",
    description:
      "Ultra-compact, low-bandwidth storefront for neighbourhood stores. Static rhythm, no motion, contact details pinned high — designed to be usable on a slow 3G connection.",
    category: "classic",
    niche: "Neighbourhood retail",
    mood: "catalog",
    tags: ["low-bandwidth", "compact", "local", "contact-first"],
    skeleton: "dense",
    seedColors: { primary: "#0F766E", secondary: "#115E59", accent: "#F97316", background: "#FFFFFF" },
    fonts: { heading: "Hind, sans-serif", body: "Hind, sans-serif" },
    typeScale: { base: 0.9375, ratio: 1.2 },
    rhythm: { section: "compact", gap: "compact" },
    containerWidth: "1200px",
    shape: { radiusScale: "soft", borderWidth: "1px", shadowScale: "none" },
    surface: { cardTreatment: "flat", imageAspect: "1 / 1" },
    motion: "none",
    gridColumns: 4,
    heroVariant: "minimal-type",
    gridVariant: "dense-compact",
    cardStyle: "compact",
    navStyle: "top",
    sections: [
      vendorInfo({ showContact: true, sticky: true }),
      { type: "hero", settings: { variant: "minimal-type", useVendorBanners: false } },
      { type: "product-grid", settings: { variant: "dense-compact", title: "Available now", showCount: true } },
    ],
  },
];

/** Fully expanded catalog manifests — appended to the legacy seed-derived themes. */
export const THEME_CATALOG: ThemeManifest[] = THEME_CATALOG_SPECS.map(buildThemeManifest);
