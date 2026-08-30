import {
  resolveVendorWordSlot,
  resolveVendorWordValue,
  type VendorWordSlot,
} from "../vendor-words-shared";
import { VENDOR_LOGO_PRESET_DEFAULTS } from "./presets";
import type { VendorLogoDocFields, VendorLogoPreset } from "./types";

function getWordSlots(doc: VendorLogoDocFields): { word1: VendorWordSlot; word2: VendorWordSlot } {
  const preset = (doc.preset ?? "lotus-grace") as VendorLogoPreset;
  const presetDefaults = VENDOR_LOGO_PRESET_DEFAULTS[preset];

  return {
    word1: resolveVendorWordSlot(doc.vendorWords?.word1, doc.defaultWord1, {
      label: presetDefaults.word1Label,
      hint: presetDefaults.word1Hint,
      defaultValue: presetDefaults.word1Default,
    }),
    word2: resolveVendorWordSlot(doc.vendorWords?.word2, doc.defaultWord2, {
      label: presetDefaults.word2Label,
      hint: presetDefaults.word2Hint,
      defaultValue: presetDefaults.word2Default,
    }),
  };
}

export function getVendorLogoWordDefaults(doc: VendorLogoDocFields): {
  word1: string;
  word2: string;
} {
  const slots = getWordSlots(doc);

  return {
    word1: slots.word1.defaultValue,
    word2: slots.word2.defaultValue,
  };
}

export function getVendorLogoWordSlots(doc: VendorLogoDocFields) {
  return getWordSlots(doc);
}

export function resolveVendorLogoWords(
  doc: VendorLogoDocFields,
  vendorWords?: { word1?: string | null; word2?: string | null } | null,
): { word1: string; word2: string } {
  const defaults = getVendorLogoWordDefaults(doc);
  const word1 = resolveVendorWordValue(vendorWords?.word1, defaults.word1);
  const letter = getMonogramLetter(word1);
  return {
    word1: letter,
    word2: resolveVendorWordValue(vendorWords?.word2, letter),
  };
}

/** Single display letter for monogram logos (first character of word1). */
export function getMonogramLetter(word1: string): string {
  const trimmed = word1.trim();
  if (!trimmed) return "A";
  return trimmed.charAt(0).toUpperCase();
}
