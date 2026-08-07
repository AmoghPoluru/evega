import type { ResolvedTemplate, TemplateConfig, TemplateCustomization } from "@/types/template-customization";
import { generateCSSVariables } from "./css-variables";
import { mergeTemplateWithCustomization } from "./default-template";

export type TemplateDocLike = {
  id: string;
  slug: string;
  templateConfig?: unknown;
  componentMapping?: unknown;
};

export function buildResolvedTemplateFromDoc(
  template: TemplateDocLike,
  customization: TemplateCustomization = {},
): ResolvedTemplate {
  const mergedConfig = mergeTemplateWithCustomization(
    template.templateConfig as Partial<TemplateConfig>,
    customization,
  );
  const cssVariables = generateCSSVariables(mergedConfig);

  const componentMapping =
    (template.componentMapping as ResolvedTemplate["componentMapping"]) ?? {};
  const layout =
    typeof componentMapping.layout === "string" && componentMapping.layout
      ? componentMapping.layout
      : "default";

  return {
    templateId: template.id,
    templateSlug: template.slug,
    templateConfig: mergedConfig,
    customization,
    cssVariables,
    layout,
    componentMapping: {
      layout,
      heroBanner: componentMapping.heroBanner ?? "full-width",
      productCard: componentMapping.productCard ?? "detailed",
      navigation: componentMapping.navigation ?? "top",
      footer: componentMapping.footer ?? "default",
    },
  };
}
