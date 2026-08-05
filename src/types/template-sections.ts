import { z } from "zod";

/**
 * Storefront Sections
 * Modular building blocks composing a vendor storefront. A template that uses
 * the `modular` layout renders its sections in `order`, skipping disabled ones.
 */
export const storefrontSectionTypeSchema = z.enum([
  "hero",
  "product-grid",
  "product-lookbook",
  "testimonials",
  "rich-text",
  "vendor-info",
]);

export type StorefrontSectionType = z.infer<typeof storefrontSectionTypeSchema>;

export const storefrontSectionSchema = z.object({
  id: z.string(),
  type: storefrontSectionTypeSchema,
  enabled: z.boolean(),
  order: z.number(),
  settings: z.record(z.string(), z.unknown()),
});

export type StorefrontSection = z.infer<typeof storefrontSectionSchema>;

export const storefrontSectionsSchema = z.array(storefrontSectionSchema);

/** Human readable labels used by the builder UI. */
export const SECTION_LABELS: Record<StorefrontSectionType, string> = {
  hero: "Hero Banner",
  "product-grid": "Product Grid",
  "product-lookbook": "Product Lookbook",
  testimonials: "Testimonials",
  "rich-text": "Rich Text",
  "vendor-info": "Vendor Info",
};

/** Canonical vendor storefront — hero, vendor bar, then product list. */
export const CORE_STOREFRONT_SECTION_TYPES = [
  "hero",
  "vendor-info",
  "product-grid",
] as const satisfies readonly StorefrontSectionType[];

export type CoreStorefrontSectionType = (typeof CORE_STOREFRONT_SECTION_TYPES)[number];

/**
 * Default section stack for every vendor storefront:
 * 1. Hero banner
 * 2. Vendor info (breadcrumb + contact bar)
 * 3. Product list
 */
export const DEFAULT_SECTIONS: StorefrontSection[] = [
  {
    id: "hero-1",
    type: "hero",
    enabled: true,
    order: 0,
    settings: {
      useVendorBanners: true,
      height: "480px",
    },
  },
  {
    id: "vendor-info-1",
    type: "vendor-info",
    enabled: true,
    order: 1,
    settings: {
      showBreadcrumb: true,
      showContact: true,
      sticky: true,
    },
  },
  {
    id: "product-grid-1",
    type: "product-grid",
    enabled: true,
    order: 2,
    settings: {
      title: "Products",
      showCount: true,
    },
  },
];

/**
 * Collapse any template section list to the three core storefront sections
 * in canonical order (hero → vendor → products).
 */
export function normalizeStorefrontSections(
  sections: StorefrontSection[] | undefined | null,
): StorefrontSection[] {
  const source = sections && sections.length > 0 ? sections : DEFAULT_SECTIONS;
  const byType = new Map<CoreStorefrontSectionType, StorefrontSection>();

  for (const section of source) {
    if (!CORE_STOREFRONT_SECTION_TYPES.includes(section.type as CoreStorefrontSectionType)) {
      continue;
    }

    const type = section.type as CoreStorefrontSectionType;
    const existing = byType.get(type);

    if (!existing) {
      byType.set(type, { ...section, type });
      continue;
    }

    byType.set(type, {
      ...existing,
      ...section,
      type,
      settings: { ...existing.settings, ...section.settings },
      enabled: section.enabled !== false,
    });
  }

  return CORE_STOREFRONT_SECTION_TYPES.map((type, order) => {
    const found = byType.get(type);
    if (found) {
      return { ...found, order, enabled: found.enabled !== false };
    }
    return createDefaultSection(type, order);
  });
}

/** Fresh section with sensible defaults for the builder's "add section" action. */
export function createDefaultSection(
  type: StorefrontSectionType,
  order: number
): StorefrontSection {
  const settingsByType: Record<StorefrontSectionType, Record<string, unknown>> = {
    hero: { useVendorBanners: true, height: "480px" },
    "product-grid": { title: "Products", showCount: true },
    "product-lookbook": { sectionLabel: "The Collection", showIndex: true, ctaLabel: "Shop the look" },
    testimonials: { title: "What customers say", testimonials: [] },
    "rich-text": { heading: "About", body: "" },
    "vendor-info": { showBreadcrumb: true, showContact: true, sticky: true },
  };

  return {
    id: `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    type,
    enabled: true,
    order,
    settings: settingsByType[type],
  };
}
