import { z } from "zod";

/** Vendor business expense categories for My Expenses. */
export const VENDOR_EXPENSE_CATEGORY_IDS = [
  "inventory",
  "rent",
  "marketing",
  "platform",
  "packaging",
  "staff",
  "other",
] as const;

export type VendorExpenseCategoryId = (typeof VENDOR_EXPENSE_CATEGORY_IDS)[number];

export const vendorExpenseCategorySchema = z.enum(VENDOR_EXPENSE_CATEGORY_IDS);

export type VendorExpenseCategory = {
  id: VendorExpenseCategoryId;
  label: string;
  description: string;
};

export const VENDOR_EXPENSE_CATEGORIES: VendorExpenseCategory[] = [
  {
    id: "inventory",
    label: "Inventory",
    description: "Stock, materials, and goods you purchase to sell",
  },
  {
    id: "rent",
    label: "Rent",
    description: "Shop rent, storage, or workspace costs",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Ads, promotions, flyers, and social media spend",
  },
  {
    id: "platform",
    label: "Zvastra / platform",
    description: "Zvastra subscription, commissions, and platform fees",
  },
  {
    id: "packaging",
    label: "Packaging & shipping",
    description: "Boxes, bags, labels, and delivery costs",
  },
  {
    id: "staff",
    label: "Staff & helpers",
    description: "Salaries, daily wages, and contractor payments",
  },
  {
    id: "other",
    label: "Other",
    description: "Any other business expense",
  },
];

export function isVendorExpenseCategoryId(
  value: string | null | undefined,
): value is VendorExpenseCategoryId {
  return Boolean(value && VENDOR_EXPENSE_CATEGORY_IDS.includes(value as VendorExpenseCategoryId));
}

export function getVendorExpenseCategoryLabel(id: string | null | undefined): string {
  if (!isVendorExpenseCategoryId(id)) return "Other";
  return VENDOR_EXPENSE_CATEGORIES.find((item) => item.id === id)?.label ?? "Other";
}
