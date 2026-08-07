/** Shared vendor portal navigation and page titles (My … branding). */

export const vendorPortalBrandLabel = "My Website";

export function vendorStorefrontHref(slug: string | null | undefined): string {
  return slug ? `/vendors/${slug}` : "/vendor/dashboard";
}

/** Canonical public storefront base (shown to vendors and shared with customers). */
const VENDOR_STOREFRONT_PUBLIC_BASE =
  process.env.NEXT_PUBLIC_VENDOR_STOREFRONT_URL?.replace(/\/$/, "") ||
  "https://www.zvastra.com";

/** Public storefront URL for display in the vendor portal. */
export function vendorStorefrontDisplayUrl(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return `${VENDOR_STOREFRONT_PUBLIC_BASE}/vendors/${slug}`;
}

export const vendorNavLabels = {
  dashboard: "My Dashboard",
  customers: "My Customers",
  products: "My Products",
  orders: "My Orders",
  storeAppearance: "My Website Appearance",
  support: "Contact & chat with BDO",
  analytics: "My Analytics",
  payouts: "My Payouts",
  notifications: "My Notifications",
  settings: "My Settings",
} as const;

/** Collapsible sidebar section headers. */
export const vendorNavGroupLabels = {
  business: "My Business",
  store: "Customize my Website",
  support: "My Support",
  account: "My Account",
} as const;

export const vendorPageTitles = {
  dashboard: "My Dashboard",
  customers: "My Customers",
  products: "My Products",
  orders: "My Orders",
  orderDetail: "My Order",
  storeAppearance: "My Website Appearance",
  support: "My Support & Tasks",
  newSupportTask: "New Support Task",
  analytics: "My Analytics & Reports",
  settings: "My Settings",
  importProducts: "Import My Products",
  newProduct: "Create My Product",
  editProduct: "Edit My Product",
  customizeTemplate: "Customize My Template",
  createTemplate: "Create My Template",
} as const;

export const vendorBackLabels = {
  orders: "Back to My Orders",
  support: "Back to My Support & Tasks",
} as const;
