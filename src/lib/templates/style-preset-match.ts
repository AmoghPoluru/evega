import type { TemplateCustomization } from "@/types/template-customization";

import type { StylePresetId } from "./style-preset-ids";
import { STYLE_PRESETS } from "./style-presets";

type PresetComparable = {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    border?: string;
    cardBackground?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  backgroundStyle?: {
    type?: string;
    value?: string;
    source?: string;
  };
};

function toPresetComparable(customization: TemplateCustomization): PresetComparable {
  return {
    colors: customization.colors
      ? {
          primary: customization.colors.primary,
          secondary: customization.colors.secondary,
          accent: customization.colors.accent,
          background: customization.colors.background,
          border: customization.colors.border,
          cardBackground: customization.colors.cardBackground,
        }
      : undefined,
    fonts: customization.fonts,
    backgroundStyle: customization.backgroundStyle
      ? {
          type: customization.backgroundStyle.type,
          value: customization.backgroundStyle.value,
          source: customization.backgroundStyle.source,
        }
      : undefined,
  };
}

/** True when current values still match a preset's skin (colors, fonts, background). */
export function customizationMatchesPreset(
  values: TemplateCustomization,
  presetId: StylePresetId,
): boolean {
  const preset = STYLE_PRESETS.find((item) => item.id === presetId);
  if (!preset) return false;

  return (
    JSON.stringify(toPresetComparable(values)) ===
    JSON.stringify(toPresetComparable(preset.customization))
  );
}

/** Persist preset id when still accurate; otherwise clear it. */
export function resolveStylePresetIdForSave(
  values: TemplateCustomization,
): StylePresetId | null {
  if (values.stylePresetId && customizationMatchesPreset(values, values.stylePresetId)) {
    return values.stylePresetId;
  }

  return null;
}
