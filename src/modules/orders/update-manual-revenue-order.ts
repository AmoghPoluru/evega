import { TRPCError } from "@trpc/server";
import type { BasePayload } from "payload";

import type { Order } from "@/payload-types";
import type { BulkRevenueRowInput } from "@/lib/vendor-revenue/revenue-row-validation";
import { createManualRevenueOrder } from "@/modules/orders/create-manual-revenue-order";

function buildOrderName(input: BulkRevenueRowInput): string {
  const contextLabel =
    input.saleContext === "expo"
      ? `Expo / event: ${input.expoName?.trim()}`
      : input.saleContext === "store_visit"
        ? "Store visit"
        : "Other";

  return input.description.trim()
    ? `${contextLabel} — ${input.description.trim()}`
    : contextLabel;
}

async function assertEditableManualOrder(
  db: BasePayload,
  orderId: string,
  vendorId: string,
  overrideAccess: boolean,
): Promise<Order> {
  const order = (await db.findByID({
    collection: "orders",
    id: orderId,
    depth: 0,
    overrideAccess,
  })) as Order;

  const orderVendorId =
    typeof order.vendor === "string" ? order.vendor : order.vendor?.id ?? null;

  if (!orderVendorId || orderVendorId !== vendorId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Revenue entry not found" });
  }

  if (!order.isManualRevenueEntry) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Online orders cannot be edited in bulk",
    });
  }

  if ((order.lineItems ?? []).length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Orders with product line items must be edited from the order page",
    });
  }

  return order;
}

export async function updateManualRevenueOrder(
  db: BasePayload,
  orderId: string,
  input: BulkRevenueRowInput,
  options: { expectedVendorId: string; overrideAccess?: boolean },
): Promise<{ id: string }> {
  const overrideAccess = options.overrideAccess ?? true;
  await assertEditableManualOrder(db, orderId, options.expectedVendorId, overrideAccess);

  await db.update({
    collection: "orders",
    id: orderId,
    data: {
      name: buildOrderName(input),
      total: input.amount,
      quantity: 1,
      manualSaleDate: input.saleDate,
      saleContext: input.saleContext,
      expoName: input.saleContext === "expo" ? input.expoName?.trim() : undefined,
      revenueDescription: input.description.trim(),
    },
    overrideAccess,
  } as never);

  return { id: orderId };
}

export async function deleteManualRevenueOrder(
  db: BasePayload,
  orderId: string,
  options: { expectedVendorId: string; overrideAccess?: boolean },
): Promise<void> {
  const overrideAccess = options.overrideAccess ?? true;
  await assertEditableManualOrder(db, orderId, options.expectedVendorId, overrideAccess);

  await db.delete({
    collection: "orders",
    id: orderId,
    overrideAccess,
  });
}

export async function createBulkManualRevenueOrder(
  db: BasePayload,
  input: BulkRevenueRowInput,
  options: { expectedVendorId: string; overrideAccess?: boolean },
): Promise<{ id: string }> {
  const result = await createManualRevenueOrder(
    db,
    {
      saleDate: input.saleDate,
      saleContext: input.saleContext,
      expoName: input.saleContext === "expo" ? input.expoName?.trim() : undefined,
      description: input.description.trim(),
      amount: input.amount,
    },
    options,
  );

  return { id: result.id };
}
