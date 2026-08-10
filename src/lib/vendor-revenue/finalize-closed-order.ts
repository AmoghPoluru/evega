import type { BasePayload } from "payload";

import { refreshCustomerStats } from "@/lib/customers/upsert-vendor-customer";
import type { Order } from "@/payload-types";

import { CLOSED_ORDER_STATUS } from "./closed-order-revenue";
import { resolveOrderSource } from "./order-source";

type OrderForRevenueFields = Pick<
  Order,
  "paymentStatus" | "orderSource" | "stripeCheckoutSessionId" | "vendorPayout" | "isManualRevenueEntry"
>;

export type ClosedOrderRevenueUpdate = {
  paymentStatus?: "completed";
  orderSource?: "online" | "manual";
  vendorPayout?: NonNullable<Order["vendorPayout"]>;
};

/** True when an order is transitioning into the closed revenue state. */
export function isTransitionToClosedRevenue(
  previousStatus: Order["status"] | null | undefined,
  nextStatus: Order["status"] | null | undefined,
): boolean {
  return nextStatus === CLOSED_ORDER_STATUS && previousStatus !== CLOSED_ORDER_STATUS;
}

/**
 * Revenue is represented by orders with status `complete`.
 * These fields ensure the order is fully closed for payment/source tracking.
 */
export function getClosedOrderRevenueUpdateFields(order: OrderForRevenueFields): ClosedOrderRevenueUpdate {
  const update: ClosedOrderRevenueUpdate = {};

  if (order.paymentStatus !== "completed" && order.paymentStatus !== "refunded") {
    update.paymentStatus = "completed";
  }

  if (!order.orderSource) {
    update.orderSource = order.isManualRevenueEntry ? "manual" : resolveOrderSource(order);
  }

  if (order.vendorPayout && order.vendorPayout.status !== "completed") {
    update.vendorPayout = {
      ...order.vendorPayout,
      status: "completed",
      payoutDate: order.vendorPayout.payoutDate ?? new Date().toISOString(),
    };
  }

  return update;
}

function getRelationshipId(value: string | { id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

/** Refresh linked customer aggregates after an order counts as revenue. */
export async function refreshCustomersForClosedOrder(
  db: BasePayload,
  order: Pick<Order, "user" | "saleCustomers">,
  options: { overrideAccess?: boolean } = {},
): Promise<void> {
  const overrideAccess = options.overrideAccess ?? true;
  const customerIds = new Set<string>();

  for (const saleCustomer of order.saleCustomers ?? []) {
    const customerId = getRelationshipId(saleCustomer.customer ?? null);
    if (customerId) {
      customerIds.add(customerId);
    }
  }

  const userId = getRelationshipId(order.user ?? null);
  if (userId) {
    const result = await db.find({
      collection: "customers",
      where: { user: { equals: userId } },
      limit: 1,
      depth: 0,
      overrideAccess,
    });

    const customerId = result.docs[0]?.id;
    if (customerId) {
      customerIds.add(customerId);
    }
  }

  await Promise.all(
    [...customerIds].map((customerId) => refreshCustomerStats(db, customerId, { overrideAccess })),
  );
}
