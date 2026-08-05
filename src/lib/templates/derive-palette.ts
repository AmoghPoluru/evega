/**
 * Derive a full accessible color palette from a small set of seed colors.
 * Uses relative luminance (WCAG) to pick readable foregrounds.
 */

export type ContrastIntent = "light" | "dark" | "high-contrast";

export interface SeedColors {
  primary: string;
  secondary?: string;
  accent?: string;
  background?: string;
}

export interface DerivedPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  cardBackground: string;
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0] + normalized[0], 16),
      g: parseInt(normalized[1] + normalized[1], 16),
      b: parseInt(normalized[2] + normalized[2], 16),
    };
  }
  if (normalized.length === 6) {
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function pickForeground(backgroundHex: string): string {
  const bg = parseHex(backgroundHex);
  if (!bg) return "#1A1A1A";
  const bgLum = relativeLuminance(bg.r, bg.g, bg.b);
  const whiteLum = relativeLuminance(255, 255, 255);
  const blackLum = relativeLuminance(26, 26, 26);
  const whiteContrast = contrastRatio(bgLum, whiteLum);
  const blackContrast = contrastRatio(bgLum, blackLum);
  return whiteContrast >= blackContrast ? "#FFFFFF" : "#1A1A1A";
}

function mixHex(a: string, b: string, weight: number): string {
  const c1 = parseHex(a);
  const c2 = parseHex(b);
  if (!c1 || !c2) return a;
  const w = Math.min(1, Math.max(0, weight));
  return rgbToHex(
    Math.round(c1.r * (1 - w) + c2.r * w),
    Math.round(c1.g * (1 - w) + c2.g * w),
    Math.round(c1.b * (1 - w) + c2.b * w),
  );
}

function darken(hex: string, amount: number): string {
  return mixHex(hex, "#000000", amount);
}

function lighten(hex: string, amount: number): string {
  return mixHex(hex, "#FFFFFF", amount);
}

/** Derive semantic palette colors from 1–3 seed hex values. */
export function derivePalette(
  seeds: SeedColors,
  intent: ContrastIntent = "light",
): DerivedPalette {
  const primary = seeds.primary;
  const secondary = seeds.secondary ?? darken(primary, 0.25);
  const accent = seeds.accent ?? lighten(primary, 0.15);

  let background = seeds.background ?? "#FFFFFF";
  if (background === "transparent") {
    background = intent === "dark" ? "#0A0A0A" : "#FFFFFF";
  }
  if (intent === "dark") {
    background = darken(background, 0.85);
  }

  const text = pickForeground(background);
  const textSecondary =
    text === "#FFFFFF" ? mixHex(text, background, 0.35) : darken(text, 0.35);
  const border = text === "#FFFFFF" ? mixHex(background, "#FFFFFF", 0.2) : lighten(background, 0.12);
  const cardBackground =
    intent === "dark"
      ? lighten(background, 0.08)
      : text === "#FFFFFF"
        ? "rgba(255, 255, 255, 0.12)"
        : "#FFFFFF";

  if (intent === "high-contrast") {
    return {
      primary,
      secondary,
      accent,
      background: text === "#FFFFFF" ? "#000000" : "#FFFFFF",
      text: text === "#FFFFFF" ? "#FFFFFF" : "#000000",
      textSecondary: text === "#FFFFFF" ? "#E5E5E5" : "#333333",
      border: text === "#FFFFFF" ? "#FFFFFF" : "#000000",
      cardBackground: text === "#FFFFFF" ? "#111111" : "#FFFFFF",
    };
  }

  return {
    primary,
    secondary,
    accent,
    background,
    text,
    textSecondary,
    border,
    cardBackground,
  };
}

/** Merge vendor color overrides with derived fallbacks for any missing keys. */
export function mergeWithDerivedPalette(
  seeds: SeedColors,
  overrides: Partial<DerivedPalette> = {},
  intent: ContrastIntent = "light",
): DerivedPalette {
  return { ...derivePalette(seeds, intent), ...overrides };
}
