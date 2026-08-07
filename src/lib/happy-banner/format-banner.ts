import type { HappyBannerDocFields, HappyBannerTheme, ResolvedHappyBanner } from "./types";
import { resolveVendorHappyBannerWords } from "./vendor-words";

const DEFAULT_THEME: HappyBannerTheme = {
  backgroundColor: "#1b2db8",
  accentYellow: "#ffd400",
  accentPink: "#ff2d9a",
};

export function resolveBannerTheme(
  theme?: HappyBannerDocFields["theme"],
): HappyBannerTheme {
  return {
    backgroundColor: theme?.backgroundColor?.trim() || DEFAULT_THEME.backgroundColor,
    accentYellow: theme?.accentYellow?.trim() || DEFAULT_THEME.accentYellow,
    accentPink: theme?.accentPink?.trim() || DEFAULT_THEME.accentPink,
  };
}

export function buildResolvedHappyBanner(
  banner: HappyBannerDocFields & { id: string },
  options: {
    word1?: string | null;
    word2?: string | null;
    vendorSlug?: string;
  } = {},
): ResolvedHappyBanner {
  const words = resolveVendorHappyBannerWords(banner, {
    word1: options.word1,
    word2: options.word2,
  });

  return {
    enabled: true,
    bannerId: banner.id,
    bannerName: banner.name?.trim() || "Happy Banner",
    preset: banner.preset ?? "mega-sale",
    word1: words.word1,
    word2: words.word2,
    eyebrowText: banner.eyebrowText?.trim() || "",
    secondaryWord: banner.secondaryWord?.trim() || "",
    ctaLabel: banner.ctaLabel?.trim() || "SHOP NOW",
    discountPrefix: banner.discountPrefix?.trim() || "",
    discountSuffix: banner.discountSuffix?.trim() || "",
    theme: resolveBannerTheme(banner.theme),
    vendorSlug: options.vendorSlug ?? "",
  };
}
