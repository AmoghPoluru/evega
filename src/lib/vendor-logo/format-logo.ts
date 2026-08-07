import { VENDOR_LOGO_PRESET_DEFAULTS } from "./presets";
import type { ResolvedVendorLogoTemplate, VendorLogoDocFields, VendorLogoPreset, VendorLogoTheme } from "./types";
import { resolveVendorLogoWords } from "./vendor-words";

function resolveTheme(doc: VendorLogoDocFields, preset: VendorLogoPreset): VendorLogoTheme {
  const defaults = VENDOR_LOGO_PRESET_DEFAULTS[preset];
  return {
    primary: doc.theme?.primary?.trim() || defaults.primary,
    secondary: doc.theme?.secondary?.trim() || defaults.secondary,
    accent: doc.theme?.accent?.trim() || defaults.accent,
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

  return {
    templateId: doc.id,
    templateName: doc.name ?? "Logo",
    preset,
    word1: words.word1.toUpperCase(),
    word2: words.word2.toUpperCase(),
    theme: resolveTheme(doc, preset),
  };
}
