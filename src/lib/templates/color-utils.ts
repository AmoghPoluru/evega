const SHORT_HEX = /^#([0-9a-fA-F]{3})$/;
const FULL_HEX = /^#([0-9a-fA-F]{6})$/;

/** Expand #RGB to #RRGGBB; returns null when invalid. */
export function normalizeHex(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();

  const shortMatch = SHORT_HEX.exec(trimmed);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1]!.split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  const fullMatch = FULL_HEX.exec(trimmed);
  if (fullMatch) {
    return `#${fullMatch[1]!.toUpperCase()}`;
  }

  return null;
}

export function isValidHex(value: string | undefined | null): boolean {
  return normalizeHex(value) !== null;
}

function channelLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance for #RRGGBB hex. */
export function getHexLuminance(hex: string): number {
  const normalized = normalizeHex(hex);
  if (!normalized) return 0.5;

  const raw = normalized.slice(1);
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);

  return (
    0.2126 * channelLinear(r) + 0.7152 * channelLinear(g) + 0.0722 * channelLinear(b)
  );
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const l1 = getHexLuminance(foregroundHex);
  const l2 = getHexLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWcagAaNormalText(foregroundHex: string, backgroundHex: string): boolean {
  return getContrastRatio(foregroundHex, backgroundHex) >= 4.5;
}

export function formatHexDisplay(hex: string | undefined | null): string {
  return normalizeHex(hex) ?? "#000000";
}

export function supportsEyeDropper(): boolean {
  return typeof window !== "undefined" && "EyeDropper" in window;
}
