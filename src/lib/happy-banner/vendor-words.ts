import type { HappyBannerDocFields } from "./types";

export type HappyBannerVendorWordSlot = {
  key: "word1" | "word2";
  label: string;
  hint: string;
  defaultValue: string;
};

const DEFAULT_SLOTS: HappyBannerVendorWordSlot[] = [
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
  const word1 = banner.vendorWords?.word1;
  const word2 = banner.vendorWords?.word2;

  return [
    {
      key: "word1",
      label: word1?.label?.trim() || "Word 1",
      hint: word1?.hint?.trim() || DEFAULT_SLOTS[0].hint,
      defaultValue:
        word1?.defaultValue?.trim() ||
        banner.defaultWord1?.trim() ||
        DEFAULT_SLOTS[0].defaultValue,
    },
    {
      key: "word2",
      label: word2?.label?.trim() || "Word 2",
      hint: word2?.hint?.trim() || DEFAULT_SLOTS[1].hint,
      defaultValue:
        word2?.defaultValue?.trim() ||
        banner.defaultWord2?.trim() ||
        DEFAULT_SLOTS[1].defaultValue,
    },
  ];
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
    word1: vendorWords?.word1?.trim() || defaults.word1,
    word2: vendorWords?.word2?.trim() || defaults.word2,
  };
}
