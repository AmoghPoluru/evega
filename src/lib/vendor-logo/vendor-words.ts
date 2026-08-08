import { VENDOR_LOGO_PRESET_DEFAULTS } from "./presets";
import { isWordmarkLogoPreset, type VendorLogoDocFields, type VendorLogoPreset } from "./types";

export function getVendorLogoWordDefaults(doc: VendorLogoDocFields): {
  word1: string;
  word2: string;
} {
  const preset = (doc.preset ?? "lotus-grace") as VendorLogoPreset;
  const presetDefaults = VENDOR_LOGO_PRESET_DEFAULTS[preset];

  return {
    word1:
      doc.vendorWords?.word1?.defaultValue?.trim() ||
      doc.defaultWord1?.trim() ||
      presetDefaults.word1Default,
    word2:
      doc.vendorWords?.word2?.defaultValue?.trim() ||
      doc.defaultWord2?.trim() ||
      presetDefaults.word2Default,
  };
}

export function getVendorLogoWordSlots(doc: VendorLogoDocFields) {
  const preset = (doc.preset ?? "lotus-grace") as VendorLogoPreset;
  const presetDefaults = VENDOR_LOGO_PRESET_DEFAULTS[preset];

  return {
    word1: {
      label: doc.vendorWords?.word1?.label?.trim() || presetDefaults.word1Label,
      hint: doc.vendorWords?.word1?.hint?.trim() || presetDefaults.word1Hint,
      defaultValue: getVendorLogoWordDefaults(doc).word1,
    },
    word2: {
      label: doc.vendorWords?.word2?.label?.trim() || presetDefaults.word2Label,
      hint: doc.vendorWords?.word2?.hint?.trim() || presetDefaults.word2Hint,
      defaultValue: getVendorLogoWordDefaults(doc).word2,
    },
  };
}

export function resolveVendorLogoWords(
  doc: VendorLogoDocFields,
  vendorWords?: { word1?: string | null; word2?: string | null } | null,
): { word1: string; word2: string } {
  const defaults = getVendorLogoWordDefaults(doc);
  const preset = (doc.preset ?? "lotus-grace") as VendorLogoPreset;
  const word1 = vendorWords?.word1?.trim() || defaults.word1;
  const word2 = vendorWords?.word2?.trim() || defaults.word2;

  if (isWordmarkLogoPreset(preset)) {
    return {
      word1: word1 || defaults.word1,
      word2: (word2 || defaults.word2).toUpperCase(),
    };
  }

  const letter = getMonogramLetter(word1);
  return {
    word1: letter,
    word2: letter,
  };
}

/** Single display letter for monogram logos (first character of word1). */
export function getMonogramLetter(word1: string): string {
  const trimmed = word1.trim();
  if (!trimmed) return "A";
  return trimmed.charAt(0).toUpperCase();
}
