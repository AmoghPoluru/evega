import { z } from "zod";

/**
 * Template Customization Schema
 * Defines the structure for vendor-specific template customizations
 */
export const templateCustomizationSchema = z.object({
  colors: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional(),
      textSecondary: z.string().optional(),
      border: z.string().optional(),
      cardBackground: z.string().optional(),
    })
    .optional(),
  fonts: z
    .object({
      heading: z.string().optional(),
      body: z.string().optional(),
    })
    .optional(),
  textStyles: z
    .object({
      heading1: z.object({
        fontSize: z.string().optional(),
        fontWeight: z.string().optional(),
        letterSpacing: z.string().optional(),
        lineHeight: z.string().optional(),
        textTransform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
      }).optional(),
      heading2: z.object({
        fontSize: z.string().optional(),
        fontWeight: z.string().optional(),
        letterSpacing: z.string().optional(),
        lineHeight: z.string().optional(),
        textTransform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
      }).optional(),
      body: z.object({
        fontSize: z.string().optional(),
        fontWeight: z.string().optional(),
        letterSpacing: z.string().optional(),
        lineHeight: z.string().optional(),
      }).optional(),
      heroBanner: z.object({
        titleSize: z.string().optional(),
        titleWeight: z.string().optional(),
        subtitleSize: z.string().optional(),
        subtitleWeight: z.string().optional(),
        textShadow: z.string().optional(),
      }).optional(),
    })
    .optional(),
  spacing: z
    .object({
      sectionPadding: z.string().optional(),
      cardGap: z.string().optional(),
      containerMaxWidth: z.string().optional(),
    })
    .optional(),
  layout: z
    .object({
      productGridColumns: z.number().min(2).max(6).optional(),
      showBanner: z.boolean().optional(),
      showCategories: z.boolean().optional(),
      showFilters: z.boolean().optional(),
      showReviews: z.boolean().optional(),
    })
    .optional(),
  components: z
    .object({
      heroBanner: z
        .object({
          enabled: z.boolean().optional(),
          style: z.enum(["minimal", "full-width", "split"]).optional(),
          height: z.string().optional(),
        })
        .optional(),
      productCard: z
        .object({
          style: z.enum(["minimal", "detailed", "compact"]).optional(),
          showPrice: z.boolean().optional(),
          showRating: z.boolean().optional(),
          showDescription: z.boolean().optional(),
          borderRadius: z.string().optional(),
        })
        .optional(),
      navigation: z
        .object({
          style: z.enum(["top", "sidebar", "sticky"]).optional(),
          backgroundColor: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  backgroundStyle: z
    .object({
      type: z.enum(["solid", "gradient", "mesh-gradient", "pattern", "image"]).optional(),
      value: z.string().optional(),
      animation: z
        .object({
          enabled: z.boolean().optional(),
          duration: z.string().optional(),
          easing: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type TemplateCustomization = z.infer<typeof templateCustomizationSchema>;

/**
 * Template Configuration Schema
 * Defines the structure for template base configuration
 */
export const templateConfigSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
    textSecondary: z.string(),
    border: z.string(),
    cardBackground: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  textStyles: z.object({
    heading1: z.object({
      fontSize: z.string().optional(),
      fontWeight: z.string().optional(),
      letterSpacing: z.string().optional(),
      lineHeight: z.string().optional(),
      textTransform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
    }).optional(),
    heading2: z.object({
      fontSize: z.string().optional(),
      fontWeight: z.string().optional(),
      letterSpacing: z.string().optional(),
      lineHeight: z.string().optional(),
      textTransform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
    }).optional(),
    body: z.object({
      fontSize: z.string().optional(),
      fontWeight: z.string().optional(),
      letterSpacing: z.string().optional(),
      lineHeight: z.string().optional(),
    }).optional(),
    heroBanner: z.object({
      titleSize: z.string().optional(),
      titleWeight: z.string().optional(),
      subtitleSize: z.string().optional(),
      subtitleWeight: z.string().optional(),
      textShadow: z.string().optional(),
    }).optional(),
  }),
  spacing: z.object({
    sectionPadding: z.string(),
    cardGap: z.string(),
    containerMaxWidth: z.string(),
  }),
  layout: z.object({
    productGridColumns: z.number(),
    showBanner: z.boolean(),
    showCategories: z.boolean(),
    showFilters: z.boolean(),
    showReviews: z.boolean(),
  }),
  components: z.object({
    heroBanner: z.object({
      style: z.enum(["minimal", "full-width", "split"]),
      height: z.string(),
    }),
    productCard: z.object({
      style: z.enum(["minimal", "detailed", "compact"]),
      showPrice: z.boolean(),
      showRating: z.boolean(),
      showDescription: z.boolean(),
      borderRadius: z.string(),
    }),
    navigation: z.object({
      style: z.enum(["top", "sidebar", "sticky"]),
      backgroundColor: z.string(),
    }),
  }),
  backgroundStyle: z.object({
    type: z.enum(["solid", "gradient", "mesh-gradient", "pattern", "image"]),
    value: z.string().optional(), // CSS value for solid/gradient/pattern/image
    animation: z.object({
      enabled: z.boolean(),
      duration: z.string().optional(), // e.g., "15s"
      easing: z.string().optional(), // e.g., "ease"
    }).optional(),
  }),
});

export type TemplateConfig = z.infer<typeof templateConfigSchema>;

/**
 * Resolved Template
 * The final template configuration after merging base template with customizations
 */
export interface ResolvedTemplate {
  templateId: string;
  templateSlug: string;
  templateConfig: TemplateConfig;
  customization: TemplateCustomization;
  cssVariables: Record<string, string>;
  /** Structural layout identifier used to pick a storefront layout component. */
  layout: string;
  componentMapping: {
    layout?: string;
    heroBanner: string;
    productCard: string;
    navigation: string;
    footer: string;
  };
}
