import type { StorefrontSection, StorefrontSectionType } from "@/types/template-sections";
import {
  normalizeGridLayout,
  type EcommerceGridLayout,
} from "@/lib/templates/product-grid-layouts";
import type { HeroBannerVariant, ProductLayoutVariant } from "./builder-panels";

export function findSection(
  sections: StorefrontSection[],
  type: StorefrontSectionType,
): StorefrontSection | undefined {
  return sections.find((section) => section.type === type && section.enabled);
}

export function updateSectionSettings(
  sections: StorefrontSection[],
  type: StorefrontSectionType,
  settings: Record<string, unknown>,
): StorefrontSection[] {
  return sections.map((section) =>
    section.type === type
      ? { ...section, settings: { ...section.settings, ...settings } }
      : section,
  );
}

export function heroVariantToComponentStyle(
  variant: HeroBannerVariant,
): "full-width" | "split" | "minimal" {
  if (variant === "split-media") return "split";
  if (variant === "minimal-type") return "minimal";
  if (variant === "carousel-peek") return "full-width";
  return "full-width";
}

export function applyHeroVariant(
  sections: StorefrontSection[],
  variant: HeroBannerVariant,
): StorefrontSection[] {
  return updateSectionSettings(sections, "hero", {
    variant,
    useVendorBanners: variant !== "minimal-type",
  });
}

export function applyProductLayout(
  sections: StorefrontSection[],
  variant: ProductLayoutVariant,
): StorefrontSection[] {
  const normalized = normalizeGridLayout(variant);
  const withoutLookbook = sections.filter((section) => section.type !== "product-lookbook");
  const gridSection = withoutLookbook.find((section) => section.type === "product-grid");

  const nextGrid: StorefrontSection = gridSection ?? {
    id: `product-grid-${Date.now()}`,
    type: "product-grid",
    enabled: true,
    order: 2,
    settings: { title: "Products", showCount: true, variant: normalized },
  };

  return withoutLookbook
    .filter((section) => section.type !== "product-grid")
    .concat({
      ...nextGrid,
      enabled: true,
      settings: { ...nextGrid.settings, variant: normalized },
    })
    .map((section, index) => ({ ...section, order: index }));
}

export function getHeroVariant(sections: StorefrontSection[]): HeroBannerVariant {
  const hero = findSection(sections, "hero");
  const variant = hero?.settings?.variant;
  if (variant === "split-media" || variant === "minimal-type" || variant === "full-bleed" || variant === "carousel-peek") {
    return variant;
  }
  return "full-bleed";
}

export function inferHeroVariantFromConfig(
  config: { components?: { heroBanner?: { style?: string } } },
  sections: StorefrontSection[],
): HeroBannerVariant {
  const fromSection = getHeroVariant(sections);
  const hero = findSection(sections, "hero");
  if (hero?.settings?.variant) {
    return fromSection;
  }

  const style = config.components?.heroBanner?.style;
  if (style === "split") return "split-media";
  if (style === "minimal") return "minimal-type";
  const sectionVariant = hero?.settings?.variant;
  if (sectionVariant === "carousel-peek") return "carousel-peek";
  return "full-bleed";
}

export function getProductLayoutVariant(sections: StorefrontSection[]): EcommerceGridLayout {
  const grid = findSection(sections, "product-grid");
  return normalizeGridLayout(grid?.settings?.variant);
}

export function inferProductLayoutFromConfig(
  config: { layout?: { productGridColumns?: number } },
  sections: StorefrontSection[],
): EcommerceGridLayout {
  const grid = findSection(sections, "product-grid");
  if (grid?.settings?.variant) {
    return normalizeGridLayout(grid.settings.variant);
  }

  const columns = config.layout?.productGridColumns;
  if (columns != null && columns >= 5) return "dense-multi";
  if (columns != null && columns <= 2) return "two-column";
  return "standard-column";
}
