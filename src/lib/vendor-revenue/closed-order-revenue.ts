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
import type { VendorSaleContextId } from "./sale-context";

/** Order statuses that count as closed for revenue (vendor-completed sales). */
export const CLOSED_ORDER_STATUS = "complete" as const;

export const BULK_REVENUE_MAX_ROWS = 500;

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
  /** Manual simple-entry rows are editable in bulk mode (no product line items). */
  isEditable: boolean;
  saleContextId: VendorSaleContextId | null;
  expoName: string | null;
  revenueDescription: string | null;
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
  const isManual = Boolean(order.isManualRevenueEntry);
  const hasLineItems = lineItems.length > 0;
  const saleContextId = (order.saleContext as VendorSaleContextId | null | undefined) ?? null;

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
    isEditable: isManual && !hasLineItems,
    saleContextId,
    expoName: order.expoName?.trim() || null,
    revenueDescription: order.revenueDescription?.trim() || null,
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

function buildClosedOrdersWhere(vendorId: string, search?: string): Where {
  let where = closedOrdersWhere(vendorId);

  if (search?.trim()) {
    where = {
      and: [
        where,
        {
          or: [
            { orderNumber: { contains: search.trim() } },
            { name: { contains: search.trim() } },
            { revenueDescription: { contains: search.trim() } },
            { expoName: { contains: search.trim() } },
          ],
        },
      ],
    };
  }

  return where;
}

async function queryClosedOrderRevenue(
  db: Payload,
  vendorId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {},
) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const where = buildClosedOrdersWhere(vendorId, options.search);

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
  return queryClosedOrderRevenue(db, vendorId, options);
}

export async function listClosedOrderRevenueForBulkEdit(
  db: Payload,
  vendorId: string,
  options: { search?: string } = {},
): Promise<{
  docs: ClosedOrderRevenueRow[];
  totalDocs: number;
  truncated: boolean;
  maxRows: number;
}> {
  const result = await queryClosedOrderRevenue(db, vendorId, {
    search: options.search,
    page: 1,
    limit: BULK_REVENUE_MAX_ROWS,
  });

  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    truncated: result.totalDocs > BULK_REVENUE_MAX_ROWS,
    maxRows: BULK_REVENUE_MAX_ROWS,
  };
}

export async function listAllClosedOrderRevenue(
  db: Payload,
  vendorId: string,
): Promise<ClosedOrderRevenueRow[]> {
  const result = await db.find({
    collection: "orders",
    where: closedOrdersWhere(vendorId),
    limit: 5000,
    sort: "-updatedAt",
    depth: 1,
  });

  return (result.docs as Order[]).map(formatClosedOrderRevenueRow);
}
