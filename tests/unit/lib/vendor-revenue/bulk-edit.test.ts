import { describe, expect, it } from "vitest";

import { buildRevenueCsv } from "../../../../src/lib/vendor-revenue/export-revenue-csv";
import {
  isRevenueDraftEmpty,
  validateRevenueDraft,
} from "../../../../src/lib/vendor-revenue/revenue-row-validation";

describe("validateRevenueDraft", () => {
  it("accepts valid manual revenue rows", () => {
    const result = validateRevenueDraft({
      saleDate: "2026-08-01",
      saleContext: "other",
      expoName: "",
      description: "Walk-in saree sale",
      amount: "250",
    });

    expect(result.ok).toBe(true);
  });

  it("requires expo name for expo sale type", () => {
    const result = validateRevenueDraft({
      saleDate: "2026-08-01",
      saleContext: "expo",
      expoName: "",
      description: "Booth sales",
      amount: "500",
    });

    expect(result.ok).toBe(false);
  });
});

describe("isRevenueDraftEmpty", () => {
  it("treats blank rows as empty", () => {
    expect(
      isRevenueDraftEmpty({
        saleDate: "",
        saleContext: "other",
        expoName: "",
        description: "",
        amount: "",
      }),
    ).toBe(true);
  });
});

describe("buildRevenueCsv", () => {
  it("builds excel-friendly csv with header row", () => {
    const csv = buildRevenueCsv([
      {
        closedDate: "2026-08-01T00:00:00.000Z",
        orderNumber: "ORD-1001",
        productDetails: "Silk saree",
        description: "Walk-in sale",
        saleContextId: "store_visit",
        orderSourceLabel: "Manual",
        salePrice: 250,
      },
    ]);

    expect(csv.startsWith("\uFEFFClosed date,Order #,Product details")).toBe(true);
    expect(csv).toContain("ORD-1001");
    expect(csv).toContain("250.00");
  });
});
