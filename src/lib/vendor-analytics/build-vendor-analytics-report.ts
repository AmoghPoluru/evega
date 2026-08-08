import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { BasePayload } from "payload";

import { buildVendorCustomerList } from "@/lib/customers/build-vendor-customer-list";
import { OPEN_ORDER_STATUSES } from "@/lib/customers/customer-segments";
import { getBusinessHealth } from "@/lib/vendor-dashboard/business-health";

export type VendorAnalyticsReportType = "daily" | "weekly" | "monthly";

type OrderDoc = {
  status?: string | null;
  paymentStatus?: string | null;
  total?: number | null;
  createdAt?: string | null;
  isManualRevenueEntry?: boolean | null;
  manualSaleDate?: string | null;
  product?: string | { id?: string } | null;
  quantity?: number | null;
};

type ProductDoc = {
  id: string;
  name?: string | null;
  stock?: number | null;
  price?: number | null;
};

type ExpenseDoc = {
  amount?: number | null;
  expenseDate?: string | null;
};

function getReportDateRange(reportType: VendorAnalyticsReportType): {
  start: Date;
  end: Date;
  label: string;
  phrase: string;
} {
  const now = new Date();

  if (reportType === "daily") {
    return {
      start: startOfDay(now),
      end: endOfDay(now),
      label: format(now, "EEEE, MMMM d, yyyy"),
      phrase: "Today",
    };
  }

  if (reportType === "weekly") {
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return {
      start,
      end,
      label: `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`,
      phrase: "This week",
    };
  }

  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return {
    start,
    end,
    label: format(now, "MMMM yyyy"),
    phrase: "This month",
  };
}

function getOrderActivityDate(order: OrderDoc): Date {
  if (order.isManualRevenueEntry && order.manualSaleDate) {
    return new Date(order.manualSaleDate);
  }
  return new Date(order.createdAt ?? Date.now());
}

function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function countLabel(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count.toLocaleString()} ${plural}`;
}

export type VendorAnalyticsReport = {
  orders: {
    total: number;
    revenue: number;
    averageOrderValue: number;
    openOrders: number;
    completedOrders: number;
    awaitingPayment: number;
    paymentCompleted: number;
    statusBreakdown: Record<string, number>;
    topProducts: Array<{ name: string; revenue: number; quantity: number }>;
  };
  engagement: {
    likes: number;
    favorites: number;
    views: number;
  };
  customers: {
    potential: number;
    openOrder: number;
    loyal: number;
    total: number;
  };
  businessHealth: {
    revenue: number;
    expenses: number;
    netProfit: number;
    status: "profit" | "break_even" | "loss";
    label: string;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryValue: number;
    lowStockProducts: Array<{ name: string; stock: number }>;
  };
  dateRange: {
    start: string;
    end: string;
  };
  periodLabel: string;
  summary: string;
};

function buildOrderStatusSentence(
  phrase: string,
  orders: VendorAnalyticsReport["orders"],
): string {
  if (orders.total === 0) {
    return `${phrase}, no orders were recorded yet.`;
  }

  const parts: string[] = [];

  if (orders.openOrders > 0) {
    parts.push(`${countLabel(orders.openOrders, "order is", "orders are")} still open`);
  }

  if (orders.completedOrders > 0) {
    parts.push(`${countLabel(orders.completedOrders, "order is", "orders are")} completed`);
  }

  if (orders.awaitingPayment > 0) {
    parts.push(`${countLabel(orders.awaitingPayment, "order is", "orders are")} awaiting payment`);
  }

  if (parts.length === 0) {
    return `${phrase}, you have ${countLabel(orders.total, "order", "orders")}.`;
  }

  return `${parts.join(", ")}.`;
}

function buildAnalyticsSummary(input: {
  phrase: string;
  orders: VendorAnalyticsReport["orders"];
  engagement: VendorAnalyticsReport["engagement"];
  customers: VendorAnalyticsReport["customers"];
  businessHealth: VendorAnalyticsReport["businessHealth"];
}): string {
  const { phrase, orders, engagement, customers, businessHealth } = input;

  const activityLine =
    orders.total === 0 && engagement.likes === 0
      ? `${phrase} is quiet so far — no new orders or likes yet. You still have ${countLabel(customers.potential, "potential customer", "potential customers")} in your list.`
      : `${phrase}, you have ${countLabel(orders.total, "order", "orders")} and ${countLabel(engagement.likes, "new like", "new likes")}. You currently have ${countLabel(customers.potential, "potential customer", "potential customers")}.`;

  const lines = [activityLine];

  if (orders.total > 0) {
    lines.push(buildOrderStatusSentence(phrase, orders));
  }

  lines.push(
    `Completed sales brought in ${formatCurrency(businessHealth.revenue)} with ${formatCurrency(businessHealth.expenses)} in expenses. Your business health is ${businessHealth.label.toLowerCase()} (${formatCurrency(businessHealth.netProfit)} net).`,
  );

  return lines.join("\n\n");
}

export async function buildVendorAnalyticsReport(
  db: BasePayload,
  vendorId: string,
  reportType: VendorAnalyticsReportType,
): Promise<VendorAnalyticsReport> {
  const { start, end, label, phrase } = getReportDateRange(reportType);
  const openOrderStatuses = OPEN_ORDER_STATUSES as readonly string[];

  const [ordersResult, productsResult, expensesResult, customerList] = await Promise.all([
      db.find({
        collection: "orders",
        where: {
          vendor: { equals: vendorId },
          status: { not_equals: "canceled" },
        },
        limit: 10000,
        depth: 1,
        overrideAccess: true,
      }),
      db.find({
        collection: "products",
        where: { vendor: { equals: vendorId } },
        limit: 1000,
        depth: 0,
        overrideAccess: true,
      }),
      db.find({
        collection: "vendor-expenses",
        where: { vendor: { equals: vendorId } },
        limit: 5000,
        depth: 0,
        overrideAccess: true,
      }),
      buildVendorCustomerList(db, vendorId),
    ]);

  const products = productsResult.docs as ProductDoc[];
  const productIds = products.map((product) => product.id);

  const [likesResult, favoritesResult, viewsResult] =
    productIds.length > 0
      ? await Promise.all([
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
          db.find({
            collection: "product-views",
            where: { vendor: { equals: vendorId } },
            limit: 10000,
            depth: 0,
            overrideAccess: true,
          }),
        ])
      : [{ docs: [] }, { docs: [] }, { docs: [] }];

  const productIdSet = new Set(productIds);

  const periodOrders = (ordersResult.docs as OrderDoc[]).filter((order) =>
    isWithinRange(getOrderActivityDate(order), start, end),
  );

  const statusBreakdown: Record<string, number> = {};
  let openOrders = 0;
  let completedOrders = 0;
  let awaitingPayment = 0;
  let paymentCompleted = 0;
  let periodRevenue = 0;

  const productRevenue: Record<string, { name: string; revenue: number; quantity: number }> = {};

  for (const order of periodOrders) {
    const status = order.status ?? "pending";
    statusBreakdown[status] = (statusBreakdown[status] ?? 0) + 1;

    if (openOrderStatuses.includes(status)) {
      openOrders += 1;
    }

    if (status === "complete") {
      completedOrders += 1;
      periodRevenue += order.total ?? 0;
    }

    if (status === "pending" || order.paymentStatus === "pending") {
      awaitingPayment += 1;
    }

    if (order.paymentStatus === "completed") {
      paymentCompleted += 1;
    }

    const productId =
      typeof order.product === "string" ? order.product : order.product?.id ?? null;
    const product = products.find((item) => item.id === productId);
    if (product && productId) {
      if (!productRevenue[productId]) {
        productRevenue[productId] = {
          name: product.name ?? "Unknown",
          revenue: 0,
          quantity: 0,
        };
      }
      productRevenue[productId].revenue += order.total ?? 0;
      productRevenue[productId].quantity += order.quantity ?? 1;
    }
  }

  const totalOrders = periodOrders.length;
  const totalRevenue = periodOrders.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const countInteractionsInPeriod = (
    docs: Array<{ createdAt?: string | null; lastViewedAt?: string | null; product?: string | { id?: string } | null }>,
    useLastViewed = false,
  ): number =>
    docs.filter((doc) => {
      const productId = typeof doc.product === "string" ? doc.product : doc.product?.id;
      if (!productId || !productIdSet.has(productId)) return false;
      const rawDate = useLastViewed ? doc.lastViewedAt ?? doc.createdAt : doc.createdAt;
      if (!rawDate) return false;
      return isWithinRange(new Date(rawDate), start, end);
    }).length;

  const engagement = {
    likes: countInteractionsInPeriod(likesResult.docs),
    favorites: countInteractionsInPeriod(favoritesResult.docs),
    views: countInteractionsInPeriod(viewsResult.docs, true),
  };

  const periodExpenses = (expensesResult.docs as ExpenseDoc[]).reduce((sum, expense) => {
    if (!expense.expenseDate) return sum;
    const expenseDate = new Date(expense.expenseDate);
    if (!isWithinRange(expenseDate, start, end)) return sum;
    return sum + (expense.amount ?? 0);
  }, 0);

  const netProfit = periodRevenue - periodExpenses;
  const health = getBusinessHealth(netProfit);

  const lowStockThreshold = 10;
  const lowStockProducts = products.filter(
    (product) => (product.stock ?? 0) > 0 && (product.stock ?? 0) <= lowStockThreshold,
  );
  const outOfStockProducts = products.filter((product) => (product.stock ?? 0) === 0);
  const totalInventoryValue = products.reduce(
    (sum, product) => sum + (product.stock ?? 0) * (product.price ?? 0),
    0,
  );

  const customers = {
    potential: customerList.segmentCounts.visitor,
    openOrder: customerList.segmentCounts.pending,
    loyal: customerList.segmentCounts.completed,
    total: customerList.segmentCounts.all,
  };

  const businessHealth = {
    revenue: periodRevenue,
    expenses: periodExpenses,
    netProfit,
    status: health.status,
    label: health.label,
  };

  const orders = {
    total: totalOrders,
    revenue: totalRevenue,
    averageOrderValue,
    openOrders,
    completedOrders,
    awaitingPayment,
    paymentCompleted,
    statusBreakdown,
    topProducts,
  };

  return {
    orders,
    engagement,
    customers,
    businessHealth,
    inventory: {
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalInventoryValue,
      lowStockProducts: lowStockProducts.slice(0, 5).map((product) => ({
        name: product.name ?? "Unknown",
        stock: product.stock ?? 0,
      })),
    },
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    periodLabel: label,
    summary: buildAnalyticsSummary({
      phrase,
      orders,
      engagement,
      customers,
      businessHealth,
    }),
  };
}
