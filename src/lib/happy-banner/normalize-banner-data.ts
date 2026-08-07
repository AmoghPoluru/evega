import type { HappyBannerDocFields } from "./types";

/** Normalize admin input and keep legacy defaultWord1/2 in sync. */
export function normalizeHappyBannerWriteData(
  input: HappyBannerDocFields & { vendorWords?: HappyBannerDocFields["vendorWords"] },
): HappyBannerDocFields {
  const word1Default =
    input.vendorWords?.word1?.defaultValue?.trim() ||
    input.defaultWord1?.trim() ||
    "MEGA";
  const word2Default =
    input.vendorWords?.word2?.defaultValue?.trim() ||
    input.defaultWord2?.trim() ||
    "50";

  return {
    ...input,
    defaultWord1: word1Default,
    defaultWord2: word2Default,
    vendorWords: {
      word1: {
        label: input.vendorWords?.word1?.label?.trim() || "Word 1",
        hint:
          input.vendorWords?.word1?.hint?.trim() ||
          "Main headline (e.g. MEGA, SUMMER)",
        defaultValue: word1Default,
      },
      word2: {
        label: input.vendorWords?.word2?.label?.trim() || "Word 2",
        hint:
          input.vendorWords?.word2?.hint?.trim() ||
          "Discount number before % (e.g. 50, 35)",
        defaultValue: word2Default,
      },
    },
  };
}
