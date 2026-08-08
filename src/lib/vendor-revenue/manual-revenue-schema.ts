import { z } from "zod";

import { VENDOR_SALE_CONTEXTS } from "./sale-context";

const saleContextValues = VENDOR_SALE_CONTEXTS.map((item) => item.id) as [
  (typeof VENDOR_SALE_CONTEXTS)[number]["id"],
  ...(typeof VENDOR_SALE_CONTEXTS)[number]["id"][],
];

export const manualRevenueCustomerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
});

export const manualRevenueLineItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const manualRevenueCreateInputSchema = z
  .object({
    saleDate: z.string().min(1, "Sale date is required"),
    saleContext: z.enum(saleContextValues),
    expoName: z.string().optional(),
    description: z.string().optional(),
    customers: z.array(manualRevenueCustomerSchema).optional(),
    amount: z.number().min(0.01).optional(),
    lineItems: z.array(manualRevenueLineItemSchema).optional(),
  })
  .superRefine((input, ctx) => {
    const trimmedDescription = input.description?.trim() ?? "";
    const lineItems = input.lineItems ?? [];
    const customers = input.customers ?? [];
    const needsCustomers = input.saleContext === "store_visit" || input.saleContext === "expo";

    if (input.saleContext === "expo" && !input.expoName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expo or event name is required",
        path: ["expoName"],
      });
    }

    if (needsCustomers && customers.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one customer with name and phone",
        path: ["customers"],
      });
    }

    customers.forEach((customer, index) => {
      if (!customer.name.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Customer name is required",
          path: ["customers", index, "name"],
        });
      }

      if (!customer.phone.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone number is required",
          path: ["customers", index, "phone"],
        });
      }
    });

    if (lineItems.length === 0) {
      if (!trimmedDescription) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Description is required when no products are added",
          path: ["description"],
        });
      }

      if (!input.amount || input.amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sale amount is required when no products are added",
          path: ["amount"],
        });
      }

      return;
    }

    lineItems.forEach((line, index) => {
      const hasProduct = Boolean(line.productId?.trim());
      const hasDescription = Boolean(line.description?.trim());

      if (!hasProduct && !hasDescription) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Each line needs a product or description",
          path: ["lineItems", index],
        });
      }
    });

    const lineTotal = lineItems.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0,
    );

    if (lineTotal <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one line item with a price",
        path: ["lineItems"],
      });
    }
  });

export type ManualRevenueCreateInput = z.infer<typeof manualRevenueCreateInputSchema>;
export type ManualRevenueLineItemInput = z.infer<typeof manualRevenueLineItemSchema>;
export type ManualRevenueCustomerInput = z.infer<typeof manualRevenueCustomerSchema>;
