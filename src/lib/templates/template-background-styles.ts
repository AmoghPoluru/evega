import type { TemplateConfig } from "@/types/template-customization";
import {
  generateBackgroundCSS,
  generateBackgroundKeyframes,
} from "./css-variables";

/**
 * Resolve the page background token used by layouts for simple solid fills.
 * Mesh/gradient backgrounds are applied via {@link buildVendorPageBackgroundStyles}.
 */
export function resolveTemplateBackgroundColor(
  templateConfig: TemplateConfig | Record<string, unknown>,
): string {
  const config = templateConfig as TemplateConfig;
  const colors = config.colors ?? {};
  const backgroundStyle = config.backgroundStyle;

  if (backgroundStyle?.type === "solid" && backgroundStyle.value) {
    return backgroundStyle.value;
  }

  if (
    backgroundStyle?.type === "mesh-gradient" ||
    backgroundStyle?.type === "gradient" ||
    backgroundStyle?.type === "pattern" ||
    backgroundStyle?.type === "image"
  ) {
    return "transparent";
  }

  if (colors.background && colors.background !== "transparent") {
    return colors.background;
  }

  return colors.cardBackground || "#FFFFFF";
}

/**
 * Scoped CSS so every storefront layout honors templateConfig.backgroundStyle.
 */
export function buildVendorPageBackgroundStyles(
  scopeClass: string,
  templateConfig: TemplateConfig | Record<string, unknown>,
  cssVariables: Record<string, string>,
): string {
  const config = templateConfig as TemplateConfig;
  const backgroundCss = generateBackgroundCSS(config.backgroundStyle, cssVariables);
  const keyframes = generateBackgroundKeyframes(config.backgroundStyle);

  if (backgroundCss) {
    return `.${scopeClass} {\n  min-height: 100vh;\n  ${backgroundCss}\n}\n${keyframes}`;
  }

  const fallback = resolveTemplateBackgroundColor(config);
  if (fallback && fallback !== "transparent") {
    return `.${scopeClass} {\n  min-height: 100vh;\n  background-color: ${fallback} !important;\n}`;
  }

  return "";
}
