export const VENDOR_SALE_CONTEXTS = [
  { id: "store_visit", label: "Store visit" },
  { id: "expo", label: "Expo / event" },
  { id: "other", label: "Other" },
] as const;

export type VendorSaleContextId = (typeof VENDOR_SALE_CONTEXTS)[number]["id"];

export function getSaleContextLabel(context: VendorSaleContextId | null | undefined): string {
  if (!context) return "Other";
  return VENDOR_SALE_CONTEXTS.find((item) => item.id === context)?.label ?? "Other";
}
