import type { FontOption } from "./template-fonts";

export interface TypographyFont extends FontOption {
  /** Sample word rendered in the picker — defaults to "Zvastra". */
  previewText?: string;
}

export interface TypographyCategory {
  id: string;
  label: string;
  fonts: TypographyFont[];
}

function gf(label: string, category: "sans-serif" | "serif" = "sans-serif"): TypographyFont {
  const googleFamily = label.replace(/ /g, "+");
  return {
    value: `"${label}", ${category}`,
    label,
    googleFamily,
    previewText: "Zvastra",
  };
}

/** Curated storefront typography — 30 Google Fonts in five editorial categories. */
export const TYPOGRAPHY_CATALOG: TypographyCategory[] = [
  {
    id: "traditional-elegant",
    label: "Traditional and elegant",
    fonts: [
      gf("Yatra One"),
      gf("Eczar", "serif"),
      gf("Vesper Libre", "serif"),
      gf("Martel", "serif"),
      gf("Tillana"),
      gf("Noto Nastaliq Urdu"),
      gf("Aref Ruqaa", "serif"),
    ],
  },
  {
    id: "regional-latin",
    label: "Regional-script typefaces, Latin form",
    fonts: [
      gf("Hind Siliguri"),
      gf("Baloo Da 2"),
      gf("Catamaran"),
      gf("Mukta Malar"),
      gf("Noto Sans Sinhala"),
      gf("Yaldevi"),
    ],
  },
  {
    id: "funky-display",
    label: "Funky and Gen Z · bold display",
    fonts: [
      { ...gf("Bungee"), previewText: "ZVASTRA" },
      { ...gf("Unbounded"), previewText: "ZVASTRA" },
      { ...gf("Archivo Black"), previewText: "ZVASTRA" },
      { ...gf("Righteous"), previewText: "ZVASTRA" },
      { ...gf("Alfa Slab One"), previewText: "ZVASTRA" },
      { ...gf("Boogaloo"), previewText: "ZVASTRA" },
      { ...gf("Anton"), previewText: "ZVASTRA" },
      gf("Passion One"),
      gf("Baloo 2"),
      gf("Fredoka"),
    ],
  },
  {
    id: "soft-script",
    label: "Soft script accents",
    fonts: [gf("Kalam"), gf("Sumana", "serif"), gf("Yeseva One", "serif"), gf("Gulzar", "serif")],
  },
  {
    id: "modern-sans",
    label: "Modern minimal sans",
    fonts: [gf("Mukta"), gf("Hind"), gf("Rubik")],
  },
];

export const TYPOGRAPHY_CATALOG_FONTS: TypographyFont[] = TYPOGRAPHY_CATALOG.flatMap(
  (category) => category.fonts,
);

const catalogByValue = new Map(TYPOGRAPHY_CATALOG_FONTS.map((font) => [font.value, font]));

export function findTypographyFont(value: string | undefined | null): TypographyFont | undefined {
  if (!value) return undefined;
  return catalogByValue.get(value);
}
