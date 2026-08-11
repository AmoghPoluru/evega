import type { ResolvedTemplate, TemplateConfig, TemplateCustomization } from "@/types/template-customization";
import { generateCSSVariables } from "./css-variables";
import { enforceBannerCapableConfig } from "./enforce-banner-capable-config";
import { mergeTemplateWithCustomization } from "./default-template";
import { resolveEffectiveStorefrontLayout } from "./storefront-layouts";

export type TemplateDocLike = {
  id: string;
  slug: string;
  templateConfig?: unknown;
  componentMapping?: unknown;
};

export function buildResolvedTemplateFromDoc(
  template: TemplateDocLike,
  customization: TemplateCustomization = {},
  layoutOverride?: string | null,
): ResolvedTemplate {
  const mergedConfig = enforceBannerCapableConfig(
    mergeTemplateWithCustomization(
      template.templateConfig as Partial<TemplateConfig>,
      customization,
    ),
    customization,
  );
  const cssVariables = generateCSSVariables(mergedConfig);

  const componentMapping =
    (template.componentMapping as ResolvedTemplate["componentMapping"]) ?? {};
  const templateLayout =
    typeof componentMapping.layout === "string" && componentMapping.layout
      ? componentMapping.layout
      : "default";
  const layout = resolveEffectiveStorefrontLayout(layoutOverride, templateLayout);

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
