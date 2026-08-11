import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";

import { isSolidColorValue } from "./build-background-style-for-type";
import { resolveMergedBackgroundStyle } from "./resolve-merged-background-style";

type ContrastColors = {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  cardBackground?: string;
};

/** Blend a 6-digit hex color toward white (0 = unchanged, 1 = white). */
export function mixHexWithWhite(hex: string, whiteRatio: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;

  const channels = [0, 2, 4].map((start) => Number.parseInt(normalized.slice(start, start + 2), 16));
  const mixChannel = (channel: number) =>
    Math.round(channel * (1 - whiteRatio) + 255 * whiteRatio);

  return `#${channels
    .map((channel) => mixChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Pick a single hex tone that represents where body text sits on the resolved page backdrop.
 * Used for auto-contrast — not the brand primary alone.
 */
export function resolvePageBackgroundContrastHex(
  values: TemplateCustomization,
  baseColors?: ContrastColors | TemplateConfig["colors"],
): string | null {
  const colors: ContrastColors = {
    ...baseColors,
    ...values.colors,
  };

  const backgroundStyle = resolveMergedBackgroundStyle(
    undefined,
    values.backgroundStyle,
    colors,
  );

  const type = backgroundStyle?.type;

  if (type === "solid") {
    const solid =
      (backgroundStyle?.value && isSolidColorValue(backgroundStyle.value)
        ? backgroundStyle.value
        : undefined) ??
      (colors.background && colors.background !== "transparent"
        ? colors.background
        : undefined) ??
      colors.primary;

    return solid?.startsWith("#") ? solid : null;
  }

  if (type === "gradient") {
    const primary = colors.primary;
    return primary?.startsWith("#") ? mixHexWithWhite(primary, 0.35) : null;
  }

  if (type === "mesh-gradient") {
    return colors.primary?.startsWith("#") ? colors.primary : null;
  }

  if (colors.background && colors.background !== "transparent" && colors.background.startsWith("#")) {
    return colors.background;
  }

  return colors.primary?.startsWith("#") ? colors.primary : null;
}
