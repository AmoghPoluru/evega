import { describe, expect, it } from "vitest";

import {
  isExpenseDraftEmpty,
  validateExpenseDraft,
} from "../../../../src/lib/vendor-expenses/expense-row-validation";
import { buildExpensesCsv } from "../../../../src/lib/vendor-expenses/export-expenses-csv";

describe("validateExpenseDraft", () => {
  it("accepts valid expense rows", () => {
    const result = validateExpenseDraft({
      category: "rent",
      expenseDate: "2026-08-01",
      amount: "1200",
      description: "Shop rent",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.amount).toBe(1200);
    }
  });

  it("rejects empty amount and description", () => {
    const result = validateExpenseDraft({
      category: "other",
      expenseDate: "2026-08-01",
      amount: "",
      description: "",
    });

    expect(result.ok).toBe(false);
  });
});

describe("isExpenseDraftEmpty", () => {
  it("treats blank rows as empty", () => {
    expect(
      isExpenseDraftEmpty({
        category: "other",
        expenseDate: "",
        amount: "",
        description: "",
      }),
    ).toBe(true);
  });
});

describe("buildExpensesCsv", () => {
  it("builds excel-friendly csv with header row", () => {
    const csv = buildExpensesCsv([
      {
        expenseDate: "2026-08-01T00:00:00.000Z",
        category: "marketing",
        description: "Facebook ads",
        amount: 125.5,
        createdAt: "2026-08-02T00:00:00.000Z",
        updatedAt: "2026-08-02T00:00:00.000Z",
      },
    ]);

    expect(csv.startsWith("\uFEFFDate,Category,Description,Amount,Created,Updated")).toBe(true);
    expect(csv).toContain("Marketing");
    expect(csv).toContain("125.50");
  });
});
