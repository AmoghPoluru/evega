import { generateCSSVariables } from "./css-variables";
import { getThemeManifestBySlug } from "./manifests/registry";
import { resolveSkeletonFromLayout } from "./manifests/skeletons";
import type { ResolvedTemplate, TemplateConfig } from "@/types/template-customization";
import { DEFAULT_SECTIONS, type StorefrontSection } from "@/types/template-sections";

export interface VendorTemplatePreviewDoc {
  id: string;
  slug: string;
  templateConfig?: unknown;
  componentMapping?: unknown;
  sections?: unknown;
  cssVariables?: unknown;
}

/** Build a resolved template for gallery / modal live previews. */
export function buildPreviewResolvedTemplate(
  doc: VendorTemplatePreviewDoc,
): ResolvedTemplate {
  const templateConfig = (doc.templateConfig ?? {}) as TemplateConfig;
  const sections =
    (doc.sections as StorefrontSection[] | undefined) ??
    templateConfig.sections ??
    DEFAULT_SECTIONS;

  const config: TemplateConfig = { ...templateConfig, sections };
  const storedCssVariables =
    doc.cssVariables && typeof doc.cssVariables === "object" && !Array.isArray(doc.cssVariables)
      ? (doc.cssVariables as Record<string, string>)
      : undefined;
  const cssVariables = storedCssVariables ?? generateCSSVariables(config);

  const componentMapping =
    (doc.componentMapping as ResolvedTemplate["componentMapping"]) ?? {};
  const layout =
    typeof componentMapping.layout === "string" && componentMapping.layout
      ? componentMapping.layout
      : "default";
  const manifest = getThemeManifestBySlug(doc.slug);

  return {
    templateId: doc.id,
    templateSlug: doc.slug,
    templateConfig: config,
    customization: {},
    cssVariables,
    layout: manifest ? manifest.legacyLayout : layout,
    skeleton: manifest?.skeleton ?? resolveSkeletonFromLayout(layout),
    componentMapping: {
      layout: manifest ? manifest.legacyLayout : layout,
      heroBanner: componentMapping.heroBanner ?? "full-width",
      productCard: componentMapping.productCard ?? "detailed",
      navigation: componentMapping.navigation ?? "top",
      footer: componentMapping.footer ?? "default",
    },
  };
}
