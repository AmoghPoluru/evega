import {
  resolveVendorWordSlot,
  resolveVendorWordValue,
  type VendorWordSlotPreset,
} from "../vendor-words-shared";
import type { HappyBannerDocFields } from "./types";

export type HappyBannerVendorWordSlot = VendorWordSlotPreset & {
  key: "word1" | "word2";
};

const PRESET_SLOTS: HappyBannerVendorWordSlot[] = [
  {
    key: "word1",
    label: "Word 1",
    hint: "Main headline (e.g. MEGA, SUMMER)",
    defaultValue: "MEGA",
  },
  {
    key: "word2",
    label: "Word 2",
    hint: "Discount number before % (e.g. 50, 35)",
    defaultValue: "50",
  },
];

/** Vendor-editable word slots defined on each banner design (same pattern for every design). */
export function getHappyBannerVendorWordSlots(
  banner: HappyBannerDocFields,
): HappyBannerVendorWordSlot[] {
  return PRESET_SLOTS.map((preset) => ({
    key: preset.key,
    ...resolveVendorWordSlot(
      banner.vendorWords?.[preset.key],
      preset.key === "word1" ? banner.defaultWord1 : banner.defaultWord2,
      preset,
    ),
  }));
}

export function getHappyBannerVendorWordDefaults(banner: HappyBannerDocFields): {
  word1: string;
  word2: string;
} {
  const slots = getHappyBannerVendorWordSlots(banner);
  return {
    word1: slots[0].defaultValue,
    word2: slots[1].defaultValue,
  };
}

export function resolveVendorHappyBannerWords(
  banner: HappyBannerDocFields,
  vendorWords?: { word1?: string | null; word2?: string | null } | null,
): { word1: string; word2: string } {
  const defaults = getHappyBannerVendorWordDefaults(banner);
  return {
    word1: resolveVendorWordValue(vendorWords?.word1, defaults.word1),
    word2: resolveVendorWordValue(vendorWords?.word2, defaults.word2),
  };
}
