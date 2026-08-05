/**
 * Global storefront CSS injected by template-driven layouts.
 *
 * Without a config argument this reproduces the original DefaultLayout style
 * block (animated mesh gradient + glass cards) so legacy themes are unchanged.
 * With a config, the background, card treatment and motion are driven by the
 * theme's `backgroundStyle` and design tokens — which is what lets a quiet,
 * editorial theme render quietly instead of inheriting the vibrant default.
 */

import { generateBackgroundCSS, generateBackgroundKeyframes } from "@/lib/templates/css-variables";
import type { TemplateConfig } from "@/types/template-customization";

type StyleConfig = Pick<TemplateConfig, "backgroundStyle" | "tokens">;

const LEGACY_BACKGROUND = `
      background-color: var(--template-primary, #FF6B9D) !important;
      background-image:
        radial-gradient(at 0% 0%, var(--template-secondary, #C44569) 0px, transparent 50%),
        radial-gradient(at 100% 0%, var(--template-accent, #FFD93D) 0px, transparent 50%),
        radial-gradient(at 100% 100%, var(--template-primary, #FF6B9D) 0px, transparent 50%),
        radial-gradient(at 0% 100%, var(--template-secondary, #C44569) 0px, transparent 50%);
      background-attachment: fixed;
      background-size: 200% 200%;
      background-position: 0% 50%;
      animation: gradientMove 15s ease infinite;`;

const LEGACY_KEYFRAMES = `
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      25% { background-position: 100% 0%; }
      50% { background-position: 100% 100%; }
      75% { background-position: 0% 100%; }
      100% { background-position: 0% 50%; }
    }`;

const CARD_SELECTOR = `.vendor-page-template [class*="card"],
    .vendor-page-template .vendor-info-header,
    .vendor-page-template a[href*="/products/"] > div`;

const GLASS_CARD = `background-color: rgba(255, 255, 255, 0.9) !important;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15) !important;
      border-radius: var(--template-card-radius, 8px) !important;`;

const SHADOWS: Record<string, string> = {
  none: "none",
  soft: "0 1px 2px rgba(16, 24, 40, 0.06), 0 4px 12px rgba(16, 24, 40, 0.06)",
  elevated: "0 4px 8px rgba(16, 24, 40, 0.08), 0 16px 40px rgba(16, 24, 40, 0.12)",
};

function buildCardStyles(config: StyleConfig): string {
  const treatment = config.tokens?.surface?.cardTreatment ?? "elevated";
  const shadow = SHADOWS[config.tokens?.shape?.shadowScale ?? "soft"] ?? SHADOWS.soft;

  if (treatment === "glass") {
    return GLASS_CARD;
  }

  const border =
    treatment === "flat"
      ? "border: none !important;"
      : `border: var(--template-border-width, 1px) solid var(--template-border) !important;`;

  return `background-color: var(--template-card-bg) !important;
      ${border}
      box-shadow: ${treatment === "elevated" ? shadow : "none"} !important;
      border-radius: var(--template-card-radius, 8px) !important;`;
}

function buildMotionStyles(config: StyleConfig): string {
  const motion = config.tokens?.motion ?? "subtle";

  if (motion === "none") {
    return `.vendor-page-template a[href*="/products/"] > div {
      transition: none;
    }`;
  }

  const lift = motion === "expressive" ? "translateY(-4px)" : "translateY(-2px)";

  return `.vendor-page-template a[href*="/products/"] > div {
      transition: transform var(--template-motion-duration, 200ms) ease,
                  box-shadow var(--template-motion-duration, 200ms) ease;
    }
    .vendor-page-template a[href*="/products/"]:hover > div {
      transform: ${lift};
    }
    .vendor-page-template button {
      transition: background-color var(--template-motion-duration, 200ms) ease,
                  opacity var(--template-motion-duration, 200ms) ease;
    }`;
}

export function buildTemplateGlobalStyles(cssVariables: string, config?: StyleConfig): string {
  const backgroundCSS = config
    ? generateBackgroundCSS(config.backgroundStyle, {}) ||
      "background-color: var(--template-background) !important;"
    : LEGACY_BACKGROUND;

  const keyframes = config ? generateBackgroundKeyframes(config.backgroundStyle) : LEGACY_KEYFRAMES;

  const cardStyles = config ? buildCardStyles(config) : GLASS_CARD;

  const motionStyles = config
    ? buildMotionStyles(config)
    : `.vendor-page-template button[class*="bg-"] {
      background-color: var(--template-primary) !important;
      filter: saturate(1.5);
      transition: transform 0.2s ease;
    }

    .vendor-page-template button[class*="bg-"]:hover {
      transform: scale(1.05);
    }`;

  return `
    ${cssVariables ? `:root {
      ${cssVariables}
    }` : ''}

    .vendor-page-template {
      ${backgroundCSS}
    }

    ${keyframes}

    /* Sections own their own surfaces — the page background shows through */
    .vendor-main-container {
      background: transparent !important;
    }

    ${CARD_SELECTOR} {
      ${cardStyles}
    }

    /* Override ProductsList wrapper background */
    .vendor-page-template .bg-gray-50 {
      background: transparent !important;
    }

    ${motionStyles}

    /* Apply template styles to all elements on vendor page */
    .vendor-page-template * {
      font-family: var(--template-font-body) !important;
    }
    .vendor-page-template h1 {
      font-family: var(--template-font-heading) !important;
      color: var(--template-text) !important;
      font-size: var(--template-h1-size, 2.5rem) !important;
      font-weight: var(--template-h1-weight, 700) !important;
      letter-spacing: var(--template-h1-spacing, 0) !important;
      line-height: var(--template-h1-height, 1.2) !important;
      text-transform: var(--template-h1-transform, none) !important;
    }
    .vendor-page-template h2 {
      font-family: var(--template-font-heading) !important;
      color: var(--template-text) !important;
      font-size: var(--template-h2-size, 2rem) !important;
      font-weight: var(--template-h2-weight, 600) !important;
      letter-spacing: var(--template-h2-spacing, 0) !important;
      line-height: var(--template-h2-height, 1.3) !important;
      text-transform: var(--template-h2-transform, none) !important;
    }
    .vendor-page-template h3,
    .vendor-page-template h4,
    .vendor-page-template h5,
    .vendor-page-template h6 {
      font-family: var(--template-font-heading) !important;
      color: var(--template-text) !important;
    }
    .vendor-page-template p,
    .vendor-page-template span,
    .vendor-page-template div {
      font-size: var(--template-body-size, 1rem) !important;
      font-weight: var(--template-body-weight, 400) !important;
      letter-spacing: var(--template-body-spacing, 0) !important;
      line-height: var(--template-body-height, 1.6) !important;
    }

    /* Hero banner text must stay white and legible over imagery */
    .vendor-page-template [class*="hero"] h1,
    .vendor-page-template [class*="banner"] h1 {
      color: white !important;
      font-size: var(--template-hero-title-size, 3rem) !important;
      font-weight: var(--template-hero-title-weight, 700) !important;
      text-shadow: var(--template-hero-text-shadow, 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5)) !important;
    }
    .vendor-page-template [class*="hero"] h2,
    .vendor-page-template [class*="hero"] p,
    .vendor-page-template [class*="banner"] h2,
    .vendor-page-template [class*="banner"] p,
    .vendor-page-template [class*="text-white"] {
      color: white !important;
      font-size: var(--template-hero-subtitle-size, 1.5rem) !important;
      font-weight: var(--template-hero-subtitle-weight, 400) !important;
      text-shadow: var(--template-hero-text-shadow, 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5)) !important;
    }
    .vendor-page-template a {
      color: var(--template-primary) !important;
    }
    .vendor-page-template a:hover {
      color: var(--template-secondary) !important;
    }
    .vendor-page-template [class*="text-gray"] {
      color: var(--template-text-secondary) !important;
    }
  `;
}
