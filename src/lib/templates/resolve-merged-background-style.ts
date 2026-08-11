import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";

import {
  buildBackgroundStyleForType,
  isGradientCssValue,
  isSolidColorValue,
  type VendorBackgroundStyleType,
} from "./build-background-style-for-type";

type BackgroundColors = {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  cardBackground?: string;
};

const DEFAULT_MESH_BACKGROUND: NonNullable<TemplateConfig["backgroundStyle"]> = {
  type: "mesh-gradient",
  animation: { enabled: true, duration: "15s", easing: "ease" },
};

function isVendorBackgroundType(
  type: string | null | undefined,
): type is VendorBackgroundStyleType {
  return type === "solid" || type === "gradient" || type === "mesh-gradient";
}

function colorsForBackgroundType(
  type: VendorBackgroundStyleType,
  colors: BackgroundColors,
  customization: NonNullable<TemplateCustomization["backgroundStyle"]>,
): BackgroundColors {
  if (type === "solid") {
    const solidValue = isSolidColorValue(customization.value) ? customization.value : undefined;

    return {
      ...colors,
      background: solidValue ?? colors.background,
    };
  }

  // Mesh and gradient must not inherit a solid page fill from a previous style.
  return {
    ...colors,
    background: "transparent",
  };
}

function shouldRebuildGradientValue(
  value: string | undefined,
  primary: string | undefined,
): boolean {
  if (!value || !isGradientCssValue(value)) return true;
  if (!primary) return false;
  return value.toUpperCase().includes(primary.toUpperCase());
}

/** Merge base + customization into a complete backgroundStyle for rendering. */
export function resolveMergedBackgroundStyle(
  base: TemplateConfig["backgroundStyle"] | TemplateCustomization["backgroundStyle"] | undefined,
  customization: TemplateCustomization["backgroundStyle"] | undefined,
  colors: BackgroundColors,
): TemplateConfig["backgroundStyle"] {
  const baseStyle = base ?? DEFAULT_MESH_BACKGROUND;

  if (!customization) {
    return baseStyle as TemplateConfig["backgroundStyle"];
  }

  if (isVendorBackgroundType(customization.type)) {
    const type = customization.type;
    const built = buildBackgroundStyleForType(
      type,
      colorsForBackgroundType(type, colors, customization),
    );

    if (type === "gradient") {
      const keepSavedValue =
        isGradientCssValue(customization.value) &&
        !shouldRebuildGradientValue(customization.value, colors.primary);

      return {
        ...built,
        value: keepSavedValue ? customization.value : built.value,
      } as TemplateConfig["backgroundStyle"];
    }

    if (type === "solid") {
      return {
        ...built,
        value: isSolidColorValue(customization.value) ? customization.value : built.value,
      } as TemplateConfig["backgroundStyle"];
    }

    return {
      ...built,
      animation: customization.animation ?? built.animation,
    } as TemplateConfig["backgroundStyle"];
  }

  return {
    ...baseStyle,
    ...customization,
  } as TemplateConfig["backgroundStyle"];
}
