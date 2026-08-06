export type HappyBannerPreset =
  | "marquee-max"
  | "kinetic-wall"
  | "crossfire"
  | "gravity-well"
  | "confetti"
  | "liquid-ribbon";

export type MotionIntensity = "calm" | "lively" | "showcase";
export type ProductSourceMode = "all-active" | "newest" | "best-sellers" | "manual";

export interface HappyBannerTile {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  image: string;
  blurDataURL?: string | null;
  color: string;
  badge?: "new" | "sale" | "low-stock" | null;
}

export interface ResolvedHappyBanner {
  enabled: boolean;
  header: string;
  tagline: string | null;
  preset: HappyBannerPreset;
  motion: {
    intensity: MotionIntensity;
    speed: number;
    direction: "ltr" | "rtl";
    pauseOnHover: boolean;
    spotlight: { enabled: boolean; intervalMs: number };
    particles: boolean;
  };
  geometry: { height: number; tileSize: number };
  background:
    | { mode: "auto-palette"; palette: string[] }
    | { mode: "image"; url: string; scrim: number }
    | { mode: "gradient"; from: string; to: string }
    | { mode: "theme-token" };
  tiles: HappyBannerTile[];
  totalProducts: number;
}

export interface VendorHeroBannerDoc {
  id?: string;
  title?: string;
  subtitle?: string | null;
  canonical?: boolean;
  archived?: boolean;
}

export interface HeroBannerConfigDoc {
  enabled?: boolean;
  productSource?: ProductSourceMode;
  maxTiles?: number;
  shuffleWindow?: boolean;
  preset?: HappyBannerPreset;
  intensity?: MotionIntensity;
  height?: number;
  tileSize?: number;
  speed?: number;
  direction?: "ltr" | "rtl";
  pauseOnHover?: boolean;
  spotlightEnabled?: boolean;
  spotlightIntervalMs?: number;
  particles?: boolean;
  backgroundMode?: "auto-palette" | "image" | "gradient" | "theme-token";
  backgroundImage?: string | { id: string; url?: string } | null;
  gradientFrom?: string;
  gradientTo?: string;
  scrimOpacity?: number;
  vendorOverrides?: Array<{
    vendor?: string | { id: string };
    enabled?: boolean;
    preset?: HappyBannerPreset;
    intensity?: MotionIntensity;
    productSource?: ProductSourceMode;
    manualProducts?: Array<string | { id: string }>;
    backgroundImage?: string | { id: string; url?: string } | null;
    notes?: string;
  }>;
}

export const DISABLED_HAPPY_BANNER: ResolvedHappyBanner = {
  enabled: false,
  header: "",
  tagline: null,
  preset: "marquee-max",
  motion: {
    intensity: "calm",
    speed: 1,
    direction: "ltr",
    pauseOnHover: true,
    spotlight: { enabled: false, intervalMs: 8000 },
    particles: false,
  },
  geometry: { height: 360, tileSize: 128 },
  background: { mode: "theme-token" },
  tiles: [],
  totalProducts: 0,
};
