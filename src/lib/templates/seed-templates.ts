/**
 * Vendor Template Seed Data
 * 
 * This file contains 4 pre-built templates with vibrant mesh gradient backgrounds.
 * Run this seed script to populate the vendor-templates collection.
 */

import type { Payload } from "payload";

export interface TemplateSeedData {
  name: string;
  slug: string;
  description: string;
  category: "minimal" | "elegant" | "bold" | "colorful" | "classic";
  isDefault: boolean;
  isActive: boolean;
  version: string;
  author: string;
  templateConfig: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      textSecondary: string;
      border: string;
      cardBackground: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    textStyles?: {
      heading1?: {
        fontSize?: string;
        fontWeight?: string;
        letterSpacing?: string;
        lineHeight?: string;
        textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
      };
      heading2?: {
        fontSize?: string;
        fontWeight?: string;
        letterSpacing?: string;
        lineHeight?: string;
        textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
      };
      body?: {
        fontSize?: string;
        fontWeight?: string;
        letterSpacing?: string;
        lineHeight?: string;
      };
      heroBanner?: {
        titleSize?: string;
        titleWeight?: string;
        subtitleSize?: string;
        subtitleWeight?: string;
        textShadow?: string;
      };
    };
    spacing: {
      sectionPadding: string;
      cardGap: string;
      containerMaxWidth: string;
    };
    layout: {
      productGridColumns: number;
      showBanner: boolean;
      showCategories: boolean;
      showFilters: boolean;
      showReviews: boolean;
    };
    components: {
      heroBanner: {
        style: "minimal" | "full-width" | "split";
        height: string;
      };
      productCard: {
        style: "minimal" | "detailed" | "compact";
        showPrice: boolean;
        showRating: boolean;
        showDescription: boolean;
        borderRadius: string;
      };
      navigation: {
        style: "top" | "sidebar" | "sticky";
        backgroundColor: string;
      };
    };
    backgroundStyle: {
      type: "solid" | "gradient" | "mesh-gradient" | "pattern" | "image";
      value?: string;
      animation?: {
        enabled: boolean;
        duration?: string;
        easing?: string;
      };
    };
  };
  cssVariables: Record<string, string>;
  componentMapping: {
    heroBanner: string;
    productCard: string;
    navigation: string;
    footer: string;
  };
}

export const templateSeeds: TemplateSeedData[] = [
  {
    name: "Fun",
    slug: "fun",
    description: "A playful, energetic template with vibrant colors and dynamic gradients. Perfect for creative brands and lifestyle products that want to stand out with a cheerful, modern aesthetic.",
    category: "colorful",
    isDefault: true,
    isActive: true,
    version: "2.0.0",
    author: "Evega Team",
    templateConfig: {
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
    },
    cssVariables: {
      "--template-primary": "#FF6B9D",
      "--template-secondary": "#C44569",
      "--template-accent": "#FFD93D",
      "--template-background": "transparent",
      "--template-text": "#1A1A1A",
      "--template-text-secondary": "#4A4A4A",
      "--template-border": "#FF6B9D",
      "--template-card-bg": "rgba(255, 255, 255, 0.9)",
      "--template-font-heading": "Poppins, system-ui, sans-serif",
      "--template-font-body": "Nunito, system-ui, sans-serif",
      "--template-spacing-section": "70px 0",
      "--template-spacing-card-gap": "28px",
      "--template-container-width": "1300px",
      "--template-card-radius": "20px",
      "--template-banner-height": "480px",
    },
    componentMapping: {
      heroBanner: "full-width",
      productCard: "detailed",
      navigation: "top",
      footer: "colorful",
    },
  },
  {
    name: "Elegant",
    slug: "elegant",
    description: "A sophisticated template with refined typography and rich, luxurious colors. Ideal for premium brands and high-end products with a timeless, elegant aesthetic.",
    category: "elegant",
    isDefault: false,
    isActive: true,
    version: "2.0.0",
    author: "Evega Team",
    templateConfig: {
      colors: {
        primary: "#2C3E50",
        secondary: "#8B6F47",
        accent: "#D4AF37",
        background: "transparent",
        text: "#1A1A1A",
        textSecondary: "#4A4A4A",
        border: "#D4D4D4",
        cardBackground: "rgba(255, 255, 255, 0.95)",
      },
      fonts: {
        heading: "Playfair Display, Georgia, serif",
        body: "Lora, Georgia, serif",
      },
      spacing: {
        sectionPadding: "100px 0",
        cardGap: "32px",
        containerMaxWidth: "1400px",
      },
      layout: {
        productGridColumns: 3,
        showBanner: true,
        showCategories: true,
        showFilters: true,
        showReviews: true,
      },
      components: {
        heroBanner: {
          style: "full-width",
          height: "500px",
        },
        productCard: {
          style: "detailed",
          showPrice: true,
          showRating: true,
          showDescription: true,
          borderRadius: "12px",
        },
        navigation: {
          style: "sticky",
          backgroundColor: "#2C3E50",
        },
      },
      textStyles: {
        heading1: {
          fontSize: "3rem",
          fontWeight: "700",
          letterSpacing: "0.02em",
          lineHeight: "1.1",
          textTransform: "none",
        },
        heading2: {
          fontSize: "2.25rem",
          fontWeight: "600",
          letterSpacing: "0.01em",
          lineHeight: "1.2",
          textTransform: "none",
        },
        body: {
          fontSize: "1.125rem",
          fontWeight: "400",
          letterSpacing: "0.01em",
          lineHeight: "1.7",
        },
        heroBanner: {
          titleSize: "4rem",
          titleWeight: "700",
          subtitleSize: "1.75rem",
          subtitleWeight: "400",
          textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7), 0 0 16px rgba(0, 0, 0, 0.5)",
        },
      },
      backgroundStyle: {
        type: "mesh-gradient",
        animation: {
          enabled: true,
          duration: "20s",
          easing: "ease",
        },
      },
    },
    cssVariables: {
      "--template-primary": "#2C3E50",
      "--template-secondary": "#8B6F47",
      "--template-accent": "#D4AF37",
      "--template-background": "transparent",
      "--template-text": "#1A1A1A",
      "--template-text-secondary": "#4A4A4A",
      "--template-border": "#D4D4D4",
      "--template-card-bg": "rgba(255, 255, 255, 0.95)",
      "--template-font-heading": "Playfair Display, Georgia, serif",
      "--template-font-body": "Lora, Georgia, serif",
      "--template-spacing-section": "100px 0",
      "--template-spacing-card-gap": "32px",
      "--template-container-width": "1400px",
      "--template-card-radius": "12px",
      "--template-banner-height": "500px",
    },
    componentMapping: {
      heroBanner: "full-width",
      productCard: "detailed",
      navigation: "sticky",
      footer: "elegant",
    },
  },
  {
    name: "Bold",
    slug: "bold",
    description: "A vibrant, eye-catching template with strong contrasts and dynamic layouts. Perfect for brands that want to make a statement with high-energy, attention-grabbing design.",
    category: "bold",
    isDefault: false,
    isActive: true,
    version: "2.0.0",
    author: "Evega Team",
    templateConfig: {
      colors: {
        primary: "#FF6B35",
        secondary: "#004E89",
        accent: "#FFD23F",
        background: "transparent",
        text: "#1A1A1A",
        textSecondary: "#4A4A4A",
        border: "#FF6B35",
        cardBackground: "rgba(255, 255, 255, 0.9)",
      },
      fonts: {
        heading: "Montserrat, system-ui, sans-serif",
        body: "Open Sans, system-ui, sans-serif",
      },
      spacing: {
        sectionPadding: "60px 0",
        cardGap: "20px",
        containerMaxWidth: "1400px",
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
          style: "split",
          height: "450px",
        },
        productCard: {
          style: "detailed",
          showPrice: true,
          showRating: true,
          showDescription: false,
          borderRadius: "16px",
        },
        navigation: {
          style: "sticky",
          backgroundColor: "#FF6B35",
        },
      },
      textStyles: {
        heading1: {
          fontSize: "3rem",
          fontWeight: "900",
          letterSpacing: "-0.03em",
          lineHeight: "1.1",
          textTransform: "uppercase",
        },
        heading2: {
          fontSize: "2.5rem",
          fontWeight: "800",
          letterSpacing: "-0.02em",
          lineHeight: "1.2",
          textTransform: "uppercase",
        },
        body: {
          fontSize: "1rem",
          fontWeight: "500",
          letterSpacing: "0.01em",
          lineHeight: "1.5",
        },
        heroBanner: {
          titleSize: "4.5rem",
          titleWeight: "900",
          subtitleSize: "2rem",
          subtitleWeight: "700",
          textShadow: "4px 4px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)",
        },
      },
      backgroundStyle: {
        type: "mesh-gradient",
        animation: {
          enabled: true,
          duration: "12s",
          easing: "ease",
        },
      },
    },
    cssVariables: {
      "--template-primary": "#FF6B35",
      "--template-secondary": "#004E89",
      "--template-accent": "#FFD23F",
      "--template-background": "transparent",
      "--template-text": "#1A1A1A",
      "--template-text-secondary": "#4A4A4A",
      "--template-border": "#FF6B35",
      "--template-card-bg": "rgba(255, 255, 255, 0.9)",
      "--template-font-heading": "Montserrat, system-ui, sans-serif",
      "--template-font-body": "Open Sans, system-ui, sans-serif",
      "--template-spacing-section": "60px 0",
      "--template-spacing-card-gap": "20px",
      "--template-container-width": "1400px",
      "--template-card-radius": "16px",
      "--template-banner-height": "450px",
    },
    componentMapping: {
      heroBanner: "split",
      productCard: "detailed",
      navigation: "sticky",
      footer: "bold",
    },
  },
  {
    name: "Zen",
    slug: "zen",
    description: "A calm, minimalist template with soothing colors and clean design. Perfect for wellness brands, organic products, and businesses that value simplicity and tranquility.",
    category: "minimal",
    isDefault: false,
    isActive: true,
    version: "2.0.0",
    author: "Evega Team",
    templateConfig: {
      colors: {
        primary: "#5D8A7E",
        secondary: "#A8C5A0",
        accent: "#E8D5B7",
        background: "transparent",
        text: "#2D3436",
        textSecondary: "#636E72",
        border: "#A8C5A0",
        cardBackground: "rgba(255, 255, 255, 0.9)",
      },
      fonts: {
        heading: "Inter, system-ui, sans-serif",
        body: "Inter, system-ui, sans-serif",
      },
      spacing: {
        sectionPadding: "80px 0",
        cardGap: "24px",
        containerMaxWidth: "1200px",
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
          style: "minimal",
          height: "400px",
        },
        productCard: {
          style: "minimal",
          showPrice: true,
          showRating: false,
          showDescription: false,
          borderRadius: "8px",
        },
        navigation: {
          style: "top",
          backgroundColor: "#5D8A7E",
        },
      },
      textStyles: {
        heading1: {
          fontSize: "2.25rem",
          fontWeight: "600",
          letterSpacing: "0",
          lineHeight: "1.4",
          textTransform: "none",
        },
        heading2: {
          fontSize: "1.875rem",
          fontWeight: "600",
          letterSpacing: "0",
          lineHeight: "1.5",
          textTransform: "none",
        },
        body: {
          fontSize: "1rem",
          fontWeight: "400",
          letterSpacing: "0.01em",
          lineHeight: "1.75",
        },
        heroBanner: {
          titleSize: "3rem",
          titleWeight: "600",
          subtitleSize: "1.25rem",
          subtitleWeight: "400",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 0, 0, 0.4)",
        },
      },
      backgroundStyle: {
        type: "mesh-gradient",
        animation: {
          enabled: true,
          duration: "18s",
          easing: "ease",
        },
      },
    },
    cssVariables: {
      "--template-primary": "#5D8A7E",
      "--template-secondary": "#A8C5A0",
      "--template-accent": "#E8D5B7",
      "--template-background": "transparent",
      "--template-text": "#2D3436",
      "--template-text-secondary": "#636E72",
      "--template-border": "#A8C5A0",
      "--template-card-bg": "rgba(255, 255, 255, 0.9)",
      "--template-font-heading": "Inter, system-ui, sans-serif",
      "--template-font-body": "Inter, system-ui, sans-serif",
      "--template-spacing-section": "80px 0",
      "--template-spacing-card-gap": "24px",
      "--template-container-width": "1200px",
      "--template-card-radius": "8px",
      "--template-banner-height": "400px",
    },
    componentMapping: {
      heroBanner: "minimal",
      productCard: "minimal",
      navigation: "top",
      footer: "minimal",
    },
  },
];

/**
 * Seed templates into the database
 */
export async function seedTemplates(payload: Payload): Promise<void> {
  console.log("🌱 Seeding vendor templates...");

  // First, delete all existing templates
  console.log("🗑️  Removing existing templates...");
  const existingTemplates = await payload.find({
    collection: "vendor-templates",
    limit: 100,
  });

  for (const template of existingTemplates.docs) {
    await payload.delete({
      collection: "vendor-templates",
      id: template.id,
    });
    console.log(`  ❌ Deleted: ${template.name}`);
  }

  // Now create new templates
  for (const templateData of templateSeeds) {
    try {
      // Create template
      const template = await payload.create({
        collection: "vendor-templates",
        draft: false,
        data: {
          name: templateData.name,
          slug: templateData.slug,
          description: templateData.description,
          category: templateData.category,
          isDefault: templateData.isDefault,
          isActive: templateData.isActive,
          version: templateData.version,
          author: templateData.author,
          templateConfig: templateData.templateConfig,
          cssVariables: templateData.cssVariables,
          componentMapping: templateData.componentMapping,
        },
      });

      console.log(`✅ Created template: ${templateData.name} (${template.id})`);
    } catch (error) {
      console.error(`❌ Error creating template "${templateData.name}":`, error);
    }
  }

  console.log("✨ Template seeding complete!");
}

/**
 * Get default template
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
    throw new Error("No default template found. Please seed templates first.");
  }

  return result.docs[0];
}
