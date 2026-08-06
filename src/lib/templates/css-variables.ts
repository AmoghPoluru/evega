import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";
import { mergeWithDerivedPalette, type ContrastIntent } from "./derive-palette";
import {
  normalizeBackgroundStyleType,
  resolveBackgroundTreatment,
} from "./background-style-treatments";
import { applyChromeCSSVariables, resolveStorefrontChrome } from "./storefront-chrome";

const RHYTHM_SECTION: Record<string, string> = {
  compact: "48px 0",
  normal: "80px 0",
  airy: "120px 0",
};

const RHYTHM_GAP: Record<string, string> = {
  compact: "16px",
  normal: "24px",
  airy: "40px",
};

const SHAPE_RADIUS: Record<string, string> = {
  sharp: "0px",
  soft: "8px",
  pill: "999px",
};

const MOTION_DURATION: Record<string, string> = {
  none: "0ms",
  subtle: "200ms",
  expressive: "400ms",
};

function resolveContrastIntent(templateConfig: TemplateConfig | Record<string, unknown>): ContrastIntent {
  const tokens = (templateConfig as TemplateConfig).tokens;
  return tokens?.contrast ?? "light";
}

/**
 * Generate CSS custom properties from template configuration.
 * Merges vendor customizations with template defaults and expanded design tokens.
 */
export function generateCSSVariables(
  templateConfig: TemplateConfig | Record<string, unknown>
): Record<string, string> {
  const config = templateConfig as TemplateConfig;
  const variables: Record<string, string> = {};
  const intent = resolveContrastIntent(config);
  const tokens = config.tokens;

  const derived = mergeWithDerivedPalette(
    {
      primary: config.colors?.primary ?? "#000000",
      secondary: config.colors?.secondary,
      accent: config.colors?.accent,
      background: config.colors?.background,
    },
    config.colors ?? {},
    intent,
  );

  variables["--template-primary"] = derived.primary;
  variables["--template-secondary"] = derived.secondary;
  variables["--template-accent"] = derived.accent;
  variables["--template-background"] = derived.background;
  variables["--template-text"] = derived.text;
  variables["--template-text-secondary"] = derived.textSecondary;
  variables["--template-border"] = derived.border;
  variables["--template-card-bg"] = derived.cardBackground;

  // Fonts
  variables["--template-font-heading"] = config.fonts?.heading || "Inter, system-ui, sans-serif";
  variables["--template-font-body"] = config.fonts?.body || "Inter, system-ui, sans-serif";
  variables["--template-font-vendor"] =
    config.typography?.vendor?.font || config.fonts?.heading || "Inter, system-ui, sans-serif";
  variables["--template-font-hero"] =
    config.typography?.hero?.font || config.fonts?.heading || "Inter, system-ui, sans-serif";
  variables["--template-font-product"] =
    config.typography?.product?.font || config.fonts?.heading || "Inter, system-ui, sans-serif";
  variables["--template-font-price"] =
    config.typography?.price?.font || config.fonts?.body || "Inter, system-ui, sans-serif";

  variables["--template-color-vendor"] =
    config.typography?.vendor?.color || derived.text;
  variables["--template-color-hero"] =
    config.typography?.hero?.color || derived.text;
  variables["--template-color-product"] =
    config.typography?.product?.color || derived.text;
  variables["--template-color-price"] =
    config.typography?.price?.color || derived.primary;
  variables["--template-price-background"] =
    config.typography?.price?.backgroundColor || derived.accent;

  if (tokens?.displayFont) {
    variables["--template-font-display"] = tokens.displayFont;
  }

  // Rhythm
  const rhythm = tokens?.rhythm?.section ?? "normal";
  variables["--template-spacing-section"] =
    config.spacing?.sectionPadding || RHYTHM_SECTION[rhythm] || "80px 0";
  variables["--template-spacing-card-gap"] =
    config.spacing?.cardGap || RHYTHM_GAP[tokens?.rhythm?.gap ?? "normal"] || "24px";
  variables["--template-container-width"] = config.spacing?.containerMaxWidth || "1200px";

  // Shape
  const radiusScale = tokens?.shape?.radiusScale ?? "soft";
  variables["--template-card-radius"] =
    config.components?.productCard?.borderRadius || SHAPE_RADIUS[radiusScale] || "8px";
  variables["--template-border-width"] = tokens?.shape?.borderWidth ?? "1px";
  variables["--template-shadow-scale"] = tokens?.shape?.shadowScale ?? "soft";

  // Surface
  variables["--template-card-treatment"] = tokens?.surface?.cardTreatment ?? "elevated";
  variables["--template-image-aspect"] = tokens?.surface?.imageAspect ?? "1 / 1";

  // Motion
  const motion = tokens?.motion ?? "subtle";
  variables["--template-motion-duration"] = MOTION_DURATION[motion] ?? "200ms";

  // Type scale
  if (tokens?.typeScale?.base) {
    variables["--template-type-base"] = tokens.typeScale.base;
  }
  if (tokens?.typeScale?.ratio) {
    variables["--template-type-ratio"] = tokens.typeScale.ratio;
  }

  // Product media tokens
  variables["--pm-mat"] = config.components?.productCard?.matColor ?? "var(--template-card-bg, #fafafa)";
  variables["--pm-pad"] = config.components?.productCard?.imagePadding ?? "8%";

  // Component-specific
  variables["--template-banner-height"] = config.components?.heroBanner?.height || "400px";

  // Text Styles
  const textStyles = config.textStyles || {};
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

  const chrome = resolveStorefrontChrome(config);
  if (chrome.enabled === true) {
    Object.assign(variables, applyChromeCSSVariables(chrome));
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
  backgroundStyle: TemplateConfig["backgroundStyle"] | undefined,
  cssVariables: Record<string, string>,
): string {
  if (!backgroundStyle?.type) {
    return "";
  }

  const seed =
    backgroundStyle.value ||
    cssVariables["--template-primary"] ||
    cssVariables["--template-background"] ||
    "#501313";

  const category = normalizeBackgroundStyleType(backgroundStyle.type);
  const treatment = resolveBackgroundTreatment(seed, category);

  if (category === "mesh-gradient" && backgroundStyle.animation?.enabled === false) {
    return `background-color: ${treatment.backgroundColor} !important;
background-image:
  radial-gradient(at 12% 18%, ${treatment.secondary} 0px, transparent 52%),
  radial-gradient(at 88% 12%, ${treatment.accent} 0px, transparent 48%),
  radial-gradient(at 92% 88%, ${treatment.backgroundColor} 0px, transparent 50%),
  radial-gradient(at 8% 82%, ${treatment.secondary} 0px, transparent 46%) !important;
background-attachment: fixed;
background-size: 200% 200%;`;
  }

  return treatment.pageBackgroundCss;
}

/**
 * Generate background animation keyframes CSS
 */
export function generateBackgroundKeyframes(
  backgroundStyle: TemplateConfig["backgroundStyle"] | undefined,
): string {
  if (!backgroundStyle?.type) {
    return "";
  }

  const category = normalizeBackgroundStyleType(backgroundStyle.type);
  if (category !== "mesh-gradient") {
    return "";
  }

  if (backgroundStyle.animation?.enabled === false) {
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
