import { z } from "zod";

import { storefrontSectionsSchema } from "./template-sections";
import { storefrontChromeSchema } from "@/lib/templates/storefront-chrome";

/** Coerce null/empty to undefined — Payload JSON often stores null for absent fields. */
const optionalString = z.preprocess(
  (val) => (val === null || val === "" ? undefined : val),
  z.string().optional(),
);

const typographyAreaSchema = z.object({
  font: optionalString,
  color: optionalString,
});

const typographyPriceSchema = typographyAreaSchema.extend({
  backgroundColor: optionalString,
});

const typographySchema = z.object({
  vendor: typographyAreaSchema.optional(),
  hero: typographyAreaSchema.optional(),
  product: typographyAreaSchema.optional(),
  price: typographyPriceSchema.optional(),
});

const backgroundStyleTypeSchema = z.enum([
  "light-tint",
  "dark-obsidian",
  "monochrome-wash",
  "linear-gradient",
  "mesh-gradient",
  "modal-overlay",
  "semantic-tint",
  "solid",
  "gradient",
  "pattern",
  "image",
]);

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
  typography: typographySchema.optional(),
  chrome: storefrontChromeSchema.optional(),
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
          /** Backdrop colour behind contained product imagery. */
          matColor: z.string().optional(),
          /** Inner padding around contained product imagery, e.g. "8%". */
          imagePadding: z.string().optional(),
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
      type: backgroundStyleTypeSchema.optional(),
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
  sections: storefrontSectionsSchema.optional(),
  tokens: z
    .object({
      contrast: z.enum(["light", "dark", "high-contrast"]).optional(),
      displayFont: optionalString,
      typeScale: z
        .object({
          base: z.string().optional(),
          ratio: z.string().optional(),
        })
        .optional(),
      rhythm: z
        .object({
          section: z.enum(["compact", "normal", "airy"]).optional(),
          gap: z.enum(["compact", "normal", "airy"]).optional(),
        })
        .optional(),
      shape: z
        .object({
          radiusScale: z.enum(["sharp", "soft", "pill"]).optional(),
          borderWidth: z.string().optional(),
          shadowScale: z.enum(["none", "soft", "elevated"]).optional(),
        })
        .optional(),
      surface: z
        .object({
          cardTreatment: z.enum(["flat", "bordered", "elevated", "glass"]).optional(),
          imageAspect: z.string().optional(),
        })
        .optional(),
      motion: z.enum(["none", "subtle", "expressive"]).optional(),
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
  typography: typographySchema.optional(),
  chrome: storefrontChromeSchema.optional(),
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
      /** Backdrop colour behind contained product imagery. */
      matColor: z.string().optional(),
      /** Inner padding around contained product imagery, e.g. "8%". */
      imagePadding: z.string().optional(),
    }),
    navigation: z.object({
      style: z.enum(["top", "sidebar", "sticky"]),
      backgroundColor: z.string(),
    }),
  }),
  backgroundStyle: z.object({
    type: backgroundStyleTypeSchema,
    value: z.string().optional(),
    animation: z.object({
      enabled: z.boolean(),
      duration: z.string().optional(),
      easing: z.string().optional(),
    }).optional(),
  }),
  sections: storefrontSectionsSchema.optional(),
  tokens: z
    .object({
      contrast: z.enum(["light", "dark", "high-contrast"]).optional(),
      displayFont: optionalString,
      typeScale: z.object({
        base: z.string().optional(),
        ratio: z.string().optional(),
      }).optional(),
      rhythm: z.object({
        section: z.enum(["compact", "normal", "airy"]).optional(),
        gap: z.enum(["compact", "normal", "airy"]).optional(),
      }).optional(),
      shape: z.object({
        radiusScale: z.enum(["sharp", "soft", "pill"]).optional(),
        borderWidth: z.string().optional(),
        shadowScale: z.enum(["none", "soft", "elevated"]).optional(),
      }).optional(),
      surface: z.object({
        cardTreatment: z.enum(["flat", "bordered", "elevated", "glass"]).optional(),
        imageAspect: z.string().optional(),
      }).optional(),
      motion: z.enum(["none", "subtle", "expressive"]).optional(),
    })
    .optional(),
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
  /** Structural skeleton for modular themes (classic, editorial, showcase, dense). */
  skeleton?: string;
  componentMapping: {
    layout?: string;
    heroBanner: string;
    productCard: string;
    navigation: string;
    footer: string;
  };
}
