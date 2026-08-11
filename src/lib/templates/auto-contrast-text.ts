/** Relative luminance for sRGB hex colors (WCAG). */
function getLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return 0.5;

  const channels = [0, 2, 4].map((start) => {
    const value = Number.parseInt(normalized.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

/** Pick readable body text for a given background hex. */
export function getContrastTextColor(backgroundHex: string, fallback = "#1A1A1A"): string {
  if (!backgroundHex.startsWith("#") || backgroundHex.length < 4) {
    return fallback;
  }

  return getLuminance(backgroundHex) > 0.55 ? "#1A1A1A" : "#FFFFFF";
}

/** Derive secondary text from primary text color. */
export function getSecondaryTextColor(textHex: string): string {
  return textHex === "#FFFFFF" ? "rgba(255, 255, 255, 0.75)" : "#6B7280";
}
