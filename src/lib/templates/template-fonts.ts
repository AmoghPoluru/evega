export interface FontOption {
  value: string;
  label: string;
  /** Google Fonts CSS2 family param, e.g. Noto+Sans+Devanagari */
  googleFamily?: string;
  /** Optional native script sample shown in the dropdown. */
  sample?: string;
}

export const systemFonts: FontOption[] = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Courier New, monospace", label: "Courier New" },
];

export const googleFonts: FontOption[] = [
  { value: "Inter, system-ui, sans-serif", label: "Inter", googleFamily: "Inter" },
  { value: "Roboto, sans-serif", label: "Roboto", googleFamily: "Roboto" },
  { value: "Open Sans, sans-serif", label: "Open Sans", googleFamily: "Open+Sans" },
  { value: "Lato, sans-serif", label: "Lato", googleFamily: "Lato" },
  { value: "Montserrat, sans-serif", label: "Montserrat", googleFamily: "Montserrat" },
  { value: "Poppins, sans-serif", label: "Poppins", googleFamily: "Poppins" },
  {
    value: "Playfair Display, serif",
    label: "Playfair Display",
    googleFamily: "Playfair+Display",
  },
  { value: "Lora, serif", label: "Lora", googleFamily: "Lora" },
  { value: "Nunito, sans-serif", label: "Nunito", googleFamily: "Nunito" },
];

/** Curated editorial, display and premium-retail families used by catalog themes. */
export const editorialFonts: FontOption[] = [
  {
    value: '"Cormorant Garamond", serif',
    label: "Cormorant Garamond",
    googleFamily: "Cormorant+Garamond",
  },
  { value: '"EB Garamond", serif', label: "EB Garamond", googleFamily: "EB+Garamond" },
  { value: '"DM Serif Display", serif', label: "DM Serif Display", googleFamily: "DM+Serif+Display" },
  { value: '"Bodoni Moda", serif', label: "Bodoni Moda", googleFamily: "Bodoni+Moda" },
  { value: '"Libre Baskerville", serif', label: "Libre Baskerville", googleFamily: "Libre+Baskerville" },
  { value: "Marcellus, serif", label: "Marcellus", googleFamily: "Marcellus" },
  { value: "Fraunces, serif", label: "Fraunces", googleFamily: "Fraunces" },
  { value: "Cardo, serif", label: "Cardo", googleFamily: "Cardo" },
  { value: '"Instrument Serif", serif', label: "Instrument Serif", googleFamily: "Instrument+Serif" },
  { value: '"Space Grotesk", sans-serif', label: "Space Grotesk", googleFamily: "Space+Grotesk" },
  { value: "Manrope, sans-serif", label: "Manrope", googleFamily: "Manrope" },
  { value: '"Work Sans", sans-serif', label: "Work Sans", googleFamily: "Work+Sans" },
  { value: "Outfit, sans-serif", label: "Outfit", googleFamily: "Outfit" },
  { value: "Jost, sans-serif", label: "Jost", googleFamily: "Jost" },
  { value: "Sora, sans-serif", label: "Sora", googleFamily: "Sora" },
  { value: "Archivo, sans-serif", label: "Archivo", googleFamily: "Archivo" },
  { value: "Karla, sans-serif", label: "Karla", googleFamily: "Karla" },
  { value: "Rubik, sans-serif", label: "Rubik", googleFamily: "Rubik" },
  { value: '"Bebas Neue", sans-serif', label: "Bebas Neue", googleFamily: "Bebas+Neue" },
  { value: "Syne, sans-serif", label: "Syne", googleFamily: "Syne" },
];

/** Fonts with strong support for South Asian scripts (Google Fonts). */
export const southAsianFonts: FontOption[] = [
  {
    value: '"Noto Sans Devanagari", sans-serif',
    label: "Noto Sans Devanagari",
    googleFamily: "Noto+Sans+Devanagari",
    sample: "हिन्दी",
  },
  {
    value: '"Noto Serif Devanagari", serif',
    label: "Noto Serif Devanagari",
    googleFamily: "Noto+Serif+Devanagari",
    sample: "हिन्दी",
  },
  {
    value: "Hind, sans-serif",
    label: "Hind (Devanagari)",
    googleFamily: "Hind",
    sample: "हिन्दी",
  },
  {
    value: "Mukta, sans-serif",
    label: "Mukta (Devanagari)",
    googleFamily: "Mukta",
    sample: "हिन्दी",
  },
  {
    value: '"Tiro Devanagari Hindi", serif',
    label: "Tiro Devanagari Hindi",
    googleFamily: "Tiro+Devanagari+Hindi",
    sample: "हिन्दी",
  },
  {
    value: '"Baloo 2", sans-serif',
    label: "Baloo 2 (Display)",
    googleFamily: "Baloo+2",
    sample: "हिन्दी",
  },
  {
    value: '"Noto Sans Tamil", sans-serif',
    label: "Noto Sans Tamil",
    googleFamily: "Noto+Sans+Tamil",
    sample: "தமிழ்",
  },
  {
    value: '"Noto Serif Tamil", serif',
    label: "Noto Serif Tamil",
    googleFamily: "Noto+Serif+Tamil",
    sample: "தமிழ்",
  },
  {
    value: '"Hind Madurai", sans-serif',
    label: "Hind Madurai (Tamil)",
    googleFamily: "Hind+Madurai",
    sample: "தமிழ்",
  },
  {
    value: '"Noto Sans Telugu", sans-serif',
    label: "Noto Sans Telugu",
    googleFamily: "Noto+Sans+Telugu",
    sample: "తెలుగు",
  },
  {
    value: '"Hind Guntur", sans-serif',
    label: "Hind Guntur (Telugu)",
    googleFamily: "Hind+Guntur",
    sample: "తెలుగు",
  },
  {
    value: '"Noto Sans Bengali", sans-serif',
    label: "Noto Sans Bengali",
    googleFamily: "Noto+Sans+Bengali",
    sample: "বাংলা",
  },
  {
    value: '"Hind Siliguri", sans-serif',
    label: "Hind Siliguri (Bengali)",
    googleFamily: "Hind+Siliguri",
    sample: "বাংলা",
  },
  {
    value: '"Noto Sans Malayalam", sans-serif',
    label: "Noto Sans Malayalam",
    googleFamily: "Noto+Sans+Malayalam",
    sample: "മലയാളം",
  },
  {
    value: '"Noto Sans Kannada", sans-serif',
    label: "Noto Sans Kannada",
    googleFamily: "Noto+Sans+Kannada",
    sample: "ಕನ್ನಡ",
  },
  {
    value: '"Noto Sans Gujarati", sans-serif',
    label: "Noto Sans Gujarati",
    googleFamily: "Noto+Sans+Gujarati",
    sample: "ગુજરાતી",
  },
  {
    value: '"Noto Sans Gurmukhi", sans-serif',
    label: "Noto Sans Gurmukhi (Punjabi)",
    googleFamily: "Noto+Sans+Gurmukhi",
    sample: "ਪੰਜਾਬੀ",
  },
];

export const fontGroups = [
  { id: "system", label: "System", fonts: systemFonts },
  { id: "popular", label: "Popular", fonts: googleFonts },
  { id: "editorial", label: "Editorial & display", fonts: editorialFonts },
  { id: "south-asian", label: "South Asian", fonts: southAsianFonts },
] as const;

export const allTemplateFonts: FontOption[] = [
  ...systemFonts,
  ...googleFonts,
  ...editorialFonts,
  ...southAsianFonts,
];

const fontsByValue = new Map(allTemplateFonts.map((font) => [font.value, font]));

/** Build a Google Fonts stylesheet URL for the given font-family stacks. */
export function buildGoogleFontsHref(fontStacks: Array<string | undefined | null>): string | null {
  const families = new Set<string>();

  for (const stack of fontStacks) {
    if (!stack) continue;

    const known = fontsByValue.get(stack);
    if (known?.googleFamily) {
      families.add(known.googleFamily);
      continue;
    }

    const firstFamily = stack.split(",")[0]?.trim().replace(/^["']|["']$/g, "");
    if (!firstFamily) continue;

    const byLabel = allTemplateFonts.find(
      (font) => font.label === firstFamily || font.value.includes(firstFamily),
    );
    if (byLabel?.googleFamily) {
      families.add(byLabel.googleFamily);
    }
  }

  if (families.size === 0) return null;

  const query = [...families]
    .map((family) => `family=${family}:wght@400;500;600;700`)
    .join("&");

  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}
