import { toPickerHex } from "@/lib/color-utils";
import {
  normalizeBackgroundStyleType,
  type BackgroundStyleCategory,
} from "@/lib/templates/background-style-treatments";
import type { BuilderInitialState } from "@/lib/templates/builder-state";
import { THEME_CATALOG_SPECS } from "@/lib/templates/manifests/theme-catalog";
import { getThemeManifests, getThemeManifestBySlug } from "@/lib/templates/manifests/registry";
import type { ThemeManifest } from "@/lib/templates/manifests/types";
import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";
import {
  normalizeStorefrontSections,
  type StorefrontSection,
} from "@/types/template-sections";

export interface BuilderThemeStarterMeta {
  slug: string;
  name: string;
  description: string;
  niche: string;
  mood: string;
  skeleton: string;
  category: string;
  tags: string[];
  /** Seed swatches for the picker card. */
  swatches: [string, string, string];
  /** Builder feature highlights. */
  highlights: string[];
  featured?: boolean;
  /** Display label override (e.g. Triumph Sport for Kirana). */
  label?: string;
}

const STARTER_HIGHLIGHTS: Record<string, string[]> = {
  kirana: ["Storefront chrome", "Carousel hero", "Dual CTAs", "Countdown bar"],
  runway: ["Full-bleed hero", "Editorial grid", "Luxury typography"],
  bazaar: ["Dense catalog", "Category nav", "Marketplace rhythm"],
  atelier: ["Split hero", "Editorial rows", "Premium serif"],
  bold: ["Mesh gradient", "Bold display type", "Colorful cards"],
  zen: ["Minimal chrome", "Calm palette", "Airy spacing"],
  fun: ["Playful colors", "Rounded cards", "Default baseline"],
};

const STARTER_LABELS: Record<string, string> = {
  kirana: "Triumph Sport",
};

/** Curated slugs surfaced at the top of the builder starter picker. */
export const FEATURED_STARTER_SLUGS = [
  "kirana",
  "runway",
  "bazaar",
  "atelier",
  "bold",
  "zen",
] as const;

function manifestSwatches(manifest: ThemeManifest): [string, string, string] {
  const colors = manifest.templateConfig.colors;
  return [
    colors.primary ?? "#171717",
    colors.secondary ?? "#CE7A50",
    colors.accent ?? "#A87FE0",
  ];
}

function manifestHighlights(manifest: ThemeManifest): string[] {
  const fromMap = STARTER_HIGHLIGHTS[manifest.slug];
  if (fromMap) return fromMap;

  const highlights: string[] = [manifest.skeleton, manifest.mood];
  if (manifest.templateConfig.chrome?.enabled) {
    highlights.push("Storefront chrome");
  }
  return highlights;
}

function specMetaForSlug(slug: string) {
  return THEME_CATALOG_SPECS.find((spec) => spec.slug === slug);
}

export function getBuilderThemeStarterMeta(manifest: ThemeManifest): BuilderThemeStarterMeta {
  const specMeta = specMetaForSlug(manifest.slug);
  return {
    slug: manifest.slug,
    name: manifest.name,
    label: specMeta?.starterLabel ?? STARTER_LABELS[manifest.slug],
    description: manifest.description,
    niche: manifest.niche,
    mood: manifest.mood,
    skeleton: manifest.skeleton,
    category: manifest.category,
    tags: manifest.tags,
    swatches: manifestSwatches(manifest),
    highlights: manifestHighlights(manifest),
    featured:
      specMeta?.featured ??
      FEATURED_STARTER_SLUGS.includes(manifest.slug as (typeof FEATURED_STARTER_SLUGS)[number]),
  };
}

export function listBuilderThemeStarters(): BuilderThemeStarterMeta[] {
  return getThemeManifests()
    .filter((manifest) => manifest.isActive !== false)
    .map(getBuilderThemeStarterMeta)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
}

export function getBuilderThemeStarter(slug: string): ThemeManifest | undefined {
  return getThemeManifestBySlug(slug);
}

function asSections(manifest: ThemeManifest): StorefrontSection[] {
  const fromConfig = (manifest.templateConfig as { sections?: StorefrontSection[] }).sections;
  const raw =
    manifest.defaultSections ??
    (Array.isArray(fromConfig) && fromConfig.length > 0 ? fromConfig : undefined);

  return normalizeStorefrontSections(raw);
}

/** Full builder document state from a catalog manifest — no vendor template id. */
export function buildInitialStateFromManifest(manifest: ThemeManifest): BuilderInitialState {
  return {
    name: STARTER_LABELS[manifest.slug] ?? manifest.name,
    description: manifest.description,
    category: manifest.category,
    sections: asSections(manifest),
    baseConfig: manifest.templateConfig as TemplateConfig,
    skeleton: manifest.skeleton,
    templateId: null,
    isForkFromCatalog: true,
  };
}

/** Form overrides prefilled from a manifest so the live preview matches on apply. */
export function builderFormDefaultsFromConfig(config: TemplateConfig): TemplateCustomization {
  const seedColor = config.backgroundStyle?.value ?? config.colors.primary;

  return {
    colors: {
      background: toPickerHex(seedColor, config.colors.primary),
    },
    fonts: {
      heading: config.fonts?.heading,
      body: config.fonts?.body,
    },
    typography: config.typography,
    chrome: config.chrome,
  };
}

export function resolveBackgroundStyleFromManifest(
  manifest: ThemeManifest,
): BackgroundStyleCategory {
  return normalizeBackgroundStyleType(manifest.templateConfig.backgroundStyle?.type);
}

export function displayStarterName(meta: BuilderThemeStarterMeta): string {
  return meta.label ?? meta.name;
}
