/**
 * Vendor Template Seed Data
 * 
 * This file contains 4 pre-built templates with vibrant mesh gradient backgrounds.
 * Run this seed script to populate the vendor-templates collection.
 */

import type { Payload } from "payload";
import { getThemeManifests, manifestToSeedPayload } from "./manifests/registry";

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
    /** Structural layout identifier used to pick a storefront layout component. */
    layout: string;
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
      layout: "default",
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
      layout: "default",
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
      layout: "default",
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
      layout: "default",
      heroBanner: "minimal",
      productCard: "minimal",
      navigation: "top",
      footer: "minimal",
    },
  },
  {
    name: "Reloop",
    slug: "reloop",
    description: "A social resale storefront built around a dense, image-first square grid and a seller-forward profile header. Ideal for pre-loved fashion, thrift, and community-driven shops where the products and the seller do the talking.",
    category: "colorful",
    isDefault: false,
    isActive: true,
    version: "1.0.0",
    author: "Evega Team",
    templateConfig: {
      colors: {
        primary: "#111111",
        secondary: "#FF2D55",
        accent: "#FF2D55",
        background: "#FFFFFF",
        text: "#111111",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        cardBackground: "#FFFFFF",
      },
      fonts: {
        heading: "Inter, system-ui, sans-serif",
        body: "Inter, system-ui, sans-serif",
      },
      spacing: {
        sectionPadding: "32px 0",
        cardGap: "8px",
        containerMaxWidth: "1280px",
      },
      layout: {
        productGridColumns: 5,
        showBanner: false,
        showCategories: false,
        showFilters: false,
        showReviews: false,
      },
      components: {
        heroBanner: {
          style: "minimal",
          height: "0px",
        },
        productCard: {
          style: "compact",
          showPrice: true,
          showRating: false,
          showDescription: false,
          borderRadius: "4px",
        },
        navigation: {
          style: "top",
          backgroundColor: "#FFFFFF",
        },
      },
      textStyles: {
        heading1: {
          fontSize: "1.75rem",
          fontWeight: "700",
          letterSpacing: "-0.01em",
          lineHeight: "1.2",
          textTransform: "none",
        },
        heading2: {
          fontSize: "1.25rem",
          fontWeight: "600",
          letterSpacing: "0",
          lineHeight: "1.3",
          textTransform: "none",
        },
        body: {
          fontSize: "0.9375rem",
          fontWeight: "400",
          letterSpacing: "0",
          lineHeight: "1.5",
        },
      },
      backgroundStyle: {
        type: "solid",
        value: "#FFFFFF",
        animation: {
          enabled: false,
        },
      },
    },
    cssVariables: {
      "--template-primary": "#111111",
      "--template-secondary": "#FF2D55",
      "--template-accent": "#FF2D55",
      "--template-background": "#FFFFFF",
      "--template-text": "#111111",
      "--template-text-secondary": "#6B7280",
      "--template-border": "#E5E7EB",
      "--template-card-bg": "#FFFFFF",
      "--template-font-heading": "Inter, system-ui, sans-serif",
      "--template-font-body": "Inter, system-ui, sans-serif",
      "--template-spacing-section": "32px 0",
      "--template-spacing-card-gap": "8px",
      "--template-container-width": "1280px",
      "--template-card-radius": "4px",
      "--template-banner-height": "0px",
    },
    componentMapping: {
      layout: "reloop",
      heroBanner: "minimal",
      productCard: "compact",
      navigation: "top",
      footer: "minimal",
    },
  },
  {
    name: "Emporium",
    slug: "emporium",
    description: "A dense catalog storefront with a persistent top search bar, a left-hand category and filter rail, and a rating-heavy product grid. Perfect for high-volume shops that carry a broad range of products across many categories.",
    category: "classic",
    isDefault: false,
    isActive: true,
    version: "1.0.0",
    author: "Evega Team",
    templateConfig: {
      colors: {
        primary: "#131921",
        secondary: "#232F3E",
        accent: "#F0A020",
        background: "#EAEDED",
        text: "#0F1111",
        textSecondary: "#565959",
        border: "#D5D9D9",
        cardBackground: "#FFFFFF",
      },
      fonts: {
        heading: "Inter, Arial, system-ui, sans-serif",
        body: "Inter, Arial, system-ui, sans-serif",
      },
      spacing: {
        sectionPadding: "24px 0",
        cardGap: "16px",
        containerMaxWidth: "1500px",
      },
      layout: {
        productGridColumns: 4,
        showBanner: false,
        showCategories: true,
        showFilters: true,
        showReviews: true,
      },
      components: {
        heroBanner: {
          style: "minimal",
          height: "0px",
        },
        productCard: {
          style: "detailed",
          showPrice: true,
          showRating: true,
          showDescription: true,
          borderRadius: "8px",
        },
        navigation: {
          style: "sidebar",
          backgroundColor: "#131921",
        },
      },
      textStyles: {
        heading1: {
          fontSize: "1.5rem",
          fontWeight: "700",
          letterSpacing: "0",
          lineHeight: "1.3",
          textTransform: "none",
        },
        heading2: {
          fontSize: "1.25rem",
          fontWeight: "700",
          letterSpacing: "0",
          lineHeight: "1.3",
          textTransform: "none",
        },
        body: {
          fontSize: "0.875rem",
          fontWeight: "400",
          letterSpacing: "0",
          lineHeight: "1.5",
        },
      },
      backgroundStyle: {
        type: "solid",
        value: "#EAEDED",
        animation: {
          enabled: false,
        },
      },
    },
    cssVariables: {
      "--template-primary": "#131921",
      "--template-secondary": "#232F3E",
      "--template-accent": "#F0A020",
      "--template-background": "#EAEDED",
      "--template-text": "#0F1111",
      "--template-text-secondary": "#565959",
      "--template-border": "#D5D9D9",
      "--template-card-bg": "#FFFFFF",
      "--template-font-heading": "Inter, Arial, system-ui, sans-serif",
      "--template-font-body": "Inter, Arial, system-ui, sans-serif",
      "--template-spacing-section": "24px 0",
      "--template-spacing-card-gap": "16px",
      "--template-container-width": "1500px",
      "--template-card-radius": "8px",
      "--template-banner-height": "0px",
    },
    componentMapping: {
      layout: "emporium",
      heroBanner: "minimal",
      productCard: "detailed",
      navigation: "sidebar",
      footer: "classic",
    },
  },
  {
    name: "Runway",
    slug: "runway",
    description: "An editorial fashion lookbook with full-bleed banners and oversized alternating product tiles. Designed for boutiques and designers who want a magazine-style, image-led presentation.",
    category: "elegant",
    isDefault: false,
    isActive: true,
    version: "1.0.0",
    author: "Evega Team",
    templateConfig: {
      colors: {
        primary: "#0A0A0A",
        secondary: "#8A7A66",
        accent: "#C9A227",
        background: "#F7F5F2",
        text: "#0A0A0A",
        textSecondary: "#6B6B6B",
        border: "#E2DDD6",
        cardBackground: "#FFFFFF",
      },
      fonts: {
        heading: "Playfair Display, Georgia, serif",
        body: "Inter, system-ui, sans-serif",
      },
      spacing: {
        sectionPadding: "96px 0",
        cardGap: "48px",
        containerMaxWidth: "1440px",
      },
      layout: {
        productGridColumns: 2,
        showBanner: true,
        showCategories: false,
        showFilters: false,
        showReviews: false,
      },
      components: {
        heroBanner: {
          style: "full-width",
          height: "640px",
        },
        productCard: {
          style: "detailed",
          showPrice: true,
          showRating: false,
          showDescription: true,
          borderRadius: "0px",
        },
        navigation: {
          style: "sticky",
          backgroundColor: "#0A0A0A",
        },
      },
      textStyles: {
        heading1: {
          fontSize: "4rem",
          fontWeight: "700",
          letterSpacing: "0.02em",
          lineHeight: "1.05",
          textTransform: "uppercase",
        },
        heading2: {
          fontSize: "2.5rem",
          fontWeight: "600",
          letterSpacing: "0.02em",
          lineHeight: "1.15",
          textTransform: "none",
        },
        body: {
          fontSize: "1.0625rem",
          fontWeight: "400",
          letterSpacing: "0.01em",
          lineHeight: "1.7",
        },
        heroBanner: {
          titleSize: "5rem",
          titleWeight: "700",
          subtitleSize: "1.5rem",
          subtitleWeight: "400",
          textShadow: "2px 2px 12px rgba(0, 0, 0, 0.7)",
        },
      },
      backgroundStyle: {
        type: "solid",
        value: "#F7F5F2",
        animation: {
          enabled: false,
        },
      },
    },
    cssVariables: {
      "--template-primary": "#0A0A0A",
      "--template-secondary": "#8A7A66",
      "--template-accent": "#C9A227",
      "--template-background": "#F7F5F2",
      "--template-text": "#0A0A0A",
      "--template-text-secondary": "#6B6B6B",
      "--template-border": "#E2DDD6",
      "--template-card-bg": "#FFFFFF",
      "--template-font-heading": "Playfair Display, Georgia, serif",
      "--template-font-body": "Inter, system-ui, sans-serif",
      "--template-spacing-section": "96px 0",
      "--template-spacing-card-gap": "48px",
      "--template-container-width": "1440px",
      "--template-card-radius": "0px",
      "--template-banner-height": "640px",
    },
    componentMapping: {
      layout: "runway",
      heroBanner: "full-width",
      productCard: "detailed",
      navigation: "sticky",
      footer: "elegant",
    },
  },
];

/**
 * Seed templates into the database (upsert by slug — preserves IDs and vendor selections).
 */
export async function seedTemplates(payload: Payload): Promise<void> {
  console.log("🌱 Seeding vendor templates...");

  const manifests = getThemeManifests();
  const manifestSlugs = new Set(manifests.map((manifest) => manifest.slug));

  for (const manifest of manifests) {
    try {
      const payloadData = manifestToSeedPayload(manifest);

      const existing = await payload.find({
        collection: "vendor-templates",
        where: { slug: { equals: manifest.slug } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        const template = await payload.update({
          collection: "vendor-templates",
          id: existing.docs[0].id,
          data: payloadData,
        });
        console.log(`✅ Updated template: ${manifest.name} (${template.id})`);
      } else {
        const template = await payload.create({
          collection: "vendor-templates",
          draft: false,
          data: payloadData,
        });
        console.log(`✅ Created template: ${manifest.name} (${template.id})`);
      }
    } catch (error) {
      console.error(`❌ Error seeding template "${manifest.name}":`, error);
    }
  }

  // Remove orphaned catalog templates not in the manifest set
  const allTemplates = await payload.find({
    collection: "vendor-templates",
    where: { owner: { exists: false } },
    limit: 100,
  });

  for (const template of allTemplates.docs) {
    if (!manifestSlugs.has(template.slug)) {
      await payload.delete({
        collection: "vendor-templates",
        id: template.id,
      });
      console.log(`  🗑️  Removed orphaned template: ${template.name}`);
    }
  }

  console.log("✨ Template seeding complete!");
}
