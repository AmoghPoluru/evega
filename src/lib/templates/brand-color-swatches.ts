import { BUILTIN_TEMPLATE_CONFIG } from "./default-template";
import { STYLE_PRESETS } from "./style-presets";

/** Curated palette chips for the brand color picker (deduped). */
export function getBrandColorSwatches(): string[] {
  const colors = new Set<string>();

  const add = (value: string | undefined) => {
    const hex = value?.startsWith("#") ? value.toUpperCase() : undefined;
    if (hex && hex.length >= 4) colors.add(hex);
  };

  add(BUILTIN_TEMPLATE_CONFIG.colors.primary);
  add(BUILTIN_TEMPLATE_CONFIG.colors.secondary);
  add(BUILTIN_TEMPLATE_CONFIG.colors.accent);

  for (const preset of STYLE_PRESETS) {
    add(preset.customization.colors?.primary);
    add(preset.customization.colors?.secondary);
    add(preset.customization.colors?.accent);
    for (const swatch of preset.swatches) add(swatch);
  }

  ["#1A1A1A", "#6B7280", "#FFFFFF", "#FAFAFA", "#F5F5F5"].forEach(add);

  return Array.from(colors);
}

export const BRAND_COLOR_SWATCHES = getBrandColorSwatches();
