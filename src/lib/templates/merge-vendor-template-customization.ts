import type { TemplateCustomization } from "@/types/template-customization";

import { resolveMergedBackgroundStyle } from "./resolve-merged-background-style";

/** Deep-merge vendor template customization patches (used when saving style edits). */
export function mergeVendorTemplateCustomization(
  existing: TemplateCustomization | null | undefined,
  patch: TemplateCustomization,
): TemplateCustomization {
  const base = existing ?? {};
  const mergedColors = patch.colors ? { ...base.colors, ...patch.colors } : base.colors;

  const mergedBackgroundStyle = patch.backgroundStyle
    ? resolveMergedBackgroundStyle(base.backgroundStyle, patch.backgroundStyle, mergedColors ?? {})
    : base.backgroundStyle;

  return {
    ...base,
    ...patch,
    colors: mergedColors,
    fonts: patch.fonts ? { ...base.fonts, ...patch.fonts } : base.fonts,
    spacing: patch.spacing ? { ...base.spacing, ...patch.spacing } : base.spacing,
    layout: patch.layout ? { ...base.layout, ...patch.layout } : base.layout,
    textStyles: patch.textStyles ? { ...base.textStyles, ...patch.textStyles } : base.textStyles,
    backgroundStyle: mergedBackgroundStyle,
    components: patch.components
      ? {
          heroBanner: patch.components.heroBanner
            ? { ...base.components?.heroBanner, ...patch.components.heroBanner }
            : base.components?.heroBanner,
          productCard: patch.components.productCard
            ? { ...base.components?.productCard, ...patch.components.productCard }
            : base.components?.productCard,
          navigation: patch.components.navigation
            ? { ...base.components?.navigation, ...patch.components.navigation }
            : base.components?.navigation,
        }
      : base.components,
  };
}
