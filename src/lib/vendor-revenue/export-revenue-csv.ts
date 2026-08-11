import { format } from "date-fns";

import { saleContextLabelForExport } from "@/lib/vendor-revenue/revenue-row-validation";

export type RevenueCsvRow = {
  closedDate: string;
  orderNumber: string;
  productDetails: string;
  description?: string | null;
  saleContextId?: string | null;
  orderSourceLabel: string;
  salePrice: number;
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCsvDate(value: string | null | undefined): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return format(parsed, "yyyy-MM-dd");
}

export function buildRevenueCsv(rows: RevenueCsvRow[]): string {
  const header = [
    "Closed date",
    "Order #",
    "Product details",
    "Description",
    "Sale type",
    "Source",
    "Sale price",
  ];

  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        formatCsvDate(row.closedDate),
        escapeCsvCell(row.orderNumber),
        escapeCsvCell(row.productDetails),
        escapeCsvCell(row.description ?? ""),
        escapeCsvCell(saleContextLabelForExport(row.saleContextId)),
        escapeCsvCell(row.orderSourceLabel),
        row.salePrice.toFixed(2),
      ].join(","),
    ),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

export function downloadRevenueCsv(rows: RevenueCsvRow[], filenamePrefix = "revenue"): void {
  const csv = buildRevenueCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filenamePrefix}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
