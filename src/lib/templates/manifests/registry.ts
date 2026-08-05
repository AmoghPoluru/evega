import type { StorefrontSection } from "@/types/template-sections";
import { templateSeeds } from "../seed-templates";
import { generateCSSVariables } from "../css-variables";
import { resolveSkeletonFromLayout } from "./skeletons";
import { THEME_META } from "./theme-meta";
import type { ThemeManifest, ThemeManifestMeta } from "./types";

function buildManifestFromSeed(
  seed: (typeof templateSeeds)[number],
  meta: ThemeManifestMeta,
): ThemeManifest {
  return {
    ...seed,
    ...meta,
    themeVersion: seed.version,
    legacyLayout: meta.legacyLayout ?? seed.componentMapping.layout,
  };
}

/** All curated theme manifests derived from seed data + metadata. */
export function getThemeManifests(): ThemeManifest[] {
  return templateSeeds.map((seed) => {
    const meta = THEME_META[seed.slug];
    if (!meta) {
      return buildManifestFromSeed(seed, {
        skeleton: resolveSkeletonFromLayout(seed.componentMapping.layout),
        legacyLayout: seed.componentMapping.layout,
        niche: seed.category,
        mood: "minimal",
        tags: [seed.category],
        tokenPack: `${seed.slug}-default`,
        variants: {},
        minEngineVersion: "1.0.0",
      });
    }
    return buildManifestFromSeed(seed, meta);
  });
}

export function getThemeManifestBySlug(slug: string): ThemeManifest | undefined {
  return getThemeManifests().find((manifest) => manifest.slug === slug);
}

export function getThemeManifestByLayout(layout: string): ThemeManifest | undefined {
  return getThemeManifests().find(
    (manifest) => manifest.legacyLayout === layout || manifest.componentMapping.layout === layout,
  );
}

/** Resolve the layout registry key for rendering — preserves Runway and other legacy layouts. */
export function resolveThemeLayout(manifest: ThemeManifest): string {
  if (manifest.preserveLegacyLayout) {
    return manifest.legacyLayout;
  }
  return manifest.componentMapping.layout;
}

/** Payload fields written when seeding vendor-templates from manifests. */
export function manifestToSeedPayload(manifest: ThemeManifest) {
  const cssVariables =
    Object.keys(manifest.cssVariables).length > 0
      ? manifest.cssVariables
      : generateCSSVariables(manifest.templateConfig);

  return {
    name: manifest.name,
    slug: manifest.slug,
    description: manifest.description,
    category: manifest.category,
    isDefault: manifest.isDefault,
    isActive: manifest.isActive,
    version: manifest.version,
    author: manifest.author,
    templateConfig: manifest.templateConfig,
    cssVariables,
    componentMapping: {
      ...manifest.componentMapping,
      layout: resolveThemeLayout(manifest),
    },
    sections:
      manifest.defaultSections ??
      (manifest.templateConfig as { sections?: StorefrontSection[] }).sections,
    skeleton: manifest.skeleton,
    niche: manifest.niche,
    mood: manifest.mood,
    tags: manifest.tags,
    tokenPack: manifest.tokenPack,
    themeVersion: manifest.themeVersion,
    minEngineVersion: manifest.minEngineVersion,
    catalogStatus: "active" as const,
    status: "approved" as const,
  };
}

export function getAllNiches(): string[] {
  return [...new Set(getThemeManifests().map((manifest) => manifest.niche))].sort();
}

export function getAllMoods(): string[] {
  return [...new Set(getThemeManifests().map((manifest) => manifest.mood))].sort();
}
