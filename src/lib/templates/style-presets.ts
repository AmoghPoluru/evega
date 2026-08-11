import type { TemplateCustomization } from "@/types/template-customization";

export const STYLE_PRESET_IDS = [
  "minimal",
  "elegant",
  "bold",
  "zen",
  "editorial",
  "warm",
] as const;

export type StylePresetId = (typeof STYLE_PRESET_IDS)[number];

export type StylePreset = {
  id: StylePresetId;
  label: string;
  description: string;
  swatches: [string, string, string];
  customization: TemplateCustomization;
};

/** Pure skin presets — colors, fonts, and background only. Never touch layout or banner visibility. */
export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean neutrals with crisp Inter typography",
    swatches: ["#1A1A1A", "#6B7280", "#F3F4F6"],
    customization: {
      colors: {
        primary: "#1A1A1A",
        secondary: "#6B7280",
        accent: "#374151",
        background: "transparent",
        text: "#1A1A1A",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        cardBackground: "#FFFFFF",
      },
      fonts: {
        heading: "Inter, system-ui, sans-serif",
        body: "Inter, system-ui, sans-serif",
      },
      backgroundStyle: { type: "solid", value: "#FAFAFA" },
    },
  },
  {
    id: "elegant",
    label: "Elegant",
    description: "Serif headings with soft rose accents",
    swatches: ["#8B4B6B", "#C44569", "#F5E6EC"],
    customization: {
      colors: {
        primary: "#8B4B6B",
        secondary: "#C44569",
        accent: "#D4A574",
        background: "transparent",
        text: "#1A1A1A",
        textSecondary: "#5C4A52",
        border: "#E8D5DE",
        cardBackground: "rgba(255, 255, 255, 0.95)",
      },
      fonts: {
        heading: "Playfair Display, Georgia, serif",
        body: "Lora, Georgia, serif",
      },
      backgroundStyle: { type: "gradient", value: "linear-gradient(135deg, #FDF6F8 0%, #F5E6EC 100%)" },
    },
  },
  {
    id: "bold",
    label: "Bold",
    description: "High-energy pink and gold — the classic Fun palette",
    swatches: ["#FF6B9D", "#C44569", "#FFD93D"],
    customization: {
      colors: {
        primary: "#FF6B9D",
        secondary: "#C44569",
        accent: "#FFD93D",
        background: "transparent",
        text: "#1A1A1A",
        textSecondary: "#4A4A4A",
        border: "#FF6B9D",
        cardBackground: "rgba(255, 255, 255, 0.9)",
      },
      fonts: {
        heading: "Poppins, system-ui, sans-serif",
        body: "Nunito, system-ui, sans-serif",
      },
      backgroundStyle: {
        type: "mesh-gradient",
        animation: { enabled: true, duration: "15s", easing: "ease" },
      },
    },
  },
  {
    id: "zen",
    label: "Zen",
    description: "Calm sage greens and muted earth tones",
    swatches: ["#5F7A61", "#8FA88E", "#E8F0E8"],
    customization: {
      colors: {
        primary: "#5F7A61",
        secondary: "#8FA88E",
        accent: "#C4A882",
        background: "transparent",
        text: "#1F2937",
        textSecondary: "#4B5563",
        border: "#D1DDD2",
        cardBackground: "#FFFFFF",
      },
      fonts: {
        heading: "Lora, Georgia, serif",
        body: "Nunito, system-ui, sans-serif",
      },
      backgroundStyle: { type: "solid", value: "#F4F7F4" },
    },
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "High-contrast black and white magazine feel",
    swatches: ["#111111", "#444444", "#FFFFFF"],
    customization: {
      colors: {
        primary: "#111111",
        secondary: "#444444",
        accent: "#B8860B",
        background: "transparent",
        text: "#111111",
        textSecondary: "#555555",
        border: "#DDDDDD",
        cardBackground: "#FFFFFF",
      },
      fonts: {
        heading: "Playfair Display, Georgia, serif",
        body: "Inter, system-ui, sans-serif",
      },
      backgroundStyle: { type: "solid", value: "#FFFFFF" },
    },
  },
  {
    id: "warm",
    label: "Warm",
    description: "Terracotta and cream for inviting storefronts",
    swatches: ["#C65D3A", "#E8A87C", "#FFF8F0"],
    customization: {
      colors: {
        primary: "#C65D3A",
        secondary: "#E8A87C",
        accent: "#D4A574",
        background: "transparent",
        text: "#2D1810",
        textSecondary: "#6B4F45",
        border: "#E8C4B0",
        cardBackground: "rgba(255, 255, 255, 0.92)",
      },
      fonts: {
        heading: "Montserrat, system-ui, sans-serif",
        body: "Open Sans, sans-serif",
      },
      backgroundStyle: { type: "gradient", value: "linear-gradient(180deg, #FFF8F0 0%, #FDE8D8 100%)" },
    },
  },
];

export function getStylePreset(id: StylePresetId): StylePreset | undefined {
  return STYLE_PRESETS.find((preset) => preset.id === id);
}

export function isStylePresetId(value: string): value is StylePresetId {
  return STYLE_PRESET_IDS.includes(value as StylePresetId);
}
