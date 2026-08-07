import type { HappyBannerPreset } from "./types";

export type HappyBannerPresetDefaults = {
  label: string;
  description: string;
  word1Label: string;
  word1Hint: string;
  word1Default: string;
  word2Label: string;
  word2Hint: string;
  word2Default: string;
  eyebrowText: string;
  secondaryWord: string;
  ctaLabel: string;
  discountPrefix: string;
  discountSuffix: string;
  backgroundColor: string;
  accentYellow: string;
  accentPink: string;
  showEyebrow: boolean;
  showCta: boolean;
};

export const HAPPY_BANNER_PRESET_DEFAULTS: Record<HappyBannerPreset, HappyBannerPresetDefaults> = {
  "mega-sale": {
    label: "Mega Sale",
    description: "Bold blue promo with circular discount badge.",
    word1Label: "Word 1",
    word1Hint: "Main headline (e.g. MEGA, SUMMER)",
    word1Default: "MEGA",
    word2Label: "Word 2",
    word2Hint: "Discount number before % (e.g. 50, 35)",
    word2Default: "50",
    eyebrowText: "LIMITED TIME ONLY",
    secondaryWord: "SALE",
    ctaLabel: "SHOP NOW",
    discountPrefix: "UP TO",
    discountSuffix: "OFF",
    backgroundColor: "#1b2db8",
    accentYellow: "#ffd400",
    accentPink: "#ff2d9a",
    showEyebrow: true,
    showCta: true,
  },
  "summer-sale": {
    label: "Summer Big Sale",
    description: "Tropical green layout with script subtitle and offer bar.",
    word1Label: "Word 1",
    word1Hint: "Season headline (e.g. SUMMER, SPRING)",
    word1Default: "SUMMER",
    word2Label: "Word 2",
    word2Hint: "Discount number before % (e.g. 50, 40)",
    word2Default: "50",
    eyebrowText: "",
    secondaryWord: "Big Sale",
    ctaLabel: "",
    discountPrefix: "DISCOUNT UP TO",
    discountSuffix: "OFF",
    backgroundColor: "#2f5536",
    accentYellow: "#9fd356",
    accentPink: "#7ec8e3",
    showEyebrow: false,
    showCta: false,
  },
  "hue-editorial": {
    label: "Hue Are You Editorial",
    description: "Yellow editorial split layout — headline + website line.",
    word1Label: "Headline",
    word1Hint: "Main headline (e.g. HUE ARE YOU?)",
    word1Default: "HUE ARE YOU?",
    word2Label: "Website",
    word2Hint: "Store URL line (e.g. TALBOTS.COM)",
    word2Default: "TALBOTS.COM",
    eyebrowText: "",
    secondaryWord: "",
    ctaLabel: "SHOP NOW ›",
    discountPrefix: "",
    discountSuffix: "",
    backgroundColor: "#f5d030",
    accentYellow: "#8b1538",
    accentPink: "#e84b73",
    showEyebrow: false,
    showCta: true,
  },
  "tropical-hot-sale": {
    label: "Tropical Hot Sale",
    description: "Beige tropical promo — fixed HOT script, Word 1 headline, Word 2 discount %.",
    word1Label: "Headline",
    word1Hint: "Main sale line without HOT (e.g. SUMMER SALE)",
    word1Default: "SUMMER SALE",
    word2Label: "Word 2",
    word2Hint: "Discount number before % (e.g. 50, 40)",
    word2Default: "50",
    eyebrowText: "SPECIAL OFFER",
    secondaryWord: "HOT",
    ctaLabel: "SHOP NOW",
    discountPrefix: "UP TO",
    discountSuffix: "OFF",
    backgroundColor: "#f5f0e8",
    accentYellow: "#1a5c32",
    accentPink: "#e31c23",
    showEyebrow: true,
    showCta: true,
  },
};

export const HAPPY_BANNER_PRESET_OPTIONS = (
  Object.entries(HAPPY_BANNER_PRESET_DEFAULTS) as [HappyBannerPreset, HappyBannerPresetDefaults][]
).map(([value, config]) => ({
  value,
  label: config.label,
}));
