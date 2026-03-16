import type { Payload } from "payload";
import type { ResolvedTemplate, TemplateCustomization } from "@/types/template-customization";
import { generateCSSVariables } from "./css-variables";

/**
 * Get default template from database
 */
export async function getDefaultTemplate(payload: Payload) {
  const result = await payload.find({
    collection: "vendor-templates",
    where: {
      isDefault: { equals: true },
      isActive: { equals: true },
    },
    limit: 1,
  });

  if (result.docs.length === 0) {
    // Fallback: get first active template
    const fallback = await payload.find({
      collection: "vendor-templates",
      where: {
        isActive: { equals: true },
      },
      limit: 1,
      sort: "-createdAt",
    });

    if (fallback.docs.length === 0) {
      throw new Error("No active templates found. Please seed templates first.");
    }

    return fallback.docs[0];
  }

  return result.docs[0];
}

/**
 * Resolve vendor template configuration
 * Merges base template config with vendor customizations
 */
export async function resolveVendorTemplate(
  vendorId: string,
  payload: Payload
): Promise<ResolvedTemplate> {
  const vendor = await payload.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 1, // Include template relationship
  });

  // Get template (either from relationship or default)
  let template;
  if (vendor.selectedTemplate) {
    if (typeof vendor.selectedTemplate === "string") {
      template = await payload.findByID({
        collection: "vendor-templates",
        id: vendor.selectedTemplate,
      });
    } else {
      template = vendor.selectedTemplate;
    }
  } else {
    template = await getDefaultTemplate(payload);
  }

  // Get customization (default to empty object)
  const customization: TemplateCustomization = (vendor.templateCustomization as TemplateCustomization) || {};

  // Merge template config with customizations
  const templateConfig = template.templateConfig as any;
  const mergedConfig = {
    colors: {
      ...templateConfig.colors,
      ...customization.colors,
    },
    fonts: {
      ...templateConfig.fonts,
      ...customization.fonts,
    },
    spacing: {
      ...templateConfig.spacing,
      ...customization.spacing,
    },
    layout: {
      ...templateConfig.layout,
      ...customization.layout,
    },
    components: {
      heroBanner: {
        ...templateConfig.components.heroBanner,
        ...customization.components?.heroBanner,
      },
      productCard: {
        ...templateConfig.components.productCard,
        ...customization.components?.productCard,
      },
      navigation: {
        ...templateConfig.components.navigation,
        ...customization.components?.navigation,
      },
    },
    backgroundStyle: templateConfig.backgroundStyle 
      ? {
          ...templateConfig.backgroundStyle,
          ...customization.backgroundStyle,
        }
      : {
          // Fallback to mesh-gradient if not defined in template
          type: "mesh-gradient",
          animation: {
            enabled: true,
            duration: "15s",
            easing: "ease",
          },
        },
    textStyles: {
      ...templateConfig.textStyles,
      ...customization.textStyles,
    },
  };

  // Generate CSS variables from merged config (mergedConfig already includes customizations)
  const cssVariables = generateCSSVariables(mergedConfig);

  return {
    templateId: template.id,
    templateSlug: template.slug,
    templateConfig: mergedConfig,
    customization,
    cssVariables,
    componentMapping: template.componentMapping as any,
  };
}
