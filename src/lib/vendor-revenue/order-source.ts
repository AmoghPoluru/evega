import type { Order } from "@/payload-types";
import { getSaleContextLabel, type VendorSaleContextId } from "./sale-context";

export type OrderSource = "online" | "manual";

export function resolveOrderSource(order: Pick<Order, "orderSource" | "stripeCheckoutSessionId">): OrderSource {
  if (order.orderSource === "online" || order.orderSource === "manual") {
    return order.orderSource;
  }

  return order.stripeCheckoutSessionId ? "online" : "manual";
}

export function getOrderSourceLabel(source: OrderSource): string {
  return source === "online" ? "Online" : "Manual";
}

export function getClosedOrderStatusLabel(): string {
  return "Closed";
}

export function getClosedOrderDate(order: Order): string {
  if (order.manualSaleDate) {
    return new Date(order.manualSaleDate).toISOString();
  }

  const history = order.statusHistory ?? [];
  const completeEntry = [...history].reverse().find((entry) => entry.status === "complete");

  return (
    completeEntry?.timestamp ??
    order.updatedAt ??
    order.createdAt ??
    new Date().toISOString()
  );
}

type OrderLineItem = NonNullable<Order["lineItems"]>[number];

function getLineItemProductName(line: OrderLineItem): string {
  const product = line.product;
  if (product && typeof product === "object" && product.name) {
    return product.name;
  }

  if (line.description?.trim()) {
    return line.description.trim();
  }

  return "Item";
}

function formatLineItem(line: OrderLineItem): string {
  const label = getLineItemProductName(line);
  const quantity = line.quantity ?? 1;
  const parts = [label];

  if (quantity > 1) {
    parts.push(`× ${quantity}`);
  }

  const variantParts: string[] = [];
  if (line.size?.trim()) variantParts.push(`Size: ${line.size.trim()}`);
  if (line.color?.trim()) variantParts.push(`Color: ${line.color.trim()}`);

  if (variantParts.length > 0) {
    parts.push(`(${variantParts.join(", ")})`);
  }

  return parts.join(" ");
}

export function formatManualRevenueContext(order: Order): string | null {
  const parts: string[] = [];
  const context = order.saleContext as VendorSaleContextId | null | undefined;

  if (context) {
    parts.push(getSaleContextLabel(context));
  }

  if (order.saleContext === "expo" && order.expoName?.trim()) {
    parts.push(order.expoName.trim());
  }

  if (order.revenueDescription?.trim()) {
    parts.push(order.revenueDescription.trim());
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function getOrderProductName(order: Order): string {
  const lineItems = order.lineItems ?? [];

  if (lineItems.length > 1) {
    return `${lineItems.length} items`;
  }

  if (lineItems.length === 1) {
    return getLineItemProductName(lineItems[0]);
  }

  const product = order.product;
  if (product && typeof product === "object" && product.name) {
    return product.name;
  }

  if (order.revenueDescription?.trim()) {
    return order.revenueDescription.trim();
  }

  if (order.name?.trim()) {
    return order.name.trim();
  }

  return "Untracked sale";
}

export function formatOrderProductDetails(order: Order): string {
  const lineItems = order.lineItems ?? [];

  if (lineItems.length > 0) {
    return lineItems.map(formatLineItem).join("; ");
  }

  const parts: string[] = [getOrderProductName(order)];

  const quantity = order.quantity ?? 1;
  if (quantity > 1) {
    parts.push(`× ${quantity}`);
  }

  const variantParts: string[] = [];
  if (order.size?.trim()) variantParts.push(`Size: ${order.size.trim()}`);
  if (order.color?.trim()) variantParts.push(`Color: ${order.color.trim()}`);

  if (variantParts.length > 0) {
    parts.push(`(${variantParts.join(", ")})`);
  }

  return parts.join(" ");
}
