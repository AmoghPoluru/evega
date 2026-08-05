import { templateSeeds, type TemplateSeedData } from "./seed-templates";
import type {
  ResolvedTemplate,
  TemplateConfig,
  TemplateCustomization,
} from "@/types/template-customization";
import type { StorefrontSection } from "@/types/template-sections";

export type TemplateCategory = TemplateSeedData["category"];

/** Representative seeded template used as the live-preview starter for each category. */
export function getCategoryStarterSeed(category: TemplateCategory): TemplateSeedData {
  const match = templateSeeds.find((seed) => seed.category === category && seed.isActive);
  if (match) return match;

  const fallback = templateSeeds.find((seed) => seed.isActive);
  if (!fallback) {
    throw new Error("No active template seeds configured");
  }

  return fallback;
}

export function getCategoryStarterConfig(category: TemplateCategory): TemplateConfig {
  return getCategoryStarterSeed(category).templateConfig as TemplateConfig;
}

export function getCategoryComponentMapping(
  category: TemplateCategory,
): ResolvedTemplate["componentMapping"] {
  return getCategoryStarterSeed(category).componentMapping;
}

/** Apply vendor overrides on top of the category starter without changing category metadata. */
export function mergeCategoryWithCustomization(
  category: TemplateCategory,
  customization: TemplateCustomization = {},
  sections?: StorefrontSection[],
): TemplateConfig {
  const starter = getCategoryStarterConfig(category);
  const mergedColors = {
    ...starter.colors,
    ...(customization.colors ?? {}),
  };
  const mergedFonts = {
    ...starter.fonts,
    ...(customization.fonts ?? {}),
  };

  return {
    ...starter,
    colors: mergedColors,
    fonts: mergedFonts,
    components: {
      heroBanner: {
        ...starter.components.heroBanner,
        ...(customization.components?.heroBanner ?? {}),
      },
      productCard: {
        ...starter.components.productCard,
        ...(customization.components?.productCard ?? {}),
      },
      navigation: {
        ...starter.components.navigation,
        ...(customization.components?.navigation ?? {}),
        backgroundColor: mergedColors.primary,
      },
    },
    sections: sections ?? starter.sections,
  };
}
