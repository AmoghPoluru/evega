import type { FieldNamesMarkedBoolean } from "react-hook-form";

import type { TemplateCustomization } from "@/types/template-customization";

import { resolveMergedBackgroundStyle } from "./resolve-merged-background-style";

function pickColors(values: TemplateCustomization): NonNullable<TemplateCustomization["colors"]> | undefined {
  if (!values.colors) return undefined;

  return {
    primary: values.colors.primary,
    secondary: values.colors.secondary,
    accent: values.colors.accent,
    background: values.colors.background,
    text: values.colors.text,
    textSecondary: values.colors.textSecondary,
    border: values.colors.border,
    cardBackground: values.colors.cardBackground,
  };
}

function normalizeBackgroundStyle(
  values: TemplateCustomization,
): TemplateCustomization["backgroundStyle"] | undefined {
  const type = values.backgroundStyle?.type;
  if (type === "solid" || type === "gradient" || type === "mesh-gradient") {
    return resolveMergedBackgroundStyle(undefined, values.backgroundStyle, values.colors ?? {});
  }

  return values.backgroundStyle;
}

type BuildStylePatchOptions = {
  /** When true, include colors, fonts, and background even if not dirty. */
  includeAll?: boolean;
  dirtyFields?: FieldNamesMarkedBoolean<TemplateCustomization>;
};

/**
 * Build a partial customization patch for saving.
 * Typography-only saves must not overwrite backgroundStyle on the server.
 */
export function buildStyleCustomizationPatch(
  values: TemplateCustomization,
  options: BuildStylePatchOptions = {},
): TemplateCustomization {
  const { includeAll = false, dirtyFields } = options;

  const isSectionDirty = (key: keyof TemplateCustomization): boolean => {
    if (includeAll) return true;
    return Boolean(dirtyFields?.[key]);
  };

  const patch: TemplateCustomization = {};

  if (isSectionDirty("colors") && values.colors) {
    patch.colors = pickColors(values);
  }

  if (isSectionDirty("fonts") && values.fonts) {
    patch.fonts = values.fonts;
  }

  const backgroundSectionDirty = isSectionDirty("backgroundStyle");
  const colorsChanged = isSectionDirty("colors");

  if (backgroundSectionDirty || (colorsChanged && values.backgroundStyle?.type)) {
    const normalized = normalizeBackgroundStyle(values);
    if (normalized) {
      patch.backgroundStyle = normalized;
    }

    const type = values.backgroundStyle?.type;
    if (type === "solid" || type === "gradient" || type === "mesh-gradient") {
      patch.colors = {
        ...patch.colors,
        ...pickColors(values),
      };
    }
  }

  return patch;
}

/** Full Tier-1 style payload with normalized background for preset / manual save. */
export function buildFullStyleCustomization(values: TemplateCustomization): TemplateCustomization {
  return buildStyleCustomizationPatch(values, { includeAll: true });
}
