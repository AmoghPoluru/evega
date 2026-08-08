/** Industry vertical tags for vendor theme discovery. */
export const THEME_INDUSTRY_IDS = [
  "general",
  "fashion-boutique",
  "ethnic-apparel",
  "ethnic-heritage",
  "luxury",
  "catalog",
  "neighborhood-retail",
  "marketplace",
  "social-resale",
  "home-lifestyle",
  "wellness",
  "events-promo",
] as const;

export type ThemeIndustryId = (typeof THEME_INDUSTRY_IDS)[number];

export type ThemeIndustryDefinition = {
  id: ThemeIndustryId;
  label: string;
  description: string;
};

export const THEME_INDUSTRIES: ThemeIndustryDefinition[] = [
  {
    id: "general",
    label: "General retail",
    description: "Works for most women's wear and mixed catalogs",
  },
  {
    id: "fashion-boutique",
    label: "Fashion boutique",
    description: "Editorial, curated, premium apparel",
  },
  {
    id: "ethnic-apparel",
    label: "Ethnic & festive",
    description: "Sarees, lehengas, festive collections",
  },
  {
    id: "ethnic-heritage",
    label: "Heritage & handloom",
    description: "Traditional crafts, artisan, cultural brands",
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "High-end, dark premium, jewelry-adjacent",
  },
  {
    id: "catalog",
    label: "Large catalog",
    description: "Dense shops with search and many SKUs",
  },
  {
    id: "neighborhood-retail",
    label: "Neighborhood / kirana",
    description: "Local shop, practical, trusted",
  },
  {
    id: "marketplace",
    label: "Marketplace / bazaar",
    description: "Multi-category, vibrant, high energy",
  },
  {
    id: "social-resale",
    label: "Social & resale",
    description: "Instagram-first, image gallery sellers",
  },
  {
    id: "home-lifestyle",
    label: "Home & lifestyle",
    description: "Warm, home, décor, lifestyle products",
  },
  {
    id: "wellness",
    label: "Wellness & calm",
    description: "Minimal, spa-like, quiet brands",
  },
  {
    id: "events-promo",
    label: "Events & promos",
    description: "Flash sales, launches, bold campaigns",
  },
];

export function isThemeIndustryId(value: string | null | undefined): value is ThemeIndustryId {
  return Boolean(value && THEME_INDUSTRY_IDS.includes(value as ThemeIndustryId));
}

export function getThemeIndustryLabel(id: string | null | undefined): string | null {
  if (!isThemeIndustryId(id)) return null;
  return THEME_INDUSTRIES.find((item) => item.id === id)?.label ?? null;
}

/** Registered layout ids used when fixing legacy `modular` mappings. */
export type RegisteredLayoutId = "default" | "collection" | "emporium" | "runway" | "reloop";

export type ThemeCatalogEntry = {
  slug: string;
  industry: ThemeIndustryId;
  /** Shown in the main vendor theme picker (curated set). */
  isFeatured: boolean;
  /** Suggested default layout when vendor has no layout override. */
  defaultLayout: RegisteredLayoutId;
  /** Deactivate duplicate or retired themes (kept in DB, not deleted). */
  isActive: boolean;
  /** Optional picker sort — lower appears first among featured themes. */
  sortOrder: number;
};

/**
 * Source of truth for theme overhaul metadata.
 * Migrated to vendor-templates docs via scripts/overhaul-vendor-themes.ts
 */
export const THEME_CATALOG: ThemeCatalogEntry[] = [
  { slug: "fun", industry: "general", isFeatured: true, defaultLayout: "default", isActive: true, sortOrder: 10 },
  { slug: "elegant", industry: "general", isFeatured: true, defaultLayout: "default", isActive: true, sortOrder: 20 },
  { slug: "bold", industry: "general", isFeatured: true, defaultLayout: "default", isActive: true, sortOrder: 30 },
  { slug: "zen", industry: "wellness", isFeatured: true, defaultLayout: "default", isActive: true, sortOrder: 40 },
  { slug: "reloop", industry: "social-resale", isFeatured: true, defaultLayout: "reloop", isActive: true, sortOrder: 50 },
  { slug: "emporium", industry: "catalog", isFeatured: true, defaultLayout: "emporium", isActive: true, sortOrder: 60 },
  { slug: "runway", industry: "fashion-boutique", isFeatured: true, defaultLayout: "runway", isActive: true, sortOrder: 70 },
  { slug: "atelier", industry: "fashion-boutique", isFeatured: true, defaultLayout: "collection", isActive: true, sortOrder: 80 },
  { slug: "saree", industry: "ethnic-apparel", isFeatured: true, defaultLayout: "collection", isActive: true, sortOrder: 90 },
  { slug: "vault", industry: "luxury", isFeatured: true, defaultLayout: "runway", isActive: true, sortOrder: 100 },
  { slug: "dwell", industry: "home-lifestyle", isFeatured: true, defaultLayout: "default", isActive: true, sortOrder: 110 },
  { slug: "heritage", industry: "ethnic-heritage", isFeatured: true, defaultLayout: "collection", isActive: true, sortOrder: 120 },
  { slug: "bazaar", industry: "marketplace", isFeatured: true, defaultLayout: "emporium", isActive: true, sortOrder: 130 },
  { slug: "kirana", industry: "neighborhood-retail", isFeatured: true, defaultLayout: "emporium", isActive: true, sortOrder: 140 },
  { slug: "marquee", industry: "events-promo", isFeatured: true, defaultLayout: "default", isActive: true, sortOrder: 150 },

  // Retired from vendor picker — still in DB for existing vendors
  { slug: "elegant-white", industry: "fashion-boutique", isFeatured: false, defaultLayout: "collection", isActive: true, sortOrder: 200 },
  { slug: "fabric", industry: "fashion-boutique", isFeatured: false, defaultLayout: "default", isActive: true, sortOrder: 210 },
  { slug: "ritual", industry: "wellness", isFeatured: false, defaultLayout: "default", isActive: true, sortOrder: 220 },
  { slug: "studio", industry: "fashion-boutique", isFeatured: false, defaultLayout: "default", isActive: true, sortOrder: 230 },
  { slug: "savor", industry: "home-lifestyle", isFeatured: false, defaultLayout: "default", isActive: true, sortOrder: 240 },
  { slug: "tech", industry: "general", isFeatured: false, defaultLayout: "default", isActive: true, sortOrder: 250 },

  // Duplicate — fully deactivated
  { slug: "kirana-2", industry: "neighborhood-retail", isFeatured: false, defaultLayout: "emporium", isActive: false, sortOrder: 999 },
];

export function getThemeCatalogEntry(slug: string): ThemeCatalogEntry | undefined {
  return THEME_CATALOG.find((entry) => entry.slug === slug);
}

export const FEATURED_THEME_COUNT = THEME_CATALOG.filter((entry) => entry.isFeatured).length;