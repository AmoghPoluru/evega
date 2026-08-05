/** E-commerce product grid layout catalog — used by the template builder and storefront. */

export const ECOMMERCE_GRID_LAYOUTS = [
  {
    value: "standard-column" as const,
    label: "Standard column grid",
    description:
      "3–4 equal columns on desktop, 2 on mobile. Best for clothing, marketplaces, general catalogs.",
    tradeOff: "Neutral and predictable — no product gets visual priority.",
    columns: { desktop: 4, tablet: 3, mobile: 2 },
  },
  {
    value: "two-column" as const,
    label: "2-column grid",
    description:
      "2 large columns with generous imagery. Best for luxury brands and mobile-first browsing.",
    tradeOff: "Maximizes photography, but shows fewer items per scroll.",
    columns: { desktop: 2, tablet: 2, mobile: 1 },
  },
  {
    value: "dense-multi" as const,
    label: "5+ column heavy density",
    description:
      "5–8 tight columns with minimal spacing. Best for wholesale and Amazon-style marketplaces.",
    tradeOff: "Fits more SKUs on screen, sacrifices per-item polish.",
    columns: { desktop: 6, tablet: 4, mobile: 2 },
  },
  {
    value: "bento" as const,
    label: "Bento grid",
    description:
      "Mixed cell sizes with oversized featured blocks. Best for electronics and DTC landing pages.",
    tradeOff: "Great for merchandising a hero product, but breaks scan rhythm.",
    columns: { desktop: 4, tablet: 3, mobile: 2 },
  },
  {
    value: "masonry" as const,
    label: "Masonry grid",
    description:
      "Variable-height tiles without row alignment (Pinterest-style). Best for home décor, jewelry, artistic apparel.",
    tradeOff: "Natural editorial feel, but harder to scan row by row.",
    columns: { desktop: 4, tablet: 3, mobile: 2 },
  },
  {
    value: "hierarchical-promo" as const,
    label: "Hierarchical grid with promo cards",
    description:
      "Standard grid plus periodic oversized editorial slots. Best for beauty and lifestyle brands.",
    tradeOff: "Pushes specific inventory without abandoning grid structure.",
    columns: { desktop: 4, tablet: 3, mobile: 2 },
  },
  {
    value: "hybrid-toggle" as const,
    label: "Hybrid grid / list toggle",
    description:
      "Switch between dense grid and spec-heavy list. Best for technical, automotive, and industrial.",
    tradeOff: "Serves two audiences, but doubles the UI surface area.",
    columns: { desktop: 3, tablet: 2, mobile: 1 },
  },
] as const;

export type EcommerceGridLayout = (typeof ECOMMERCE_GRID_LAYOUTS)[number]["value"];

const LEGACY_VARIANT_MAP: Record<string, EcommerceGridLayout> = {
  standard: "standard-column",
  "dense-compact": "dense-multi",
  compact: "dense-multi",
  "editorial-rows": "two-column",
  masonry: "masonry",
};

/** Normalize persisted variant strings (including legacy values) to the current catalog. */
export function normalizeGridLayout(value: unknown): EcommerceGridLayout {
  if (typeof value !== "string") return "standard-column";
  if (ECOMMERCE_GRID_LAYOUTS.some((entry) => entry.value === value)) {
    return value as EcommerceGridLayout;
  }
  return LEGACY_VARIANT_MAP[value] ?? "standard-column";
}

export function getGridLayoutMeta(layout: EcommerceGridLayout) {
  return ECOMMERCE_GRID_LAYOUTS.find((entry) => entry.value === layout) ?? ECOMMERCE_GRID_LAYOUTS[0];
}

/** Map grid layout to page skeleton chrome (spacing / rhythm). */
export function gridLayoutToSkeleton(
  layout: EcommerceGridLayout,
): "classic" | "editorial" | "showcase" | "dense" {
  switch (layout) {
    case "two-column":
    case "masonry":
      return "editorial";
    case "dense-multi":
      return "dense";
    case "hybrid-toggle":
      return "showcase";
    default:
      return "classic";
  }
}
