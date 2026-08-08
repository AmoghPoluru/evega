import type { Payload } from "payload";
import type { ResolvedTemplate, TemplateCustomization } from "@/types/template-customization";
import { generateCSSVariables, generateSiteRootCSSVariables } from "./css-variables";
import {
  BUILTIN_TEMPLATE_DOC,
  buildFallbackResolvedTemplate,
} from "./default-template";
import { buildResolvedTemplateFromDoc, type TemplateDocLike } from "./resolve-template-doc";

type VendorTemplateDoc = TemplateDocLike & {
  isActive?: boolean | null;
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
  selectedTemplate: string | VendorTemplateDoc | null | undefined
): Promise<VendorTemplateDoc> {
  if (!selectedTemplate) {
    return getDefaultTemplate(payload);
  }

  try {
    let template: VendorTemplateDoc | null = null;

    if (typeof selectedTemplate === "string") {
      template = (await payload.findByID({
        collection: "vendor-templates",
        id: selectedTemplate,
      })) as VendorTemplateDoc;
    } else {
      template = selectedTemplate;
    }

    if (template?.isActive !== false && template?.templateConfig) {
      return template;
    }
  } catch (error) {
    console.error("Error loading vendor selected template:", error);
  }

  return getDefaultTemplate(payload);
}

/** Preview a specific template for a vendor (ignores current selection; no customizations). */
export async function resolveVendorTemplatePreview(
  vendorId: string,
  templateId: string,
  payload: Payload,
): Promise<ResolvedTemplate> {
  const template = (await payload.findByID({
    collection: "vendor-templates",
    id: templateId,
    depth: 0,
  })) as VendorTemplateDoc;

  if (template.isActive === false) {
    return buildFallbackResolvedTemplate();
  }

  let layoutOverride: string | null = null;
  try {
    const vendor = await payload.findByID({
      collection: "vendors",
      id: vendorId,
      depth: 0,
    });
    layoutOverride =
      typeof vendor.selectedLayoutId === "string" ? vendor.selectedLayoutId : null;
  } catch {
    layoutOverride = null;
  }

  return buildResolvedTemplateFromDoc(template, {}, layoutOverride);
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

    const template = await loadVendorTemplate(payload, vendor.selectedTemplate);
    const layoutOverride =
      typeof vendor.selectedLayoutId === "string" ? vendor.selectedLayoutId : null;

    return buildResolvedTemplateFromDoc(template, customization, layoutOverride);
  } catch (error) {
    console.error("Failed to resolve vendor template, using built-in fallback:", error);
    return buildFallbackResolvedTemplate(customization);
  }
}
