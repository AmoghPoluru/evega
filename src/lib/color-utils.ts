/** Shared hex/RGB helpers for color pickers. */

function expandShortHex(hex: string): string {
  if (hex.length !== 4 || !hex.startsWith("#")) return hex;
  const [, r, g, b] = hex;
  return `#${r}${r}${g}${g}${b}${b}`;
}

/** Best-effort conversion so pickers can edit seeded rgba/transparent values. */
export function toPickerHex(value: string | undefined, fallback = "#000000"): string {
  if (!value || value === "transparent") return fallback;

  if (value.startsWith("#")) {
    return expandShortHex(value.toLowerCase());
  }

  const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    const toByte = (channel: string) => Number(channel).toString(16).padStart(2, "0");
    return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
  }

  return fallback;
}

export { expandShortHex };
