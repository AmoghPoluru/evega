import { VENDOR_LOGO_PRESET_DEFAULTS } from "./presets";
import type { VendorLogoDocFields, VendorLogoPreset } from "./types";

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
  return {
    word1: vendorWords?.word1?.trim() || defaults.word1,
    word2: vendorWords?.word2?.trim() || defaults.word2,
  };
}
