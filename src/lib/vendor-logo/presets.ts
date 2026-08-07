import type { VendorLogoPreset } from "./types";

export type VendorLogoPresetDefaults = {
  label: string;
  description: string;
  word1Label: string;
  word1Hint: string;
  word1Default: string;
  word2Label: string;
  word2Hint: string;
  word2Default: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
};

export const VENDOR_LOGO_PRESET_DEFAULTS: Record<VendorLogoPreset, VendorLogoPresetDefaults> = {
  "lotus-grace": {
    label: "Lotus Grace",
    description: "Elegant lotus mark with maroon and gold — perfect for boutique ethnic wear.",
    word1Label: "Brand name",
    word1Hint: "Main name (e.g. Anaya, Maruthi)",
    word1Default: "ANAYA",
    word2Label: "Tagline",
    word2Hint: "Subtitle (e.g. SILKS, COLLECTION)",
    word2Default: "SILKS",
    primary: "#7B1E3A",
    secondary: "#D4AF37",
    accent: "#F5E6D3",
    background: "#FFFBF7",
  },
  "peacock-royal": {
    label: "Peacock Royal",
    description: "Regal peacock feather motif in teal, gold, and ivory.",
    word1Label: "Brand name",
    word1Hint: "Main name (e.g. MAYURA, ROYAL)",
    word1Default: "MAYURA",
    word2Label: "Tagline",
    word2Hint: "Subtitle (e.g. COUTURE, ATELIER)",
    word2Default: "COUTURE",
    primary: "#0D5C63",
    secondary: "#C9A227",
    accent: "#E8F4F5",
    background: "#F7FAFA",
  },
  "mandala-gold": {
    label: "Mandala Gold",
    description: "Circular mandala frame with warm saffron and deep rose tones.",
    word1Label: "Brand name",
    word1Hint: "Main name (e.g. MANDALA, DEVI)",
    word1Default: "MANDALA",
    word2Label: "Tagline",
    word2Hint: "Subtitle (e.g. STUDIO, CRAFTS)",
    word2Default: "STUDIO",
    primary: "#B45309",
    secondary: "#881337",
    accent: "#FDE68A",
    background: "#FFF7ED",
  },
  "silk-emblem": {
    label: "Silk Emblem",
    description: "Woven-thread emblem inspired by Banarasi and Kanjeevaram borders.",
    word1Label: "Brand name",
    word1Hint: "Main name (e.g. RESHAM, VEERA)",
    word1Default: "RESHAM",
    word2Label: "Tagline",
    word2Hint: "Subtitle (e.g. WEAVES, HOUSE)",
    word2Default: "WEAVES",
    primary: "#6B21A8",
    secondary: "#EA580C",
    accent: "#F3E8FF",
    background: "#FDF4FF",
  },
  "temple-arch": {
    label: "Temple Arch",
    description: "Mughal-arch silhouette with sandstone and jade accents.",
    word1Label: "Brand name",
    word1Hint: "Main name (e.g. GOPURAM, HERITAGE)",
    word1Default: "GOPURAM",
    word2Label: "Tagline",
    word2Hint: "Subtitle (e.g. HERITAGE, TRADITIONS)",
    word2Default: "HERITAGE",
    primary: "#92400E",
    secondary: "#047857",
    accent: "#FEF3C7",
    background: "#FFFBEB",
  },
};

export const VENDOR_LOGO_PRESET_OPTIONS = Object.entries(VENDOR_LOGO_PRESET_DEFAULTS).map(
  ([value, defaults]) => ({
    value: value as VendorLogoPreset,
    label: defaults.label,
  }),
);
