import { TRPCError } from "@trpc/server";
import type { HappyBannerPreset } from "./types";

export type NormalizedVendorHappyBannerWords = {
  word1: string;
  word2: string;
};

function isNumericDiscountPreset(preset: HappyBannerPreset): boolean {
  return preset === "mega-sale" || preset === "summer-sale" || preset === "tropical-hot-sale";
}

/** Validate and normalize vendor Word 1 / Word 2 for the selected banner preset. */
export function normalizeVendorHappyBannerWords(
  preset: HappyBannerPreset,
  word1: string,
  word2: string,
): NormalizedVendorHappyBannerWords {
  const trimmedWord1 = word1.trim();
  const trimmedWord2 = word2.trim();

  if (!trimmedWord1) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Word 1 is required" });
  }
  if (!trimmedWord2) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Word 2 is required" });
  }

  if (preset === "hue-editorial") {
    if (trimmedWord1.length > 40) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Headline must be 40 characters or fewer",
      });
    }
    if (trimmedWord2.length > 40) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Website line must be 40 characters or fewer",
      });
    }
    if (!/^[a-z0-9.\-/]+$/i.test(trimmedWord2)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Website line may only contain letters, numbers, dots, and hyphens",
      });
    }

    return {
      word1: trimmedWord1.toUpperCase(),
      word2: trimmedWord2.toUpperCase(),
    };
  }

  if (trimmedWord1.length > 24) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Word 1 must be 24 characters or fewer",
    });
  }
  if (!/^\d+$/.test(trimmedWord2)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Word 2 must be a number (e.g. 50, 35)",
    });
  }
  if (trimmedWord2.length > 3) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Word 2 must be 3 characters or fewer",
    });
  }

  return {
    word1: trimmedWord1.toUpperCase(),
    word2: trimmedWord2,
  };
}

export function getVendorWord2InputMode(preset: HappyBannerPreset): "numeric" | "text" {
  return isNumericDiscountPreset(preset) ? "numeric" : "text";
}
