import type { TemplateSeedData } from "../seed-templates";
import type { StorefrontSection } from "@/types/template-sections";

/** Structural page shells — stylistic differences come from tokens + variants. */
export type StorefrontSkeleton = "classic" | "editorial" | "showcase" | "dense";

export type ThemeMood =
  | "playful"
  | "minimal"
  | "luxury"
  | "bold"
  | "warm"
  | "catalog";

export interface ThemeVariantManifest {
  hero?: string;
  productGrid?: string;
  productCard?: string;
  navigation?: string;
}

/** Manifest metadata layered on top of seed payload data. */
export interface ThemeManifestMeta {
  skeleton: StorefrontSkeleton;
  /** `layoutRegistry` key — legacy themes like Runway keep their own layout component. */
  legacyLayout: string;
  /** When true the theme always renders via `legacyLayout` (never collapsed into modular). */
  preserveLegacyLayout?: boolean;
  niche: string;
  mood: ThemeMood;
  tags: string[];
  tokenPack: string;
  variants: ThemeVariantManifest;
  minEngineVersion: string;
  defaultSections?: StorefrontSection[];
}

/** Full theme manifest: seed data + catalog metadata. */
export interface ThemeManifest extends TemplateSeedData, ThemeManifestMeta {
  themeVersion: string;
}

export type ThemeCatalogStatus = "active" | "hidden" | "retired";
