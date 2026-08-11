import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";

const HERO_HEIGHT_DEFAULT = "480px";
const CARD_RADIUS_DEFAULT = "8px";

/** Resolved section field values for the Sections panel (merged template + vendor overrides). */
export function resolveSectionCustomizationFields(
  templateConfig: TemplateConfig,
  customization: TemplateCustomization = {},
): Pick<TemplateCustomization, "layout" | "components"> {
  return {
    layout: {
      showBanner:
        customization.layout?.showBanner ?? templateConfig.layout?.showBanner ?? true,
    },
    components: {
      heroBanner: {
        height:
          customization.components?.heroBanner?.height ??
          templateConfig.components?.heroBanner?.height ??
          HERO_HEIGHT_DEFAULT,
      },
      productCard: {
        borderRadius:
          customization.components?.productCard?.borderRadius ??
          templateConfig.components?.productCard?.borderRadius ??
          CARD_RADIUS_DEFAULT,
      },
    },
  };
}
