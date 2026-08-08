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
  expenses: "My Expenses",
  revenue: "My Revenue",
  storeAppearance: "My Website Appearance",
  analytics: "My Analytics",
  payouts: "My Payouts",
  notifications: "My Notifications",
  settings: "My Settings",
} as const;

/** Collapsible sidebar section headers. */
export const vendorNavGroupLabels = {
  business: "My Business",
  store: "Customize my Website",
  account: "My Account",
} as const;

export const vendorPageTitles = {
  dashboard: "My Dashboard",
  customers: "My Customers",
  products: "My Products",
  orders: "My Orders",
  orderDetail: "My Order",
  expenses: "My Expenses",
  revenue: "My Revenue",
  storeAppearance: "My Website Appearance",
  analytics: "My Analytics & Reports",
  settings: "My Settings",
  importProducts: "Import My Products",
  newProduct: "Create My Product",
  editProduct: "Edit My Product",
  customizeTemplate: "Customize My Template",
  createTemplate: "Create My Template",
  productSnapshot: "My Product Snapshot",
} as const;

export const vendorBackLabels = {
  orders: "Back to My Orders",
} as const;

/** Dashboard stat card titles (My … branding, paired with Health of My Business). */
export const vendorDashboardStatLabels = {
  businessHealth: "Health of My Business",
  businessHealthDescription: "Revenue from closed orders vs expenses",
  customers: "My Customers",
  customersDescription: "Potential, open order, confirmed loyal, and top customers",
  customersTotal: "Total in your list",
  productSnapshot: "My Product Snapshot",
  productSnapshotDescription: "Most ordered, liked, visited, and favorited products",
  productSnapshotTotal: "Active products",
  analytics: "My Analytics",
  analyticsDescription: "Today's orders, likes, potential customers, and business health",
  analyticsToday: "Today at a glance",
} as const;
