import type { EcommerceGridLayout } from "@/lib/templates/product-grid-layouts";
import { ECOMMERCE_GRID_LAYOUTS } from "@/lib/templates/product-grid-layouts";

export type BuilderPanelId =
  | "background"
  | "layout"
  | "typography"
  | "chrome"
  | "hero"
  | "vendor";

export const BUILDER_PANELS: Array<{ id: BuilderPanelId; label: string }> = [
  { id: "background", label: "Background color" },
  { id: "layout", label: "Layout type" },
  { id: "typography", label: "Typography" },
  { id: "chrome", label: "Storefront chrome" },
  { id: "hero", label: "Hero banner type" },
  { id: "vendor", label: "Vendor details" },
];

export type HeroBannerVariant = "full-bleed" | "split-media" | "minimal-type" | "carousel-peek";

/** Product grid layout variants — alias for builder state. */
export type ProductLayoutVariant = EcommerceGridLayout;

export const LAYOUT_TYPE_OPTIONS = ECOMMERCE_GRID_LAYOUTS.map((entry) => ({
  value: entry.value,
  label: entry.label,
  description: entry.description,
  tradeOff: entry.tradeOff,
  columns: entry.columns,
}));

export const HERO_BANNER_OPTIONS: Array<{
  value: HeroBannerVariant;
  label: string;
  description: string;
}> = [
  {
    value: "full-bleed",
    label: "Full bleed",
    description: "Edge-to-edge cover image with centered title",
  },
  {
    value: "split-media",
    label: "Split media",
    description: "Image on one side, headline on the other",
  },
  {
    value: "minimal-type",
    label: "Minimal type",
    description: "Typography-only hero, no banner image",
  },
  {
    value: "carousel-peek",
    label: "Carousel peek",
    description: "Triumph-style hero with side panel peek and dual CTAs",
  },
];

export const BACKGROUND_STYLE_OPTIONS = [
  {
    value: "light-tint" as const,
    label: "Light tint",
    description: "Soft pale wash of your hue — airy and readable",
  },
  {
    value: "dark-obsidian" as const,
    label: "Dark obsidian",
    description: "Deep obsidian base with a hint of your color",
  },
  {
    value: "monochrome-wash" as const,
    label: "Monochromatic wash",
    description: "Muted single-hue surface across the page",
  },
  {
    value: "linear-gradient" as const,
    label: "Linear gradient",
    description: "Light-to-deep gradient leaning into your hue",
  },
  {
    value: "mesh-gradient" as const,
    label: "Mesh gradient",
    description: "Animated mesh with darker premium tones",
  },
  {
    value: "modal-overlay" as const,
    label: "Modal overlay",
    description: "Dimmed overlay depth — focus-forward backdrop",
  },
  {
    value: "semantic-tint" as const,
    label: "Semantic tint",
    description: "Pale surface with strong hue text — banner-style contrast",
  },
] as const;

export type BackgroundStyleOption = (typeof BACKGROUND_STYLE_OPTIONS)[number]["value"];
