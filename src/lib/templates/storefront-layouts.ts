import { getLayoutNames } from "./component-registry";

/** Registered storefront layout identifiers. */
export const STOREFRONT_LAYOUT_IDS = [
  "default",
  "collection",
  "emporium",
  "runway",
  "reloop",
] as const;

export type StorefrontLayoutId = (typeof STOREFRONT_LAYOUT_IDS)[number];

export type StorefrontLayoutDefinition = {
  id: StorefrontLayoutId;
  label: string;
  description: string;
  industryName: string;
  columnsHint: string;
  bestFor: string;
};

export const STOREFRONT_LAYOUTS: StorefrontLayoutDefinition[] = [
  {
    id: "default",
    label: "Classic Grid",
    industryName: "Product grid",
    description: "Responsive catalog grid with hero banner and vendor header — 1 to 3 products per row.",
    columnsHint: "1 → 2 → 3 cols",
    bestFor: "General women's wear, mixed catalogs",
  },
  {
    id: "collection",
    label: "Boutique Grid",
    industryName: "Luxury catalog",
    description: "Editorial bordered tiles in a refined 4-column boutique grid.",
    columnsHint: "2 → 4 cols",
    bestFor: "Curated collections, sarees, premium ethnic",
  },
  {
    id: "emporium",
    label: "Catalog Shop",
    industryName: "Dense catalog",
    description: "Search and filters with a dense 2–4 column product grid.",
    columnsHint: "2 → 3 → 4 cols",
    bestFor: "Large inventories, multi-category shops",
  },
  {
    id: "runway",
    label: "Runway Lookbook",
    industryName: "Editorial lookbook",
    description: "One product per row with alternating image and copy — magazine style.",
    columnsHint: "1 per row",
    bestFor: "Designers, bridal, editorial brands",
  },
  {
    id: "reloop",
    label: "Social Gallery",
    industryName: "Instagram grid",
    description: "Tight square image grid with seller profile header.",
    columnsHint: "3 → 5 cols",
    bestFor: "Resellers, Instagram-first sellers",
  },
];

export function isStorefrontLayoutId(value: string | null | undefined): value is StorefrontLayoutId {
  return Boolean(value && STOREFRONT_LAYOUT_IDS.includes(value as StorefrontLayoutId));
}

export function getStorefrontLayoutDefinition(
  id: string | null | undefined,
): StorefrontLayoutDefinition | null {
  if (!isStorefrontLayoutId(id)) return null;
  return STOREFRONT_LAYOUTS.find((layout) => layout.id === id) ?? null;
}

/** Layout used at render time: vendor override, else theme default, else `default`. */
export function resolveEffectiveStorefrontLayout(
  layoutOverride: string | null | undefined,
  templateLayout: string | null | undefined,
): StorefrontLayoutId {
  if (isStorefrontLayoutId(layoutOverride)) return layoutOverride;
  if (isStorefrontLayoutId(templateLayout)) return templateLayout;
  return "default";
}

/** Ensure registry and constants stay aligned in development. */
export function assertStorefrontLayoutRegistry(): void {
  const registered = new Set(getLayoutNames());
  for (const id of STOREFRONT_LAYOUT_IDS) {
    if (!registered.has(id)) {
      throw new Error(`Storefront layout "${id}" is not registered in component-registry`);
    }
  }
}
