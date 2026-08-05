import { getThemeManifests, getThemeManifestBySlug } from "./manifests/registry";
import type { TemplateSeedData } from "./seed-templates";
import type {
  ResolvedTemplate,
  TemplateConfig,
  TemplateCustomization,
} from "@/types/template-customization";
import type { StorefrontSection } from "@/types/template-sections";

export type TemplateCategory = TemplateSeedData["category"];

/** Representative manifest used as the live-preview starter for each category. */
export function getCategoryStarterManifest(category: TemplateCategory) {
  const match = getThemeManifests().find(
    (manifest) => manifest.category === category && manifest.isActive,
  );
  if (match) return match;

  const fallback = getThemeManifests().find((manifest) => manifest.isActive);
  if (!fallback) {
    throw new Error("No active theme manifests configured");
  }

  return fallback;
}

export function getCategoryStarterSeed(category: TemplateCategory) {
  return getCategoryStarterManifest(category);
}

export function getCategoryStarterConfig(category: TemplateCategory): TemplateConfig {
  return getCategoryStarterManifest(category).templateConfig as TemplateConfig;
}

export function getCategoryComponentMapping(
  category: TemplateCategory,
): ResolvedTemplate["componentMapping"] {
  return getCategoryStarterManifest(category).componentMapping;
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
    tokens: {
      ...(starter.tokens ?? {}),
      ...(customization.tokens ?? {}),
    },
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

export function getRunwayManifest() {
  return getThemeManifestBySlug("runway");
}
