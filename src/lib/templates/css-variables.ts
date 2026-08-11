import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";

import { buildDistinctGradientValue } from "./build-background-style-for-type";

/**
 * Generate CSS custom properties from template configuration
 * Merges vendor customizations with template defaults
 */
export function generateCSSVariables(
  templateConfig: TemplateConfig | any
): Record<string, string> {
  const variables: Record<string, string> = {};

  // Colors (mergedConfig already has customizations applied)
  const colors = templateConfig.colors ?? {};
  variables["--template-primary"] = colors.primary || "#000000";
  variables["--template-secondary"] = colors.secondary || "#666666";
  variables["--template-accent"] = colors.accent || "#000000";
  const backgroundStyleType = templateConfig.backgroundStyle?.type;
  variables["--template-background"] =
    backgroundStyleType === "solid" && templateConfig.backgroundStyle?.value
      ? templateConfig.backgroundStyle.value
      : backgroundStyleType === "mesh-gradient" ||
          backgroundStyleType === "gradient" ||
          backgroundStyleType === "pattern" ||
          backgroundStyleType === "image"
        ? "transparent"
        : colors.background && colors.background !== "transparent"
          ? colors.background
          : colors.cardBackground || "#FFFFFF";
  variables["--template-text"] = colors.text || "#1A1A1A";
  variables["--template-text-secondary"] = templateConfig.colors?.textSecondary || "#666666";
  variables["--template-border"] = templateConfig.colors?.border || "#E5E5E5";
  variables["--template-card-bg"] = templateConfig.colors?.cardBackground || "#FFFFFF";

  // Fonts
  variables["--template-font-heading"] = templateConfig.fonts?.heading || "Inter, system-ui, sans-serif";
  variables["--template-font-body"] = templateConfig.fonts?.body || "Inter, system-ui, sans-serif";

  // Spacing
  variables["--template-spacing-section"] = templateConfig.spacing?.sectionPadding || "80px 0";
  variables["--template-spacing-card-gap"] = templateConfig.spacing?.cardGap || "24px";
  variables["--template-container-width"] = templateConfig.spacing?.containerMaxWidth || "1200px";

  // Component-specific
  variables["--template-card-radius"] = templateConfig.components?.productCard?.borderRadius || "8px";
  variables["--template-banner-height"] = templateConfig.components?.heroBanner?.height || "400px";

  // Text Styles
  const textStyles = templateConfig.textStyles || {};
  if (textStyles.heading1) {
    variables["--template-h1-size"] = textStyles.heading1.fontSize || "2.5rem";
    variables["--template-h1-weight"] = textStyles.heading1.fontWeight || "700";
    variables["--template-h1-spacing"] = textStyles.heading1.letterSpacing || "0";
    variables["--template-h1-height"] = textStyles.heading1.lineHeight || "1.2";
    variables["--template-h1-transform"] = textStyles.heading1.textTransform || "none";
  }
  if (textStyles.heading2) {
    variables["--template-h2-size"] = textStyles.heading2.fontSize || "2rem";
    variables["--template-h2-weight"] = textStyles.heading2.fontWeight || "600";
    variables["--template-h2-spacing"] = textStyles.heading2.letterSpacing || "0";
    variables["--template-h2-height"] = textStyles.heading2.lineHeight || "1.3";
    variables["--template-h2-transform"] = textStyles.heading2.textTransform || "none";
  }
  if (textStyles.body) {
    variables["--template-body-size"] = textStyles.body.fontSize || "1rem";
    variables["--template-body-weight"] = textStyles.body.fontWeight || "400";
    variables["--template-body-spacing"] = textStyles.body.letterSpacing || "0";
    variables["--template-body-height"] = textStyles.body.lineHeight || "1.6";
  }
  if (textStyles.heroBanner) {
    variables["--template-hero-title-size"] = textStyles.heroBanner.titleSize || "3rem";
    variables["--template-hero-title-weight"] = textStyles.heroBanner.titleWeight || "700";
    variables["--template-hero-subtitle-size"] = textStyles.heroBanner.subtitleSize || "1.5rem";
    variables["--template-hero-subtitle-weight"] = textStyles.heroBanner.subtitleWeight || "400";
    variables["--template-hero-text-shadow"] = textStyles.heroBanner.textShadow || "2px 2px 4px rgba(0, 0, 0, 0.5)";
  }

  return variables;
}

/**
 * Map default template tokens onto marketplace :root variables so existing
 * Tailwind/shadcn classes (bg-background, text-primary, etc.) inherit the
 * site-wide default template without restructuring page layouts.
 */
export function generateSiteRootCSSVariables(
  templateConfig: TemplateConfig | Record<string, unknown>
): Record<string, string> {
  const templateVars = generateCSSVariables(templateConfig);
  const colors = (templateConfig as TemplateConfig).colors ?? {};

  const background =
    colors.background === "transparent" || !colors.background
      ? colors.cardBackground || "#FFFFFF"
      : colors.background;

  return {
    ...templateVars,
    "--background": background,
    "--foreground": colors.text || "#1A1A1A",
    "--card": colors.cardBackground || "#FFFFFF",
    "--card-foreground": colors.text || "#1A1A1A",
    "--popover": colors.cardBackground || "#FFFFFF",
    "--popover-foreground": colors.text || "#1A1A1A",
    "--primary": colors.primary || "#000000",
    "--primary-foreground": "#FFFFFF",
    "--secondary": colors.secondary || "#666666",
    "--secondary-foreground": "#FFFFFF",
    "--muted": colors.cardBackground || "#F5F5F5",
    "--muted-foreground": colors.textSecondary || "#666666",
    "--accent": colors.accent || colors.primary || "#000000",
    "--accent-foreground": colors.text || "#1A1A1A",
    "--border": colors.border || "#E5E5E5",
    "--ring": colors.primary || colors.border || "#000000",
  };
}

/**
 * Convert CSS variables object to CSS string
 */
export function cssVariablesToString(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ");
}

/**
 * Generate inline style object from CSS variables
 */
export function cssVariablesToStyle(variables: Record<string, string>): React.CSSProperties {
  return variables as React.CSSProperties;
}

/**
 * Generate background CSS from template backgroundStyle configuration
 */
export function generateBackgroundCSS(
  backgroundStyle: any,
  cssVariables: Record<string, string>
): string {
  if (!backgroundStyle || !backgroundStyle.type) {
    return "";
  }

  const primary = cssVariables["--template-primary"] || "#000000";
  const secondary = cssVariables["--template-secondary"] || "#666666";
  const accent = cssVariables["--template-accent"] || "#000000";

  switch (backgroundStyle.type) {
    case "mesh-gradient": {
      const animation = backgroundStyle.animation;
      const duration = animation?.duration || "15s";
      const easing = animation?.easing || "ease";
      const animationEnabled = animation?.enabled !== false;

      let css = `background-color: var(--template-primary) !important;
background-image:
  radial-gradient(at 18% 12%, color-mix(in srgb, var(--template-accent) 70%, transparent) 0px, transparent 52%),
  radial-gradient(at 82% 8%, color-mix(in srgb, var(--template-secondary) 75%, transparent) 0px, transparent 55%),
  radial-gradient(at 88% 88%, color-mix(in srgb, var(--template-primary) 80%, transparent) 0px, transparent 50%),
  radial-gradient(at 8% 92%, color-mix(in srgb, var(--template-accent) 65%, transparent) 0px, transparent 54%) !important;
background-attachment: fixed;
background-size: 160% 160%;
background-repeat: no-repeat;`;

      if (animationEnabled) {
        css += `
animation: gradientMove ${duration} ${easing} infinite;`;
      }

      return css;
    }

    case "gradient": {
      const fallback = buildDistinctGradientValue(primary, secondary, accent);
      const value =
        backgroundStyle.value && /gradient\s*\(/i.test(backgroundStyle.value)
          ? backgroundStyle.value
          : fallback;
      return `background-color: color-mix(in srgb, ${primary} 12%, white) !important;
background-image: ${value} !important;
background-repeat: no-repeat !important;
background-attachment: fixed !important;
background-size: 100% 100% !important;
animation: none !important;`;
    }

    case "solid": {
      const value = backgroundStyle.value || primary;
      return `background-color: ${value} !important;
background-image: none !important;
animation: none !important;`;
    }

    case "pattern": {
      const value = backgroundStyle.value || "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)";
      return `background: ${value} !important;`;
    }

    case "image": {
      const value = backgroundStyle.value || "";
      if (!value) return "";
      return `background-image: url(${value}) !important; background-size: cover; background-position: center;`;
    }

    default:
      return "";
  }
}

/**
 * Generate background animation keyframes CSS
 */
export function generateBackgroundKeyframes(backgroundStyle: any): string {
  if (!backgroundStyle || backgroundStyle.type !== "mesh-gradient") {
    return "";
  }

  const animation = backgroundStyle.animation;
  if (animation?.enabled === false) {
    return "";
  }

  return `
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;
}
