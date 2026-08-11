import type { TemplateCustomization } from "@/types/template-customization";

export type VendorBackgroundStyleType = "solid" | "gradient" | "mesh-gradient";

type BackgroundColors = {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  cardBackground?: string;
};

export function isGradientCssValue(value: string | undefined): boolean {
  return Boolean(value && /gradient\s*\(/i.test(value));
}

export function isSolidColorValue(value: string | undefined): boolean {
  return Boolean(value && !isGradientCssValue(value));
}

/** High-contrast gradient so it is clearly not a flat solid fill. */
export function buildDistinctGradientValue(
  primary: string,
  secondary: string,
  accent: string,
): string {
  return [
    "linear-gradient(155deg,",
    `color-mix(in srgb, ${primary} 10%, white) 0%,`,
    `color-mix(in srgb, ${primary} 38%, white) 22%,`,
    `${primary} 48%,`,
    `${secondary} 74%,`,
    `color-mix(in srgb, ${accent} 88%, black) 100%)`,
  ].join(" ");
}

/** Build a complete backgroundStyle object so each type renders distinctly on the storefront. */
export function buildBackgroundStyleForType(
  type: VendorBackgroundStyleType,
  colors: BackgroundColors = {},
): NonNullable<TemplateCustomization["backgroundStyle"]> {
  const primary = colors.primary ?? "#1A1A1A";
  const secondary = colors.secondary ?? "#6B7280";
  const accent = colors.accent ?? secondary;

  if (type === "solid") {
    if (colors.background && colors.background !== "transparent") {
      return { type: "solid", value: colors.background, source: "generated" };
    }

    // Presets use transparent background for mesh/gradient — solid should show brand color
    if (colors.primary) {
      return { type: "solid", value: colors.primary, source: "generated" };
    }

    if (colors.secondary) {
      return { type: "solid", value: colors.secondary, source: "generated" };
    }

    return { type: "solid", value: colors.cardBackground ?? "#F5F5F5", source: "generated" };
  }

  if (type === "gradient") {
    return {
      type: "gradient",
      value: buildDistinctGradientValue(primary, secondary, accent),
      source: "generated",
    };
  }

  return {
    type: "mesh-gradient",
    source: "generated",
    animation: { enabled: true, duration: "15s", easing: "ease" },
  };
}
