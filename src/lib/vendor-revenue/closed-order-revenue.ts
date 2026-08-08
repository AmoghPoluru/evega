import type { Payload, Where } from "payload";
import type { Order } from "@/payload-types";
import {
  formatOrderProductDetails,
  formatManualRevenueContext,
  getClosedOrderDate,
  getOrderProductName,
  getClosedOrderStatusLabel,
  getOrderSourceLabel,
  resolveOrderSource,
  type OrderSource,
} from "./order-source";

/** Order statuses that count as closed for revenue (vendor-completed sales). */
export const CLOSED_ORDER_STATUS = "complete" as const;

export type ClosedOrderRevenueSummary = {
  totalRevenue: number;
  closedOrderCount: number;
  onlineCount: number;
  manualCount: number;
};

export type ClosedOrderRevenueRow = {
  id: string;
  orderNumber: string;
  closedDate: string;
  productName: string;
  productDetails: string;
  description: string | null;
  saleContext: string | null;
  quantity: number;
  unitPrice: number;
  salePrice: number;
  orderSource: OrderSource;
  orderSourceLabel: string;
  orderStatusLabel: string;
  productId: string | null;
};

export function formatClosedOrderRevenueRow(order: Order): ClosedOrderRevenueRow {
  const quantity = order.quantity ?? 1;
  const salePrice = order.total ?? 0;
  const unitPrice = quantity > 0 ? salePrice / quantity : salePrice;
  const orderSource = resolveOrderSource(order);
  const productName = getOrderProductName(order);
  const manualContext = formatManualRevenueContext(order);

  let description: string | null = null;
  if (manualContext) {
    description = manualContext;
  } else if (order.name?.trim() && order.name.trim() !== productName) {
    description = order.name.trim();
  }

  const lineItems = order.lineItems ?? [];
  const firstLineProduct = lineItems[0]?.product ?? order.product;

  return {
    id: order.id,
    orderNumber: order.orderNumber ?? order.id,
    closedDate: getClosedOrderDate(order),
    productName,
    productDetails: formatOrderProductDetails(order),
    description,
    saleContext: manualContext,
    quantity,
    unitPrice,
    salePrice,
    orderSource,
    orderSourceLabel: getOrderSourceLabel(orderSource),
    orderStatusLabel: getClosedOrderStatusLabel(),
    productId:
      typeof firstLineProduct === "string"
        ? firstLineProduct
        : firstLineProduct?.id ?? null,
  };
}

function closedOrdersWhere(vendorId: string): Where {
  return {
    and: [{ vendor: { equals: vendorId } }, { status: { equals: CLOSED_ORDER_STATUS } }],
  };
}

/**
 * Sum order totals for vendor orders marked complete (closed).
 */
export async function getClosedOrderRevenueSummary(
  db: Payload,
  vendorId: string,
): Promise<ClosedOrderRevenueSummary> {
  const result = await db.find({
    collection: "orders",
    where: closedOrdersWhere(vendorId),
    limit: 5000,
    depth: 0,
  });

  const docs = result.docs as Order[];
  let onlineCount = 0;
  let manualCount = 0;

  const totalRevenue = docs.reduce((sum, order) => {
    if (resolveOrderSource(order) === "online") {
      onlineCount += 1;
    } else {
      manualCount += 1;
    }
    return sum + (order.total ?? 0);
  }, 0);

  return {
    totalRevenue,
    closedOrderCount: docs.length,
    onlineCount,
    manualCount,
  };
}

/** @deprecated Use getClosedOrderRevenueSummary */
export async function getClosedOrderRevenue(
  db: Payload,
  vendorId: string,
): Promise<Pick<ClosedOrderRevenueSummary, "totalRevenue" | "closedOrderCount">> {
  const summary = await getClosedOrderRevenueSummary(db, vendorId);
  return {
    totalRevenue: summary.totalRevenue,
    closedOrderCount: summary.closedOrderCount,
  };
}

export async function listClosedOrderRevenue(
  db: Payload,
  vendorId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {},
): Promise<{
  docs: ClosedOrderRevenueRow[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  let where = closedOrdersWhere(vendorId);

  if (options.search?.trim()) {
    where = {
      and: [
        where,
        {
          or: [
            { orderNumber: { contains: options.search.trim() } },
            { name: { contains: options.search.trim() } },
            { revenueDescription: { contains: options.search.trim() } },
            { expoName: { contains: options.search.trim() } },
          ],
        },
      ],
    };
  }

  const result = await db.find({
    collection: "orders",
    where,
    page,
    limit,
    sort: "-updatedAt",
    depth: 1,
  });

  return {
    docs: (result.docs as Order[]).map(formatClosedOrderRevenueRow),
    totalDocs: result.totalDocs,
    page: result.page ?? page,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}
