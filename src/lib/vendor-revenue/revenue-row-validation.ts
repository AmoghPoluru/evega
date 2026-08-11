import { z } from "zod";

import { VENDOR_SALE_CONTEXTS, type VendorSaleContextId } from "@/lib/vendor-revenue/sale-context";

const saleContextValues = VENDOR_SALE_CONTEXTS.map((item) => item.id) as [
  VendorSaleContextId,
  ...VendorSaleContextId[],
];

export const bulkRevenueRowSchema = z
  .object({
    saleDate: z.string().min(1, "Date is required"),
    saleContext: z.enum(saleContextValues),
    expoName: z.string().optional(),
    description: z.string().trim().min(1, "Description is required").max(500),
    amount: z.number().positive("Amount must be greater than zero"),
  })
  .superRefine((input, ctx) => {
    if (input.saleContext === "expo" && !input.expoName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expo or event name is required",
        path: ["expoName"],
      });
    }
  });

export type BulkRevenueRowInput = z.infer<typeof bulkRevenueRowSchema>;

export type RevenueDraftFields = {
  saleDate: string;
  saleContext: string;
  expoName: string;
  description: string;
  amount: string;
};

export type RevenueDraftErrors = Partial<Record<keyof RevenueDraftFields, string>>;

export function isRevenueDraftEmpty(fields: RevenueDraftFields): boolean {
  return (
    !fields.description.trim() &&
    !fields.amount.trim() &&
    !fields.saleDate.trim() &&
    !fields.expoName.trim()
  );
}

export function validateRevenueDraft(
  fields: RevenueDraftFields,
): { ok: true; value: BulkRevenueRowInput } | { ok: false; errors: RevenueDraftErrors } {
  const amount = Number.parseFloat(fields.amount);
  const parsed = bulkRevenueRowSchema.safeParse({
    saleDate: fields.saleDate.trim(),
    saleContext: fields.saleContext,
    expoName: fields.expoName.trim() || undefined,
    description: fields.description.trim(),
    amount: Number.isFinite(amount) ? amount : Number.NaN,
  });

  if (!parsed.success) {
    const errors: RevenueDraftErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !errors[key as keyof RevenueDraftFields]) {
        errors[key as keyof RevenueDraftFields] = issue.message;
      }
    }
    return { ok: false, errors };
  }

  return { ok: true, value: parsed.data };
}

export function saleContextLabelForExport(context: string | null | undefined): string {
  return VENDOR_SALE_CONTEXTS.find((item) => item.id === context)?.label ?? "Other";
}
