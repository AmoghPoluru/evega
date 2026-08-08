import { endOfDay, format, startOfMonth, startOfWeek } from "date-fns";
import type { BasePayload } from "payload";

export const PRODUCT_SNAPSHOT_METRICS = [
  {
    id: "ordered" as const,
    label: "Most sold",
    shortLabel: "Sold",
    description: "Units sold from orders",
  },
  {
    id: "liked" as const,
    label: "Most liked",
    shortLabel: "Liked",
    description: "Customer likes on your products",
  },
  {
    id: "visited" as const,
    label: "Most visited",
    shortLabel: "Visited",
    description: "Logged-in product page views",
  },
  {
    id: "favorited" as const,
    label: "Most favorited",
    shortLabel: "Favorited",
    description: "Products saved to favorites",
  },
] as const;

export type ProductSnapshotMetricId = (typeof PRODUCT_SNAPSHOT_METRICS)[number]["id"];

export type ProductSnapshotPeriod = "week" | "month" | "all";

export const PRODUCT_SNAPSHOT_PERIODS = [
  { id: "week" as const, label: "This week" },
  { id: "month" as const, label: "This month" },
  { id: "all" as const, label: "All time" },
] as const;

export type ProductSnapshotMetricSummary = {
  id: ProductSnapshotMetricId;
  label: string;
  shortLabel: string;
  total: number;
  topProductId: string | null;
  topProductName: string | null;
  topCount: number;
};

export type ProductSnapshotRow = {
  productId: string;
  name: string;
  imageUrl: string | null;
  sold: number;
  liked: number;
  visited: number;
  favorited: number;
};

export type VendorProductSnapshot = {
  totalProducts: number;
  metrics: ProductSnapshotMetricSummary[];
};

export type VendorProductSnapshotPageResult = {
  period: ProductSnapshotPeriod;
  periodLabel: string;
  metric: ProductSnapshotMetricId;
  totalProducts: number;
  summary: {
    sold: number;
    liked: number;
    visited: number;
    favorited: number;
  };
  rows: ProductSnapshotRow[];
};

function getRelationshipId(value: string | { id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

export function getSnapshotPeriodRange(period: ProductSnapshotPeriod): {
  start: Date | null;
  end: Date;
  label: string;
} {
  const now = new Date();
  const end = endOfDay(now);

  if (period === "all") {
    return { start: null, end, label: "All time" };
  }

  if (period === "month") {
    const start = startOfMonth(now);
    return {
      start,
      end,
      label: `${format(start, "MMM d")} – ${format(now, "MMM d, yyyy")}`,
    };
  }

  const start = startOfWeek(now, { weekStartsOn: 1 });
  return {
    start,
    end,
    label: `${format(start, "MMM d")} – ${format(now, "MMM d, yyyy")}`,
  };
}

function isWithinPeriod(date: Date, start: Date | null, end: Date): boolean {
  if (start && date < start) return false;
  return date <= end;
}

function incrementCount(map: Map<string, number>, productId: string, amount: number): void {
  map.set(productId, (map.get(productId) ?? 0) + amount);
}

function summarizeCounts(
  counts: Map<string, number>,
  productNames: Map<string, string>,
  metric: (typeof PRODUCT_SNAPSHOT_METRICS)[number],
): ProductSnapshotMetricSummary {
  let topProductId: string | null = null;
  let topCount = 0;
  let total = 0;

  for (const [productId, count] of counts.entries()) {
    total += count;
    if (count > topCount) {
      topCount = count;
      topProductId = productId;
    }
  }

  return {
    id: metric.id,
    label: metric.label,
    shortLabel: metric.shortLabel,
    total,
    topProductId,
    topProductName: topProductId ? productNames.get(topProductId) ?? null : null,
    topCount,
  };
}

type OrderDoc = {
  status?: string | null;
  createdAt?: string | null;
  isManualRevenueEntry?: boolean | null;
  manualSaleDate?: string | null;
  product?: string | { id?: string } | null;
  quantity?: number | null;
  lineItems?:
    | {
        product?: string | { id?: string } | null;
        quantity?: number | null;
      }[]
    | null;
};

type InteractionDoc = {
  product?: string | { id?: string } | null;
  createdAt?: string | null;
  lastViewedAt?: string | null;
};

type ProductDoc = {
  id: string;
  name?: string | null;
  image?: string | { url?: string | null } | null;
};

function getOrderActivityDate(order: OrderDoc): Date {
  if (order.isManualRevenueEntry && order.manualSaleDate) {
    return new Date(order.manualSaleDate);
  }
  return new Date(order.createdAt ?? Date.now());
}

function getProductImageUrl(product: ProductDoc): string | null {
  if (typeof product.image === "object" && product.image?.url) {
    return product.image.url;
  }
  return null;
}

async function aggregateVendorProductMetrics(
  db: BasePayload,
  vendorId: string,
  period: ProductSnapshotPeriod,
): Promise<{
  totalProducts: number;
  productNames: Map<string, string>;
  productImages: Map<string, string | null>;
  orderedCounts: Map<string, number>;
  likedCounts: Map<string, number>;
  visitedCounts: Map<string, number>;
  favoritedCounts: Map<string, number>;
}> {
  const { start, end } = getSnapshotPeriodRange(period);

  const productsResult = await db.find({
    collection: "products",
    where: {
      vendor: { equals: vendorId },
      isArchived: { equals: false },
    },
    limit: 10000,
    depth: 1,
    overrideAccess: true,
  });

  const productNames = new Map<string, string>();
  const productImages = new Map<string, string | null>();
  const productIds: string[] = [];

  for (const doc of productsResult.docs as ProductDoc[]) {
    productIds.push(doc.id);
    productNames.set(doc.id, doc.name ?? "Unnamed product");
    productImages.set(doc.id, getProductImageUrl(doc));
  }

  const orderedCounts = new Map<string, number>();
  const likedCounts = new Map<string, number>();
  const visitedCounts = new Map<string, number>();
  const favoritedCounts = new Map<string, number>();

  if (productIds.length > 0) {
    const [ordersResult, viewsResult, likesResult, favoritesResult] = await Promise.all([
      db.find({
        collection: "orders",
        where: {
          vendor: { equals: vendorId },
          status: { not_equals: "canceled" },
        },
        limit: 10000,
        depth: 0,
        overrideAccess: true,
      }),
      db.find({
        collection: "product-views",
        where: { vendor: { equals: vendorId } },
        limit: 10000,
        depth: 0,
        overrideAccess: true,
      }),
      db.find({
        collection: "product-likes",
        where: { product: { in: productIds } },
        limit: 10000,
        depth: 0,
        overrideAccess: true,
      }),
      db.find({
        collection: "favorites",
        where: { product: { in: productIds } },
        limit: 10000,
        depth: 0,
        overrideAccess: true,
      }),
    ]);

    for (const orderDoc of ordersResult.docs as OrderDoc[]) {
      const activityDate = getOrderActivityDate(orderDoc);
      if (!isWithinPeriod(activityDate, start, end)) continue;

      const lineItems = orderDoc.lineItems ?? [];
      if (lineItems.length > 0) {
        for (const line of lineItems) {
          const productId = getRelationshipId(line.product ?? null);
          if (!productId || !productNames.has(productId)) continue;
          incrementCount(orderedCounts, productId, line.quantity ?? 1);
        }
        continue;
      }

      const productId = getRelationshipId(orderDoc.product ?? null);
      if (!productId || !productNames.has(productId)) continue;
      incrementCount(orderedCounts, productId, orderDoc.quantity ?? 1);
    }

    for (const viewDoc of viewsResult.docs as InteractionDoc[]) {
      const viewedAt = new Date(viewDoc.lastViewedAt ?? viewDoc.createdAt ?? Date.now());
      if (!isWithinPeriod(viewedAt, start, end)) continue;

      const productId = getRelationshipId(viewDoc.product ?? null);
      if (!productId || !productNames.has(productId)) continue;
      incrementCount(visitedCounts, productId, 1);
    }

    for (const likeDoc of likesResult.docs as InteractionDoc[]) {
      const likedAt = new Date(likeDoc.createdAt ?? Date.now());
      if (!isWithinPeriod(likedAt, start, end)) continue;

      const productId = getRelationshipId(likeDoc.product ?? null);
      if (!productId || !productNames.has(productId)) continue;
      incrementCount(likedCounts, productId, 1);
    }

    for (const favoriteDoc of favoritesResult.docs as InteractionDoc[]) {
      const favoritedAt = new Date(favoriteDoc.createdAt ?? Date.now());
      if (!isWithinPeriod(favoritedAt, start, end)) continue;

      const productId = getRelationshipId(favoriteDoc.product ?? null);
      if (!productId || !productNames.has(productId)) continue;
      incrementCount(favoritedCounts, productId, 1);
    }
  }

  return {
    totalProducts: productIds.length,
    productNames,
    productImages,
    orderedCounts,
    likedCounts,
    visitedCounts,
    favoritedCounts,
  };
}

function metricValueForProduct(
  metric: ProductSnapshotMetricId,
  productId: string,
  counts: {
    orderedCounts: Map<string, number>;
    likedCounts: Map<string, number>;
    visitedCounts: Map<string, number>;
    favoritedCounts: Map<string, number>;
  },
): number {
  switch (metric) {
    case "ordered":
      return counts.orderedCounts.get(productId) ?? 0;
    case "liked":
      return counts.likedCounts.get(productId) ?? 0;
    case "visited":
      return counts.visitedCounts.get(productId) ?? 0;
    case "favorited":
      return counts.favoritedCounts.get(productId) ?? 0;
  }
}

export async function getVendorProductSnapshot(
  db: BasePayload,
  vendorId: string,
): Promise<VendorProductSnapshot> {
  const aggregated = await aggregateVendorProductMetrics(db, vendorId, "all");

  const countMaps: Record<ProductSnapshotMetricId, Map<string, number>> = {
    ordered: aggregated.orderedCounts,
    liked: aggregated.likedCounts,
    visited: aggregated.visitedCounts,
    favorited: aggregated.favoritedCounts,
  };

  return {
    totalProducts: aggregated.totalProducts,
    metrics: PRODUCT_SNAPSHOT_METRICS.map((metric) =>
      summarizeCounts(countMaps[metric.id], aggregated.productNames, metric),
    ),
  };
}

export async function getVendorProductSnapshotPage(
  db: BasePayload,
  vendorId: string,
  input: {
    period: ProductSnapshotPeriod;
    metric: ProductSnapshotMetricId;
    search?: string;
  },
): Promise<VendorProductSnapshotPageResult> {
  const { label: periodLabel } = getSnapshotPeriodRange(input.period);
  const aggregated = await aggregateVendorProductMetrics(db, vendorId, input.period);

  const searchLower = input.search?.trim().toLowerCase();

  const rows: ProductSnapshotRow[] = [...aggregated.productNames.entries()]
    .filter(([_, name]) => !searchLower || name.toLowerCase().includes(searchLower))
    .map(([productId, name]) => ({
      productId,
      name,
      imageUrl: aggregated.productImages.get(productId) ?? null,
      sold: aggregated.orderedCounts.get(productId) ?? 0,
      liked: aggregated.likedCounts.get(productId) ?? 0,
      visited: aggregated.visitedCounts.get(productId) ?? 0,
      favorited: aggregated.favoritedCounts.get(productId) ?? 0,
    }))
    .sort((a, b) => {
      const metricDiff =
        metricValueForProduct(input.metric, b.productId, aggregated) -
        metricValueForProduct(input.metric, a.productId, aggregated);
      if (metricDiff !== 0) return metricDiff;
      return a.name.localeCompare(b.name);
    });

  const sumMap = (map: Map<string, number>) =>
    [...map.values()].reduce((sum, value) => sum + value, 0);

  return {
    period: input.period,
    periodLabel,
    metric: input.metric,
    totalProducts: aggregated.totalProducts,
    summary: {
      sold: sumMap(aggregated.orderedCounts),
      liked: sumMap(aggregated.likedCounts),
      visited: sumMap(aggregated.visitedCounts),
      favorited: sumMap(aggregated.favoritedCounts),
    },
    rows,
  };
}
