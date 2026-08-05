import type {
  ResolvedTemplate,
  TemplateConfig,
  TemplateCustomization,
} from "@/types/template-customization";
import { DEFAULT_SECTIONS } from "@/types/template-sections";
import { generateCSSVariables } from "./css-variables";

/** Mirrors the seeded "Fun" template — guaranteed valid in-code fallback. */
export const BUILTIN_TEMPLATE_CONFIG: TemplateConfig = {
  colors: {
    primary: "#FF6B9D",
    secondary: "#C44569",
    accent: "#FFD93D",
    background: "transparent",
    text: "#1A1A1A",
    textSecondary: "#4A4A4A",
    border: "#FF6B9D",
    cardBackground: "rgba(255, 255, 255, 0.9)",
  },
  fonts: {
    heading: "Poppins, system-ui, sans-serif",
    body: "Nunito, system-ui, sans-serif",
  },
  spacing: {
    sectionPadding: "70px 0",
    cardGap: "28px",
    containerMaxWidth: "1300px",
  },
  layout: {
    productGridColumns: 4,
    showBanner: true,
    showCategories: true,
    showFilters: true,
    showReviews: true,
  },
  components: {
    heroBanner: {
      style: "full-width",
      height: "480px",
    },
    productCard: {
      style: "detailed",
      showPrice: true,
      showRating: true,
      showDescription: false,
      borderRadius: "20px",
    },
    navigation: {
      style: "top",
      backgroundColor: "#FF6B9D",
    },
  },
  textStyles: {
    heading1: {
      fontSize: "2.5rem",
      fontWeight: "800",
      letterSpacing: "-0.02em",
      lineHeight: "1.2",
      textTransform: "none",
    },
    heading2: {
      fontSize: "2rem",
      fontWeight: "700",
      letterSpacing: "-0.01em",
      lineHeight: "1.3",
      textTransform: "none",
    },
    body: {
      fontSize: "1rem",
      fontWeight: "400",
      letterSpacing: "0",
      lineHeight: "1.6",
    },
    heroBanner: {
      titleSize: "3.5rem",
      titleWeight: "900",
      subtitleSize: "1.5rem",
      subtitleWeight: "600",
      textShadow: "3px 3px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 0, 0, 0.6)",
    },
  },
  backgroundStyle: {
    type: "mesh-gradient",
    animation: {
      enabled: true,
      duration: "15s",
      easing: "ease",
    },
  },
  sections: DEFAULT_SECTIONS,
};

export const BUILTIN_COMPONENT_MAPPING: ResolvedTemplate["componentMapping"] = {
  layout: "default",
  heroBanner: "full-width",
  productCard: "detailed",
  navigation: "top",
  footer: "colorful",
};

export const BUILTIN_TEMPLATE_ID = "builtin-default";
export const BUILTIN_TEMPLATE_SLUG = "fun";

/** Synthetic vendor-template document shape returned when the DB has no templates. */
export const BUILTIN_TEMPLATE_DOC = {
  id: BUILTIN_TEMPLATE_ID,
  slug: BUILTIN_TEMPLATE_SLUG,
  templateConfig: BUILTIN_TEMPLATE_CONFIG,
  componentMapping: BUILTIN_COMPONENT_MAPPING,
  isActive: true,
  isDefault: true,
};

export function mergeTemplateWithCustomization(
  baseConfig: Partial<TemplateConfig> | null | undefined,
  customization: TemplateCustomization = {}
): TemplateConfig {
  const templateConfig = baseConfig ?? {};

  return {
    colors: {
      ...(templateConfig.colors ?? {}),
      ...(customization.colors ?? {}),
    },
    fonts: {
      ...(templateConfig.fonts ?? {}),
      ...(customization.fonts ?? {}),
    },
    spacing: {
      ...(templateConfig.spacing ?? {}),
      ...(customization.spacing ?? {}),
    },
    layout: {
      ...(templateConfig.layout ?? {}),
      ...(customization.layout ?? {}),
    },
    components: {
      heroBanner: {
        ...(templateConfig.components?.heroBanner ?? {}),
        ...(customization.components?.heroBanner ?? {}),
      },
      productCard: {
        ...(templateConfig.components?.productCard ?? {}),
        ...(customization.components?.productCard ?? {}),
      },
      navigation: {
        ...(templateConfig.components?.navigation ?? {}),
        ...(customization.components?.navigation ?? {}),
      },
    },
    backgroundStyle: templateConfig.backgroundStyle
      ? {
          ...templateConfig.backgroundStyle,
          ...(customization.backgroundStyle ?? {}),
        }
      : {
          type: "mesh-gradient",
          animation: {
            enabled: true,
            duration: "15s",
            easing: "ease",
          },
        },
    textStyles: {
      ...(templateConfig.textStyles ?? {}),
      ...(customization.textStyles ?? {}),
    },
    tokens: {
      ...(templateConfig.tokens ?? {}),
      ...(customization.tokens ?? {}),
    },
    sections: customization.sections ?? templateConfig.sections ?? DEFAULT_SECTIONS,
  } as TemplateConfig;
}

export function buildFallbackResolvedTemplate(
  customization: TemplateCustomization = {}
): ResolvedTemplate {
  const mergedConfig = mergeTemplateWithCustomization(
    BUILTIN_TEMPLATE_CONFIG,
    customization
  );
  const cssVariables = generateCSSVariables(mergedConfig);

  return {
    templateId: BUILTIN_TEMPLATE_ID,
    templateSlug: BUILTIN_TEMPLATE_SLUG,
    templateConfig: mergedConfig,
    customization,
    cssVariables,
    layout: BUILTIN_COMPONENT_MAPPING.layout ?? "default",
    skeleton: "classic",
    componentMapping: BUILTIN_COMPONENT_MAPPING,
  };
}
