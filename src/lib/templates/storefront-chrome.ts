import { z } from "zod";
import type { CSSProperties } from "react";

const optionalString = z.preprocess(
  (val) => (val === null || val === "" ? undefined : val),
  z.string().optional(),
);

export const chromeTypographyRoleSchema = z.object({
  font: optionalString,
  color: optionalString,
  fontWeight: optionalString,
  letterSpacing: optionalString,
  textTransform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
  /** CSS skew for faux-italic display headlines, e.g. "-8deg". */
  skew: optionalString,
});

export const storefrontChromeSchema = z.object({
  enabled: z.boolean().optional(),
  colors: z
    .object({
      utilityBarBg: optionalString,
      utilityBarText: optionalString,
      navBarBg: optionalString,
      subNavBg: optionalString,
      heroPanelLeft: optionalString,
      heroPanelMain: optionalString,
      heroAccent: optionalString,
      heroText: optionalString,
      primaryButtonFill: optionalString,
      primaryButtonText: optionalString,
      secondaryButtonBorder: optionalString,
      sectionLabelText: optionalString,
      bodyTextMuted: optionalString,
    })
    .optional(),
  typography: z
    .object({
      wordmark: chromeTypographyRoleSchema.optional(),
      heroHeadline: chromeTypographyRoleSchema.optional(),
      sectionHeadline: chromeTypographyRoleSchema.optional(),
      navLinks: chromeTypographyRoleSchema.optional(),
      body: chromeTypographyRoleSchema.optional(),
      smallLabels: chromeTypographyRoleSchema.optional(),
    })
    .optional(),
  layout: z
    .object({
      utilityBarHeight: optionalString,
      navHeight: optionalString,
      subNavHeight: optionalString,
      heroHeight: optionalString,
      heroContentPadding: optionalString,
      heroHeadlineSize: optionalString,
      buttonBorderRadius: optionalString,
      buttonPadding: optionalString,
      sectionLabelSize: optionalString,
      sectionHeadlineSize: optionalString,
      carouselPeekWidth: optionalString,
      countdownBoxSize: optionalString,
      countdownGap: optionalString,
    })
    .optional(),
  features: z
    .object({
      showUtilityBar: z.boolean().optional(),
      showCountdown: z.boolean().optional(),
      showSubNav: z.boolean().optional(),
      heroCarouselPeek: z.boolean().optional(),
      dualCta: z.boolean().optional(),
    })
    .optional(),
  content: z
    .object({
      wordmark: optionalString,
      utilityMessage: optionalString,
      navLinks: z.array(z.string()).optional(),
      subNavCategories: z.array(z.string()).optional(),
      heroHeadline: optionalString,
      heroSubtext: optionalString,
      heroLabel: optionalString,
      primaryCta: optionalString,
      secondaryCta: optionalString,
      sectionLabel: optionalString,
      sectionHeadline: optionalString,
    })
    .optional(),
});

export type StorefrontChrome = z.infer<typeof storefrontChromeSchema>;
export type ChromeTypographyRole = z.infer<typeof chromeTypographyRoleSchema>;

/** Triumph sportswear reference values — editable in the builder. */
export const TRIUMPH_CHROME_DEFAULTS: StorefrontChrome = {
  enabled: true,
  colors: {
    utilityBarBg: "#171717",
    utilityBarText: "#FFFFFF",
    navBarBg: "#FFFFFF",
    subNavBg: "#F2F2F0",
    heroPanelLeft: "#4B3F7A",
    heroPanelMain: "#CE7A50",
    heroAccent: "#A87FE0",
    heroText: "#FFFFFF",
    primaryButtonFill: "#FFFFFF",
    primaryButtonText: "#171717",
    secondaryButtonBorder: "#FFFFFF",
    sectionLabelText: "#171717",
    bodyTextMuted: "#6B6B68",
  },
  typography: {
    wordmark: {
      font: '"Archivo Black", sans-serif',
      color: "#171717",
      fontWeight: "900",
      letterSpacing: "-0.02em",
      textTransform: "uppercase",
      skew: "-4deg",
    },
    heroHeadline: {
      font: "Anton, sans-serif",
      color: "#FFFFFF",
      fontWeight: "400",
      letterSpacing: "0.02em",
      textTransform: "uppercase",
      skew: "-8deg",
    },
    sectionHeadline: {
      font: "Anton, sans-serif",
      color: "#171717",
      fontWeight: "400",
      letterSpacing: "0.02em",
      textTransform: "uppercase",
      skew: "-8deg",
    },
    navLinks: {
      font: "Archivo, sans-serif",
      color: "#171717",
      fontWeight: "600",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    },
    body: {
      font: "Inter, sans-serif",
      color: "#6B6B68",
      fontWeight: "400",
    },
    smallLabels: {
      font: "Inter, sans-serif",
      color: "#FFFFFF",
      fontWeight: "400",
      letterSpacing: "2px",
      textTransform: "uppercase",
    },
  },
  layout: {
    utilityBarHeight: "40px",
    navHeight: "72px",
    subNavHeight: "48px",
    heroHeight: "660px",
    heroContentPadding: "64px",
    heroHeadlineSize: "68px",
    buttonBorderRadius: "999px",
    buttonPadding: "14px 28px",
    sectionLabelSize: "13px",
    sectionHeadlineSize: "40px",
    carouselPeekWidth: "8%",
    countdownBoxSize: "40px",
    countdownGap: "4px",
  },
  features: {
    showUtilityBar: true,
    showCountdown: true,
    showSubNav: true,
    heroCarouselPeek: true,
    dualCta: true,
  },
  content: {
    wordmark: "TRIUMPH",
    utilityMessage: "Free shipping on orders over ₹999",
    navLinks: ["WOMEN", "MEN", "KIDS"],
    subNavCategories: ["CLOTHING", "SHOES", "ACCESSORIES", "SALE"],
    heroHeadline: "MOVE WITH CONFIDENCE",
    heroSubtext: "Performance activewear built for every goal — from studio to street.",
    heroLabel: "SPORTSWEAR STORE",
    primaryCta: "Shop new collection",
    secondaryCta: "Explore best sellers",
    sectionLabel: "POPULAR CATEGORIES",
    sectionHeadline: "ACTIVEWEAR FOR EVERY GOAL",
  },
};

function omitNullish<T extends Record<string, unknown>>(value: T | null | undefined): Partial<T> {
  if (!value) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== null && entry !== undefined),
  ) as Partial<T>;
}

function mergeNested<T extends Record<string, unknown>>(
  base: T | undefined,
  override: T | undefined,
): T | undefined {
  const merged = { ...omitNullish(base), ...omitNullish(override) } as T;
  return Object.keys(merged).length > 0 ? merged : undefined;
}

/** Deep-merge chrome config from base template and builder overrides. */
export function mergeStorefrontChrome(
  base: StorefrontChrome | undefined,
  override: StorefrontChrome | undefined,
): StorefrontChrome | undefined {
  if (!base && !override) return undefined;

  return {
    enabled: override?.enabled ?? base?.enabled,
    colors: mergeNested(base?.colors, override?.colors),
    typography: {
      wordmark: mergeNested(base?.typography?.wordmark, override?.typography?.wordmark),
      heroHeadline: mergeNested(base?.typography?.heroHeadline, override?.typography?.heroHeadline),
      sectionHeadline: mergeNested(
        base?.typography?.sectionHeadline,
        override?.typography?.sectionHeadline,
      ),
      navLinks: mergeNested(base?.typography?.navLinks, override?.typography?.navLinks),
      body: mergeNested(base?.typography?.body, override?.typography?.body),
      smallLabels: mergeNested(base?.typography?.smallLabels, override?.typography?.smallLabels),
    },
    layout: mergeNested(base?.layout, override?.layout),
    features: mergeNested(base?.features, override?.features),
    content: mergeNested(base?.content, override?.content),
  };
}

export function resolveStorefrontChrome(
  config: { chrome?: StorefrontChrome | null } | undefined,
): StorefrontChrome {
  if (!config?.chrome) {
    return { enabled: false };
  }

  return mergeStorefrontChrome(TRIUMPH_CHROME_DEFAULTS, config.chrome) ?? { enabled: false };
}

export function chromeTypographyStyle(
  role: ChromeTypographyRole | undefined,
  fallbackFont: string,
  fallbackColor: string,
): CSSProperties {
  if (!role) {
    return { fontFamily: fallbackFont, color: fallbackColor };
  }

  const style: CSSProperties = {
    fontFamily: role.font ?? fallbackFont,
    color: role.color ?? fallbackColor,
    fontWeight: role.fontWeight,
    letterSpacing: role.letterSpacing,
    textTransform: role.textTransform,
  };

  if (role.skew) {
    style.transform = `skewX(${role.skew})`;
    style.display = "inline-block";
  }

  return style;
}

/** Map chrome tokens to CSS custom properties consumed by storefront components. */
export function applyChromeCSSVariables(chrome: StorefrontChrome): Record<string, string> {
  const c = resolveStorefrontChrome({ chrome });
  const colors = c.colors ?? {};
  const layout = c.layout ?? {};

  const vars: Record<string, string> = {
    "--chrome-utility-bg": colors.utilityBarBg ?? "#171717",
    "--chrome-utility-text": colors.utilityBarText ?? "#FFFFFF",
    "--chrome-nav-bg": colors.navBarBg ?? "#FFFFFF",
    "--chrome-subnav-bg": colors.subNavBg ?? "#F2F2F0",
    "--chrome-hero-panel-left": colors.heroPanelLeft ?? "#4B3F7A",
    "--chrome-hero-panel-main": colors.heroPanelMain ?? "#CE7A50",
    "--chrome-hero-accent": colors.heroAccent ?? "#A87FE0",
    "--chrome-hero-text": colors.heroText ?? "#FFFFFF",
    "--chrome-btn-primary-bg": colors.primaryButtonFill ?? "#FFFFFF",
    "--chrome-btn-primary-text": colors.primaryButtonText ?? "#171717",
    "--chrome-btn-secondary-border": colors.secondaryButtonBorder ?? "#FFFFFF",
    "--chrome-section-label": colors.sectionLabelText ?? "#171717",
    "--chrome-body-muted": colors.bodyTextMuted ?? "#6B6B68",
    "--chrome-utility-height": layout.utilityBarHeight ?? "40px",
    "--chrome-nav-height": layout.navHeight ?? "72px",
    "--chrome-subnav-height": layout.subNavHeight ?? "48px",
    "--chrome-hero-height": layout.heroHeight ?? "660px",
    "--chrome-hero-padding": layout.heroContentPadding ?? "64px",
    "--chrome-hero-headline-size": layout.heroHeadlineSize ?? "68px",
    "--chrome-btn-radius": layout.buttonBorderRadius ?? "999px",
    "--chrome-btn-padding": layout.buttonPadding ?? "14px 28px",
    "--chrome-section-label-size": layout.sectionLabelSize ?? "13px",
    "--chrome-section-headline-size": layout.sectionHeadlineSize ?? "40px",
    "--chrome-carousel-peek": layout.carouselPeekWidth ?? "8%",
    "--chrome-countdown-size": layout.countdownBoxSize ?? "40px",
    "--chrome-countdown-gap": layout.countdownGap ?? "4px",
  };

  const typo = c.typography ?? {};
  const typoRoles = [
    ["wordmark", typo.wordmark],
    ["hero-headline", typo.heroHeadline],
    ["section-headline", typo.sectionHeadline],
    ["nav-links", typo.navLinks],
    ["body", typo.body],
    ["small-labels", typo.smallLabels],
  ] as const;

  for (const [key, role] of typoRoles) {
    if (!role) continue;
    if (role.font) vars[`--chrome-font-${key}`] = role.font;
    if (role.color) vars[`--chrome-color-${key}`] = role.color;
    if (role.fontWeight) vars[`--chrome-weight-${key}`] = role.fontWeight;
    if (role.letterSpacing) vars[`--chrome-spacing-${key}`] = role.letterSpacing;
    if (role.textTransform) vars[`--chrome-transform-${key}`] = role.textTransform;
    if (role.skew) vars[`--chrome-skew-${key}`] = role.skew;
  }

  return vars;
}

export { storefrontChromeSchema as chromeSchemaForExport };
