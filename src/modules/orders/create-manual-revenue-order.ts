import { TRPCError } from "@trpc/server";
import type { BasePayload } from "payload";

import { decrementStockForOrder } from "@/lib/inventory/adjust-product-stock";
import {
  refreshCustomerStats,
  upsertVendorCustomer,
} from "@/lib/customers/upsert-vendor-customer";
import { CLOSED_ORDER_STATUS } from "@/lib/vendor-revenue/closed-order-revenue";
import { getSaleContextLabel } from "@/lib/vendor-revenue/sale-context";
import type { ManualRevenueCreateInput } from "@/lib/vendor-revenue/manual-revenue-schema";

type ProductDoc = {
  id: string;
  name: string;
  vendor?: string | { id?: string } | null;
};

function getVendorIdFromProduct(product: ProductDoc): string | null {
  if (!product.vendor) return null;
  if (typeof product.vendor === "string") return product.vendor;
  return product.vendor.id ?? null;
}

function buildOrderName(input: ManualRevenueCreateInput): string {
  const contextLabel = getSaleContextLabel(input.saleContext);
  const description = input.description?.trim();
  const expoName = input.expoName?.trim();

  if (input.saleContext === "expo" && expoName) {
    return description ? `${contextLabel}: ${expoName} — ${description}` : `${contextLabel}: ${expoName}`;
  }

  if (description) {
    return `${contextLabel}: ${description}`;
  }

  return contextLabel;
}

function calculateTotals(input: ManualRevenueCreateInput): {
  total: number;
  quantity: number;
} {
  const lineItems = input.lineItems ?? [];

  if (lineItems.length === 0) {
    return {
      total: input.amount ?? 0,
      quantity: 1,
    };
  }

  const total = lineItems.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const quantity = lineItems.reduce((sum, line) => sum + line.quantity, 0);

  return { total, quantity };
}

async function assertProductBelongsToVendor(
  db: BasePayload,
  productId: string,
  expectedVendorId: string,
  overrideAccess: boolean,
): Promise<ProductDoc> {
  const product = (await db.findByID({
    collection: "products",
    id: productId,
    depth: 0,
    overrideAccess,
  })) as ProductDoc;

  const productVendorId = getVendorIdFromProduct(product);
  if (!productVendorId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Product has no vendor assigned" });
  }

  if (productVendorId !== expectedVendorId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Product does not belong to your store",
    });
  }

  return product;
}

export async function createManualRevenueOrder(
  db: BasePayload,
  input: ManualRevenueCreateInput,
  options: { expectedVendorId: string; overrideAccess?: boolean },
): Promise<{ id: string; orderNumber?: string | null }> {
  const overrideAccess = options.overrideAccess ?? true;
  const vendorId = options.expectedVendorId;
  const lineItems = input.lineItems ?? [];
  const { total, quantity } = calculateTotals(input);

  if (total <= 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Sale amount must be greater than zero" });
  }

  const productIds = lineItems
    .map((line) => line.productId?.trim())
    .filter((value): value is string => Boolean(value));

  for (const productId of productIds) {
    await assertProductBelongsToVendor(db, productId, vendorId, overrideAccess);
  }

  let inventoryAdjusted: "none" | "deducted" = "none";

  if (productIds.length > 0) {
    for (const line of lineItems) {
      if (!line.productId?.trim()) continue;

      await decrementStockForOrder(db, {
        productId: line.productId,
        quantity: line.quantity,
        size: line.size,
        color: line.color,
        overrideAccess,
      });
    }

    inventoryAdjusted = "deducted";
  }

  const firstProductLine = lineItems.find((line) => line.productId?.trim());
  const primaryProductId = firstProductLine?.productId?.trim();
  const closedAt = new Date(input.saleDate).toISOString();

  const saleCustomers: {
    name: string;
    phone: string;
    customer?: string;
  }[] = [];

  let primaryUserId: string | undefined;

  for (const customer of input.customers ?? []) {
    const { userId, customerId } = await upsertVendorCustomer(
      db,
      {
        vendorId,
        name: customer.name.trim(),
        phone: customer.phone.trim(),
      },
      { overrideAccess },
    );

    if (userId && !primaryUserId) {
      primaryUserId = userId;
    }

    saleCustomers.push({
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      customer: customerId,
    });
  }

  const order = await db.create({
    collection: "orders",
    data: {
      name: buildOrderName(input),
      user: primaryUserId,
      vendor: vendorId,
      product: primaryProductId,
      quantity,
      size: firstProductLine?.size || undefined,
      color: firstProductLine?.color || undefined,
      total,
      status: CLOSED_ORDER_STATUS,
      statusHistory: [
        {
          status: CLOSED_ORDER_STATUS,
          timestamp: closedAt,
          note: "Manual revenue recorded",
        },
      ],
      paymentMethod: "offline",
      paymentStatus: "completed",
      orderSource: "manual",
      isManualRevenueEntry: true,
      manualSaleDate: input.saleDate,
      saleContext: input.saleContext,
      expoName: input.saleContext === "expo" ? input.expoName?.trim() : undefined,
      revenueDescription: input.description?.trim() || undefined,
      saleCustomers,
      lineItems: lineItems.map((line) => ({
        product: line.productId?.trim() || undefined,
        description: line.description?.trim() || undefined,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        size: line.size?.trim() || undefined,
        color: line.color?.trim() || undefined,
      })),
      inventoryAdjusted,
    },
    overrideAccess,
  } as never);

  for (const saleCustomer of saleCustomers) {
    if (saleCustomer.customer) {
      await refreshCustomerStats(db, saleCustomer.customer, { overrideAccess });
    }
  }

  return {
    id: order.id,
    orderNumber: (order as { orderNumber?: string | null }).orderNumber ?? null,
  };
}
