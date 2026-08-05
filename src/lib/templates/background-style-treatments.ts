/**
 * Background style treatments — derive page surfaces from a single seed hue.
 *
 * Each category (light tint, obsidian, mesh, semantic tint, etc.) applies the
 * same pairing logic so any picked color reads premium rather than alarming.
 */

export const BACKGROUND_STYLE_CATEGORIES = [
  "light-tint",
  "dark-obsidian",
  "monochrome-wash",
  "linear-gradient",
  "mesh-gradient",
  "modal-overlay",
  "semantic-tint",
] as const;

export type BackgroundStyleCategory = (typeof BACKGROUND_STYLE_CATEGORIES)[number];

/** Legacy template values mapped to the new treatment set. */
export type BackgroundStyleType =
  | BackgroundStyleCategory
  | "solid"
  | "gradient"
  | "pattern"
  | "image";

export interface BackgroundTreatment {
  seedColor: string;
  backgroundColor: string;
  text: string;
  textSecondary: string;
  border: string;
  cardBackground: string;
  primary: string;
  secondary: string;
  accent: string;
  /** Full CSS block for `.vendor-page-template` background (includes !important). */
  pageBackgroundCss: string;
  needsMeshAnimation: boolean;
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0] + normalized[0], 16),
      g: parseInt(normalized[1] + normalized[1], 16),
      b: parseInt(normalized[2] + normalized[2], 16),
    };
  }
  if (normalized.length === 6) {
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function mixHex(a: string, b: string, weight: number): string {
  const c1 = parseHex(a);
  const c2 = parseHex(b);
  if (!c1 || !c2) return a;
  const w = Math.min(1, Math.max(0, weight));
  return rgbToHex(
    Math.round(c1.r * (1 - w) + c2.r * w),
    Math.round(c1.g * (1 - w) + c2.g * w),
    Math.round(c1.b * (1 - w) + c2.b * w),
  );
}

function darken(hex: string, amount: number): string {
  return mixHex(hex, "#000000", amount);
}

function lighten(hex: string, amount: number): string {
  return mixHex(hex, "#FFFFFF", amount);
}

function normalizeSeedColor(color: string, fallback = "#501313"): string {
  if (!color || color === "transparent") return fallback;
  const trimmed = color.trim().toLowerCase();
  if (trimmed.startsWith("#")) {
    if (trimmed.length === 4) {
      const [, r, g, b] = trimmed;
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return trimmed;
  }
  return fallback;
}

/** Map persisted / legacy style keys onto the treatment catalog. */
export function normalizeBackgroundStyleType(
  type: string | undefined,
): BackgroundStyleCategory {
  switch (type) {
    case "light-tint":
    case "dark-obsidian":
    case "monochrome-wash":
    case "linear-gradient":
    case "mesh-gradient":
    case "modal-overlay":
    case "semantic-tint":
      return type;
    case "solid":
      return "light-tint";
    case "gradient":
      return "linear-gradient";
    default:
      return "light-tint";
  }
}

function buildMeshGradientCss(premiumDark: string, midTone: string, accent: string): string {
  return `background-color: ${premiumDark} !important;
background-image:
  radial-gradient(at 12% 18%, ${midTone} 0px, transparent 52%),
  radial-gradient(at 88% 12%, ${accent} 0px, transparent 48%),
  radial-gradient(at 92% 88%, ${premiumDark} 0px, transparent 50%),
  radial-gradient(at 8% 82%, ${midTone} 0px, transparent 46%);
background-attachment: fixed;
background-size: 200% 200%;
animation: gradientMove 15s ease infinite;`;
}

/**
 * Derive full surface tokens + page background CSS from one seed hue.
 * Gradient and mesh treatments lean darker toward the seed for a premium read.
 */
export function resolveBackgroundTreatment(
  seedInput: string,
  typeInput: BackgroundStyleType | undefined,
): BackgroundTreatment {
  const seedColor = normalizeSeedColor(seedInput);
  const type = normalizeBackgroundStyleType(typeInput);

  const premiumDark = darken(seedColor, 0.42);
  const midTone = darken(seedColor, 0.22);
  const accentTone = darken(seedColor, 0.12);
  const paleTint = lighten(seedColor, 0.92);
  const semanticText = darken(seedColor, 0.08);
  const obsidianBase = mixHex(seedColor, "#0D0D12", 0.88);

  switch (type) {
    case "light-tint": {
      const backgroundColor = lighten(seedColor, 0.9);
      return {
        seedColor,
        backgroundColor,
        text: semanticText,
        textSecondary: mixHex(semanticText, backgroundColor, 0.4),
        border: lighten(seedColor, 0.78),
        cardBackground: "#FFFFFF",
        primary: seedColor,
        secondary: premiumDark,
        accent: accentTone,
        pageBackgroundCss: `background-color: ${backgroundColor} !important;`,
        needsMeshAnimation: false,
      };
    }

    case "dark-obsidian": {
      const backgroundColor = obsidianBase;
      return {
        seedColor,
        backgroundColor,
        text: lighten(seedColor, 0.82),
        textSecondary: mixHex(lighten(seedColor, 0.82), backgroundColor, 0.35),
        border: mixHex(backgroundColor, "#FFFFFF", 0.14),
        cardBackground: lighten(backgroundColor, 0.1),
        primary: lighten(seedColor, 0.35),
        secondary: midTone,
        accent: accentTone,
        pageBackgroundCss: `background-color: ${backgroundColor} !important;`,
        needsMeshAnimation: false,
      };
    }

    case "monochrome-wash": {
      const washBase = mixHex(lighten(seedColor, 0.82), "#D8D8D8", 0.45);
      const backgroundColor = mixHex(washBase, "#F4F4F4", 0.35);
      return {
        seedColor,
        backgroundColor,
        text: darken(seedColor, 0.18),
        textSecondary: mixHex(darken(seedColor, 0.18), backgroundColor, 0.38),
        border: mixHex(backgroundColor, seedColor, 0.22),
        cardBackground: lighten(backgroundColor, 0.35),
        primary: seedColor,
        secondary: premiumDark,
        accent: midTone,
        pageBackgroundCss: `background-color: ${backgroundColor} !important;`,
        needsMeshAnimation: false,
      };
    }

    case "linear-gradient": {
      const gradientStart = lighten(seedColor, 0.58);
      const gradientEnd = premiumDark;
      const backgroundColor = gradientStart;
      return {
        seedColor,
        backgroundColor,
        text: semanticText,
        textSecondary: mixHex(semanticText, backgroundColor, 0.42),
        border: lighten(seedColor, 0.72),
        cardBackground: "rgba(255, 255, 255, 0.88)",
        primary: seedColor,
        secondary: premiumDark,
        accent: accentTone,
        pageBackgroundCss: `background: linear-gradient(145deg, ${gradientStart} 0%, ${gradientEnd} 100%) !important;`,
        needsMeshAnimation: false,
      };
    }

    case "mesh-gradient": {
      const backgroundColor = premiumDark;
      return {
        seedColor,
        backgroundColor,
        text: lighten(seedColor, 0.85),
        textSecondary: mixHex(lighten(seedColor, 0.85), backgroundColor, 0.32),
        border: mixHex(backgroundColor, "#FFFFFF", 0.16),
        cardBackground: "rgba(255, 255, 255, 0.12)",
        primary: lighten(seedColor, 0.2),
        secondary: midTone,
        accent: accentTone,
        pageBackgroundCss: buildMeshGradientCss(premiumDark, midTone, accentTone),
        needsMeshAnimation: true,
      };
    }

    case "modal-overlay": {
      const backgroundColor = mixHex("#141414", seedColor, 0.12);
      const overlayMid = mixHex(backgroundColor, "#000000", 0.35);
      return {
        seedColor,
        backgroundColor,
        text: "#F5F5F5",
        textSecondary: mixHex("#F5F5F5", backgroundColor, 0.38),
        border: mixHex(backgroundColor, "#FFFFFF", 0.12),
        cardBackground: "rgba(32, 32, 36, 0.92)",
        primary: lighten(seedColor, 0.25),
        secondary: midTone,
        accent: accentTone,
        pageBackgroundCss: `background-color: ${backgroundColor} !important;
background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.62)), radial-gradient(circle at 50% 0%, ${overlayMid} 0%, transparent 55%) !important;`,
        needsMeshAnimation: false,
      };
    }

    case "semantic-tint": {
      const backgroundColor = paleTint;
      return {
        seedColor,
        backgroundColor,
        text: semanticText,
        textSecondary: mixHex(semanticText, backgroundColor, 0.45),
        border: lighten(seedColor, 0.72),
        cardBackground: lighten(seedColor, 0.96),
        primary: seedColor,
        secondary: premiumDark,
        accent: accentTone,
        pageBackgroundCss: `background-color: ${backgroundColor} !important;`,
        needsMeshAnimation: false,
      };
    }

    default: {
      return resolveBackgroundTreatment(seedColor, "light-tint");
    }
  }
}

/** Inline style object for builder swatch previews. */
export function backgroundTreatmentPreviewStyle(
  seedInput: string,
  typeInput: BackgroundStyleType | undefined,
): Record<string, string> {
  const treatment = resolveBackgroundTreatment(seedInput, typeInput);
  const category = normalizeBackgroundStyleType(typeInput);

  if (category === "linear-gradient") {
    const gradientStart = lighten(normalizeSeedColor(seedInput), 0.58);
    const gradientEnd = darken(normalizeSeedColor(seedInput), 0.42);
    return {
      background: `linear-gradient(145deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
    };
  }

  if (category === "mesh-gradient") {
    const seed = normalizeSeedColor(seedInput);
    const premiumDark = darken(seed, 0.42);
    const midTone = darken(seed, 0.22);
    const accentTone = darken(seed, 0.12);
    return {
      backgroundColor: premiumDark,
      backgroundImage: [
        `radial-gradient(at 12% 18%, ${midTone} 0px, transparent 52%)`,
        `radial-gradient(at 88% 12%, ${accentTone} 0px, transparent 48%)`,
        `radial-gradient(at 92% 88%, ${premiumDark} 0px, transparent 50%)`,
        `radial-gradient(at 8% 82%, ${midTone} 0px, transparent 46%)`,
      ].join(", "),
    };
  }

  if (category === "modal-overlay") {
    const seed = normalizeSeedColor(seedInput);
    const backgroundColor = mixHex("#141414", seed, 0.12);
    const overlayMid = mixHex(backgroundColor, "#000000", 0.35);
    return {
      backgroundColor,
      backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.62)), radial-gradient(circle at 50% 0%, ${overlayMid} 0%, transparent 55%)`,
    };
  }

  return {
    backgroundColor: treatment.backgroundColor,
  };
}
