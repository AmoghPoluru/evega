/** Shared vendor portal navigation and page titles (shopkeeper-friendly wording). */

export const vendorPortalBrandLabel = "Your store";

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
  dashboard: "Dashboard",
  customers: "Customers",
  products: "Products",
  orders: "Orders",
  expenses: "Expenses",
  revenue: "Revenue",
  storeAppearance: "Store look",
  analytics: "Insights",
  payouts: "Connect payments",
  notifications: "Notifications",
  settings: "Settings",
  connectedChannels: "Post to social media",
} as const;

/** Collapsible sidebar section headers. */
export const vendorNavGroupLabels = {
  business: "Business",
  store: "Customize your store",
  account: "Account",
  more: "More",
} as const;

export const vendorPageTitles = {
  dashboard: "Dashboard",
  customers: "Customers",
  products: "Products",
  orders: "Orders",
  orderDetail: "Order",
  expenses: "Expenses",
  revenue: "Revenue",
  storeAppearance: "Store look",
  analytics: "Insights & reports",
  settings: "Settings",
  connectedChannels: "Post to social media",
  importProducts: "Import products",
  newProduct: "Add product",
  editProduct: "Edit product",
  customizeTemplate: "Customize template",
  createTemplate: "Create template",
  productSnapshot: "Product snapshot",
} as const;

export const vendorBackLabels = {
  orders: "Back to orders",
} as const;

/** Dashboard home — three calm at-a-glance metrics. */
export const vendorDashboardStatLabels = {
  todaysOrders: "Today's orders",
  pendingFulfillment: "Needs attention",
  activeProducts: "Active products",
  seeInsights: "See insights",
  businessHealth: "Business health",
  businessHealthDescription: "Revenue from closed orders vs expenses",
  customers: "Customers",
  customersDescription: "Potential, open order, confirmed loyal, and top customers",
  customersTotal: "Total in your list",
  productSnapshot: "Product snapshot",
  productSnapshotDescription: "Most ordered, liked, visited, and favorited products",
  productSnapshotTotal: "Active products",
  analytics: "Insights",
  analyticsDescription: "Today's orders, likes, potential customers, and business health",
  analyticsToday: "Today at a glance",
} as const;
