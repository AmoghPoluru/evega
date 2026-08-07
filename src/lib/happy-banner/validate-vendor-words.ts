import { TRPCError } from "@trpc/server";
import type { HappyBannerPreset } from "./types";

export type NormalizedVendorHappyBannerWords = {
  word1: string;
  word2: string;
};

const NUMERIC_DISCOUNT_PRESETS: HappyBannerPreset[] = [
  "mega-sale",
  "summer-sale",
  "tropical-hot-sale",
  "flash-sale",
  "clearance-eoss",
];

const WEBSITE_WORD2_PRESETS: HappyBannerPreset[] = ["hue-editorial"];

function isNumericDiscountPreset(preset: HappyBannerPreset): boolean {
  return NUMERIC_DISCOUNT_PRESETS.includes(preset);
}

function isWebsiteWord2Preset(preset: HappyBannerPreset): boolean {
  return WEBSITE_WORD2_PRESETS.includes(preset);
}

function normalizeTextTaglineWord2(trimmedWord2: string, label = "Tagline"): string {
  if (trimmedWord2.length > 32) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${label} must be 32 characters or fewer`,
    });
  }
  if (!/^[a-z0-9\s&'./-]+$/i.test(trimmedWord2)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${label} may only contain letters, numbers, spaces, and & . ' - /`,
    });
  }
  return trimmedWord2.toUpperCase();
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

  if (!isNumericDiscountPreset(preset)) {
    if (trimmedWord1.length > 24) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Word 1 must be 24 characters or fewer",
      });
    }

    return {
      word1: trimmedWord1.toUpperCase(),
      word2: normalizeTextTaglineWord2(trimmedWord2),
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

export function getVendorWord2InputMode(preset: HappyBannerPreset): "numeric" | "text" | "website" {
  if (isWebsiteWord2Preset(preset)) return "website";
  if (isNumericDiscountPreset(preset)) return "numeric";
  return "text";
}
