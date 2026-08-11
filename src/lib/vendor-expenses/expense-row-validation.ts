import {
  getVendorExpenseCategoryLabel,
  isVendorExpenseCategoryId,
  type VendorExpenseCategoryId,
} from "@/lib/vendor-expenses/categories";

export type ExpenseDraftFields = {
  category: string;
  expenseDate: string;
  amount: string;
  description: string;
};

export type ExpenseDraftErrors = Partial<
  Record<keyof ExpenseDraftFields, string>
>;

export type ValidatedExpenseDraft = {
  category: VendorExpenseCategoryId;
  expenseDate: string;
  amount: number;
  description: string;
};

export function isExpenseDraftEmpty(fields: ExpenseDraftFields): boolean {
  return (
    !fields.description.trim() &&
    !fields.amount.trim() &&
    !fields.expenseDate.trim()
  );
}

export function validateExpenseDraft(
  fields: ExpenseDraftFields,
): { ok: true; value: ValidatedExpenseDraft } | { ok: false; errors: ExpenseDraftErrors } {
  const errors: ExpenseDraftErrors = {};

  if (!isVendorExpenseCategoryId(fields.category)) {
    errors.category = "Choose a category";
  }

  if (!fields.expenseDate.trim()) {
    errors.expenseDate = "Date is required";
  }

  const amount = Number.parseFloat(fields.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than zero";
  }

  const description = fields.description.trim();
  if (!description) {
    errors.description = "Description is required";
  } else if (description.length > 500) {
    errors.description = "Description must be 500 characters or less";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      category: fields.category as VendorExpenseCategoryId,
      expenseDate: fields.expenseDate.trim(),
      amount,
      description,
    },
  };
}

export function categoryLabelForExport(category: string): string {
  return getVendorExpenseCategoryLabel(category);
}
