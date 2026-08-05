import type { StorefrontChrome } from "@/lib/templates/storefront-chrome";
import { TRIUMPH_CHROME_DEFAULTS } from "@/lib/templates/storefront-chrome";

export type ChromePresetId = "triumph" | "minimal" | "editorial";

export interface ChromePreset {
  id: ChromePresetId;
  label: string;
  description: string;
  chrome: StorefrontChrome;
}

/** Reusable storefront chrome structures — compose into theme specs. */
export const CHROME_PRESETS: Record<ChromePresetId, ChromePreset> = {
  triumph: {
    id: "triumph",
    label: "Triumph Sport",
    description: "Utility bar, countdown, nav, sub-nav, carousel hero, dual CTAs",
    chrome: TRIUMPH_CHROME_DEFAULTS,
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    description: "No chrome layer — classic vendor bar + sections only",
    chrome: { enabled: false },
  },
  editorial: {
    id: "editorial",
    label: "Editorial header",
    description: "Light nav chrome without utility bar or countdown",
    chrome: {
      enabled: true,
      features: {
        showUtilityBar: false,
        showCountdown: false,
        showSubNav: false,
        heroCarouselPeek: false,
        dualCta: false,
      },
      colors: {
        navBarBg: "#FBFAF8",
        subNavBg: "#F2F2F0",
        heroPanelMain: "#1C1B19",
        heroText: "#FFFFFF",
        sectionLabelText: "#1C1B19",
        bodyTextMuted: "#6F6A61",
      },
      typography: {
        wordmark: {
          font: '"Cormorant Garamond", serif',
          color: "#1C1B19",
          fontWeight: "600",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        },
        navLinks: {
          font: "Jost, sans-serif",
          color: "#1C1B19",
          fontWeight: "500",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        },
      },
      layout: {
        navHeight: "64px",
        heroHeight: "520px",
      },
    },
  },
};

/** Apply a chrome preset with optional content/color overrides. */
export function applyChromePreset(
  presetId: ChromePresetId,
  overrides?: Partial<StorefrontChrome>,
): StorefrontChrome {
  const preset = CHROME_PRESETS[presetId].chrome;
  return {
    ...preset,
    ...overrides,
    colors: { ...preset.colors, ...overrides?.colors },
    typography: { ...preset.typography, ...overrides?.typography },
    layout: { ...preset.layout, ...overrides?.layout },
    features: { ...preset.features, ...overrides?.features },
    content: { ...preset.content, ...overrides?.content },
  };
}
