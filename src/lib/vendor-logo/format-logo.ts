import { VENDOR_LOGO_PRESET_DEFAULTS } from "./presets";
import type { ResolvedVendorLogoTemplate, VendorLogoDocFields, VendorLogoPreset, VendorLogoTheme } from "./types";
import { getMonogramLetter, resolveVendorLogoWords } from "./vendor-words";

export function resolveVendorLogoTheme(
  doc: VendorLogoDocFields,
  preset?: VendorLogoPreset | null,
): VendorLogoTheme {
  const resolvedPreset = (preset ?? doc.preset ?? "lotus-grace") as VendorLogoPreset;
  return resolveTheme(doc, resolvedPreset);
}

function resolveTheme(doc: VendorLogoDocFields, preset: VendorLogoPreset): VendorLogoTheme {
  const defaults = VENDOR_LOGO_PRESET_DEFAULTS[preset];
  return {
    primary: doc.theme?.primary?.trim() || defaults.primary,
    secondary: doc.theme?.secondary?.trim() || defaults.secondary,
    accent: doc.theme?.accent?.trim() || defaults.accent,
    tertiary: doc.theme?.tertiary?.trim() || defaults.tertiary,
    highlight: doc.theme?.highlight?.trim() || defaults.highlight,
    background: doc.theme?.background?.trim() || defaults.background,
  };
}

export function buildResolvedVendorLogoTemplate(
  doc: VendorLogoDocFields & { id: string },
  overrides?: { word1?: string | null; word2?: string | null },
): ResolvedVendorLogoTemplate {
  const preset = (doc.preset ?? "lotus-grace") as VendorLogoPreset;
  const words = resolveVendorLogoWords(doc, {
    word1: overrides?.word1,
    word2: overrides?.word2,
  });
  const letter = getMonogramLetter(words.word1);

  return {
    templateId: doc.id,
    templateName: doc.name ?? "Logo",
    preset,
    word1: letter,
    word2: letter,
    theme: resolveTheme(doc, preset),
  };
}
