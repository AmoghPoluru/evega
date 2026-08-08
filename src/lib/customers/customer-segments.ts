export const CUSTOMER_SEGMENT_IDS = ["visitor", "completed", "pending"] as const;

export type CustomerSegmentId = (typeof CUSTOMER_SEGMENT_IDS)[number];

export const CUSTOMER_FILTER_IDS = [...CUSTOMER_SEGMENT_IDS, "top"] as const;

export type CustomerFilterId = (typeof CUSTOMER_FILTER_IDS)[number];

export const TOP_CUSTOMERS_CARD = {
  id: "top" as const,
  label: "Top customers",
  shortLabel: "Top",
  description: "Confirmed buyers who spend the most with you — your best customers",
} as const;

export const CUSTOMER_SEGMENTS = [
  {
    id: "visitor" as const,
    label: "Potential customers",
    shortLabel: "Potential",
    description: "Logged-in shoppers who viewed your products but have not ordered yet",
  },
  {
    id: "pending" as const,
    label: "Open order customers",
    shortLabel: "Open order customer",
    description:
      "Customers with orders not marked complete yet — payment or fulfillment still in progress",
  },
  {
    id: "completed" as const,
    label: "Confirmed loyal customers",
    shortLabel: "Confirmed loyal",
    description: "Completed at least one sale with you — confirmed buyers you can count on",
  },
] as const;

export const OPEN_ORDER_STATUSES = ["pending", "payment_done", "processing"] as const;

export function getCustomerSegmentLabel(segment: CustomerSegmentId): string {
  return CUSTOMER_SEGMENTS.find((item) => item.id === segment)?.label ?? segment;
}

export function getCustomerSegmentShortLabel(segment: CustomerSegmentId): string {
  return CUSTOMER_SEGMENTS.find((item) => item.id === segment)?.shortLabel ?? segment;
}

type OrderLike = {
  status?: string | null;
};

export function classifyCustomerSegments(
  orders: OrderLike[],
  hasProductViews: boolean,
): CustomerSegmentId[] {
  const activeOrders = orders.filter(
    (order) => order.status !== "canceled" && order.status !== "refunded",
  );

  const segments: CustomerSegmentId[] = [];
  const hasCompleted = activeOrders.some((order) => order.status === "complete");
  const hasPending = activeOrders.some((order) =>
    (OPEN_ORDER_STATUSES as readonly string[]).includes(order.status ?? ""),
  );

  if (hasCompleted) {
    segments.push("completed");
  }

  if (hasPending) {
    segments.push("pending");
  }

  if (hasProductViews && activeOrders.length === 0) {
    segments.push("visitor");
  }

  return segments;
}

export function getPrimaryCustomerSegment(
  segments: CustomerSegmentId[],
): CustomerSegmentId | null {
  if (segments.includes("completed")) return "completed";
  if (segments.includes("pending")) return "pending";
  if (segments.includes("visitor")) return "visitor";
  return null;
}

export function customerMatchesSegmentFilter(
  displaySegment: CustomerSegmentId | null,
  filter: CustomerFilterId | "all",
  options: { isTopCustomer?: boolean } = {},
): boolean {
  if (filter === "all") return true;
  if (filter === "top") return Boolean(options.isTopCustomer);
  return displaySegment === filter;
}

type TopCustomerCandidate = {
  customerId: string;
  segments: CustomerSegmentId[];
  totalSpent: number;
};

/** Top tier = confirmed buyers in the top 25% by amount paid (at least one). */
export function computeTopCustomerIds(customers: TopCustomerCandidate[]): Set<string> {
  const loyalWithSales = customers.filter(
    (customer) => customer.segments.includes("completed") && customer.totalSpent > 0,
  );

  if (loyalWithSales.length === 0) {
    return new Set();
  }

  const ranked = [...loyalWithSales].sort((a, b) => b.totalSpent - a.totalSpent);
  const topCount = Math.max(1, Math.ceil(ranked.length * 0.25));

  return new Set(ranked.slice(0, topCount).map((customer) => customer.customerId));
}
