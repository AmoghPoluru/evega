import type { TemplateCategory } from "@/lib/templates/category-presets";
import type { ThemeSpec } from "@/lib/templates/manifests/theme-catalog";
import type { StorefrontSkeleton } from "@/lib/templates/manifests/types";
import type { TemplateConfig } from "@/types/template-customization";
import type { StorefrontSection } from "@/types/template-sections";

export interface ExportThemeSpecInput {
  name: string;
  description: string;
  category: TemplateCategory;
  skeleton: StorefrontSkeleton;
  config: TemplateConfig;
  sections: StorefrontSection[];
  niche?: string;
  mood?: ThemeSpec["mood"];
  tags?: string[];
  featured?: boolean;
  starterLabel?: string;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "new-theme"
  );
}

function inferHeroVariant(sections: StorefrontSection[]): ThemeSpec["heroVariant"] {
  const hero = sections.find((section) => section.type === "hero");
  const variant = hero?.settings?.variant;
  if (
    variant === "carousel-peek" ||
    variant === "split-media" ||
    variant === "minimal-type" ||
    variant === "full-bleed"
  ) {
    return variant;
  }
  return "full-bleed";
}

function inferGridVariant(sections: StorefrontSection[]): ThemeSpec["gridVariant"] {
  const grid = sections.find((section) => section.type === "product-grid");
  const variant = grid?.settings?.variant;
  if (variant === "dense-compact" || variant === "editorial-rows" || variant === "standard") {
    return variant;
  }
  if (variant === "standard-column") return "standard";
  return "standard";
}

/**
 * Convert a builder save state into a theme spec snippet for `manifests/themes/*.theme.ts`.
 */
export function exportThemeSpecFromBuilder(input: ExportThemeSpecInput): ThemeSpec {
  const { config, sections } = input;
  const slug = slugify(input.name);

  return {
    name: input.name,
    slug,
    description: input.description || `Theme exported from builder — ${input.name}.`,
    category: input.category,
    niche: input.niche ?? "General retail",
    mood: input.mood ?? "bold",
    tags: input.tags ?? ["builder-export"],
    skeleton: input.skeleton,
    seedColors: {
      primary: config.colors.primary,
      secondary: config.colors.secondary,
      accent: config.colors.accent,
      background: config.colors.background,
    },
    fonts: {
      heading: config.fonts.heading,
      body: config.fonts.body,
    },
    heroVariant: inferHeroVariant(sections),
    heroHeight: config.components?.heroBanner?.height,
    gridVariant: inferGridVariant(sections),
    cardStyle: config.components?.productCard?.style,
    navStyle: config.components?.navigation?.style,
    chrome: config.chrome,
    featured: input.featured,
    starterLabel: input.starterLabel,
    sections: sections.map((section) => ({
      type: section.type,
      settings: section.settings,
      enabled: section.enabled,
    })),
  };
}

export function formatThemeSpecForClipboard(spec: ThemeSpec): string {
  return `import { defineTheme } from "@/lib/templates/manifests/define-theme";
import { applyChromePreset } from "@/lib/templates/manifests/chrome-presets";

export const ${spec.slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}Theme = defineTheme(${JSON.stringify(spec, null, 2)});

// Register in manifests/themes/index.ts → modularThemeSpecs
`;
}
