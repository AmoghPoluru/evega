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

/**
 * Default section stack — reproduces the structure of `DefaultLayout`:
 * vendor info bar, hero banner carousel, then the filterable product grid.
 */
export const DEFAULT_SECTIONS: StorefrontSection[] = [
  {
    id: "vendor-info-1",
    type: "vendor-info",
    enabled: true,
    order: 0,
    settings: {
      showBreadcrumb: true,
      showContact: true,
      sticky: true,
    },
  },
  {
    id: "hero-1",
    type: "hero",
    enabled: true,
    order: 1,
    settings: {
      useVendorBanners: true,
      height: "480px",
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
