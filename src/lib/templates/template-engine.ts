import type { Payload } from "payload";
import type { ResolvedTemplate, TemplateConfig, TemplateCustomization } from "@/types/template-customization";
import { generateCSSVariables, generateSiteRootCSSVariables } from "./css-variables";
import {
  BUILTIN_TEMPLATE_DOC,
  buildFallbackResolvedTemplate,
  mergeTemplateWithCustomization,
} from "./default-template";
import { getThemeManifestBySlug, resolveThemeLayout } from "./manifests/registry";
import { resolveSkeletonFromLayout } from "./manifests/skeletons";

type VendorTemplateDoc = {
  id: string;
  slug: string;
  isActive?: boolean | null;
  templateConfig?: unknown;
  componentMapping?: unknown;
  skeleton?: string | null;
};

/**
 * Get default template from database, falling back to the built-in config.
 * Never throws.
 */
export async function getDefaultTemplate(payload: Payload): Promise<VendorTemplateDoc> {
  try {
    const result = await payload.find({
      collection: "vendor-templates",
      where: {
        isDefault: { equals: true },
        isActive: { equals: true },
      },
      limit: 1,
    });

    if (result.docs.length > 0) {
      return result.docs[0] as VendorTemplateDoc;
    }

    const fallback = await payload.find({
      collection: "vendor-templates",
      where: {
        isActive: { equals: true },
      },
      limit: 1,
      sort: "-createdAt",
    });

    if (fallback.docs.length > 0) {
      return fallback.docs[0] as VendorTemplateDoc;
    }
  } catch (error) {
    console.error("Error fetching default template from database:", error);
  }

  return BUILTIN_TEMPLATE_DOC;
}

async function loadVendorTemplate(
  payload: Payload,
  selectedTemplate: string | VendorTemplateDoc | null | undefined,
  selectedTemplateSlug?: string | null
): Promise<VendorTemplateDoc> {
  if (!selectedTemplate && !selectedTemplateSlug) {
    return getDefaultTemplate(payload);
  }

  try {
    let template: VendorTemplateDoc | null = null;

    if (typeof selectedTemplate === "string") {
      template = (await payload.findByID({
        collection: "vendor-templates",
        id: selectedTemplate,
      })) as VendorTemplateDoc;
    } else if (selectedTemplate) {
      template = selectedTemplate;
    }

    if (template?.isActive !== false && template?.templateConfig) {
      return template;
    }
  } catch (error) {
    console.error("Error loading vendor selected template by ID:", error);
  }

  // Recover after re-seed when the relationship ID is stale but slug is stored
  if (selectedTemplateSlug) {
    try {
      const bySlug = await payload.find({
        collection: "vendor-templates",
        where: {
          slug: { equals: selectedTemplateSlug },
          isActive: { equals: true },
        },
        limit: 1,
      });

      if (bySlug.docs.length > 0) {
        return bySlug.docs[0] as VendorTemplateDoc;
      }
    } catch (error) {
      console.error("Error loading vendor selected template by slug:", error);
    }
  }

  return getDefaultTemplate(payload);
}

function buildResolvedTemplateFromDoc(
  template: VendorTemplateDoc,
  customization: TemplateCustomization
): ResolvedTemplate {
  const mergedConfig = mergeTemplateWithCustomization(
    template.templateConfig as Partial<TemplateConfig>,
    customization
  );
  const cssVariables = generateCSSVariables(mergedConfig);

  const componentMapping =
    (template.componentMapping as ResolvedTemplate["componentMapping"]) ?? {};
  const manifest = getThemeManifestBySlug(template.slug);
  const layout = manifest
    ? resolveThemeLayout(manifest)
    : typeof componentMapping.layout === "string" && componentMapping.layout
      ? componentMapping.layout
      : "default";
  const skeleton =
    template.skeleton ??
    manifest?.skeleton ??
    resolveSkeletonFromLayout(layout);

  return {
    templateId: template.id,
    templateSlug: template.slug,
    templateConfig: mergedConfig,
    customization,
    cssVariables,
    layout,
    skeleton,
    componentMapping: {
      layout,
      heroBanner: componentMapping.heroBanner ?? "full-width",
      productCard: componentMapping.productCard ?? "detailed",
      navigation: componentMapping.navigation ?? "top",
      footer: componentMapping.footer ?? "default",
    },
  };
}

/**
 * Resolve the site-wide default template (no vendor customization).
 * Used by marketplace pages — homepage, category, search, etc.
 * Never returns null — falls back to the built-in template on any failure.
 */
export async function resolveSiteTemplate(payload: Payload): Promise<ResolvedTemplate> {
  try {
    const template = await getDefaultTemplate(payload);
    return buildResolvedTemplateFromDoc(template, {});
  } catch (error) {
    console.error("Failed to resolve site template, using built-in fallback:", error);
    return buildFallbackResolvedTemplate();
  }
}

/**
 * CSS variables for marketplace pages: template tokens plus shadcn mappings.
 */
export function resolveSiteRootCSSVariables(
  resolvedTemplate: ResolvedTemplate
): Record<string, string> {
  return generateSiteRootCSSVariables(resolvedTemplate.templateConfig);
}

/**
 * Resolve vendor template configuration.
 * Merges base template config with vendor customizations.
 * Never returns null — falls back to the built-in template on any failure.
 */
export async function resolveVendorTemplate(
  vendorId: string,
  payload: Payload
): Promise<ResolvedTemplate> {
  let customization: TemplateCustomization = {};

  try {
    const vendor = await payload.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 1,
    });

    customization = (vendor.templateCustomization as TemplateCustomization) || {};

    const template = await loadVendorTemplate(
      payload,
      vendor.selectedTemplate,
      (vendor as { selectedTemplateSlug?: string | null }).selectedTemplateSlug
    );

    return buildResolvedTemplateFromDoc(template, customization);
  } catch (error) {
    console.error("Failed to resolve vendor template, using built-in fallback:", error);
    return buildFallbackResolvedTemplate(customization);
  }
}
