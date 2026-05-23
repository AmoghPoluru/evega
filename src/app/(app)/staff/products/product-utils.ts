import { z } from "zod";
import type { Product } from "@/payload-types";

export const productDraftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  vendor: z.string().min(1, "Vendor is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["published", "draft", "archived"]),
});

export type ProductDraft = z.infer<typeof productDraftSchema>;
export type ProductStatus = ProductDraft["status"];

export function getStatusFromProduct(product: Product): ProductStatus {
  if (product.isArchived) return "archived";
  if (product.isPrivate) return "draft";
  return "published";
}

export function productToDraft(product: Product): ProductDraft {
  const vendorId =
    typeof product.vendor === "object" && product.vendor
      ? product.vendor.id
      : (product.vendor as string) || "";
  const categoryId =
    typeof product.category === "object" && product.category
      ? product.category.id
      : (product.category as string) || "";

  return {
    name: product.name,
    vendor: vendorId,
    price: product.price,
    category: categoryId,
    status: getStatusFromProduct(product),
  };
}

export function draftsEqual(a: ProductDraft, b: ProductDraft): boolean {
  return (
    a.name === b.name &&
    a.vendor === b.vendor &&
    a.price === b.price &&
    a.category === b.category &&
    a.status === b.status
  );
}

export function getVendorName(product: Product, vendors: { id: string; name: string }[]): string {
  if (typeof product.vendor === "object" && product.vendor) {
    return product.vendor.name || product.vendor.slug || "—";
  }
  const id = product.vendor as string;
  return vendors.find((v) => v.id === id)?.name || "—";
}

export function getCategoryName(
  product: Product,
  categories: { id: string; name: string }[],
): string {
  if (typeof product.category === "object" && product.category) {
    return product.category.name || "—";
  }
  const id = product.category as string;
  return categories.find((c) => c.id === id)?.name || "—";
}

export function getStatusBadgeVariant(product: Product): "published" | "draft" | "archived" {
  return getStatusFromProduct(product);
}
