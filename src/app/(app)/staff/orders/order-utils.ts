import { z } from "zod";
import type { Order, Product } from "@/payload-types";

export const orderStatusSchema = z.enum([
  "pending",
  "payment_done",
  "processing",
  "complete",
  "canceled",
  "refunded",
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderStatusFilterSchema = z.enum([
  "all",
  "pending",
  "payment_done",
  "processing",
  "complete",
  "canceled",
  "refunded",
]);

export type OrderStatusFilter = z.infer<typeof orderStatusFilterSchema>;

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "payment_done", label: "Payment Done" },
  { value: "processing", label: "Processing" },
  { value: "complete", label: "Complete" },
  { value: "canceled", label: "Canceled" },
  { value: "refunded", label: "Refunded" },
];

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  payment_done: "Payment Done",
  processing: "Processing",
  complete: "Complete",
  canceled: "Canceled",
  refunded: "Refunded",
};

export const statusColorMap: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  payment_done: "default",
  processing: "default",
  complete: "default",
  refunded: "outline",
  canceled: "destructive",
};

export function getStatusBadgeClass(status: string): string {
  if (status === "pending") return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
  if (status === "complete") return "bg-green-100 text-green-800 hover:bg-green-100";
  if (status === "canceled") return "bg-red-100 text-red-800 hover:bg-red-100";
  return "";
}

export const orderDraftSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  product: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  size: z.string().optional(),
  color: z.string().optional(),
  total: z.coerce.number().min(0.01, "Total must be greater than 0"),
  status: orderStatusSchema,
});

export type OrderDraft = z.infer<typeof orderDraftSchema>;

export type OrderRow = Order & {
  customerLabel?: string;
  vendorName?: string;
  productName?: string;
  itemsCount?: number;
  itemsSummary?: string;
};

export function getProductId(order: Order): string {
  if (typeof order.product === "object" && order.product) {
    return order.product.id;
  }
  return (order.product as string) || "";
}

export function getProductName(order: Order): string {
  if (typeof order.product === "object" && order.product) {
    return order.product.name || "Product";
  }
  return "Product";
}

export function formatItemsSummary(order: Order): string {
  const qty = order.quantity || 1;
  const name = getProductName(order);
  const parts: string[] = [`${qty} × ${name}`];
  const variant: string[] = [];
  if (order.size) variant.push(`Size ${order.size}`);
  if (order.color) variant.push(order.color);
  if (variant.length) parts.push(variant.join(" · "));
  return parts.join(" — ");
}

export function orderToDraft(order: Order): OrderDraft {
  return {
    name: order.name || "",
    product: getProductId(order),
    quantity: order.quantity || 1,
    size: order.size || "",
    color: order.color || "",
    total: order.total || 0,
    status: (order.status || "pending") as OrderStatus,
  };
}

export function draftsEqual(a: OrderDraft, b: OrderDraft): boolean {
  return (
    a.name === b.name &&
    a.product === b.product &&
    a.quantity === b.quantity &&
    (a.size || "") === (b.size || "") &&
    (a.color || "") === (b.color || "") &&
    a.total === b.total &&
    a.status === b.status
  );
}

export function getCustomerLabel(order: OrderRow): string {
  return order.customerLabel || order.name || "Unknown";
}

export function computeTotalFromProduct(product: Product, quantity: number): number {
  return Math.round(product.price * quantity * 100) / 100;
}
