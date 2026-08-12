import { format } from "date-fns";

import { categoryLabelForExport } from "@/lib/vendor-expenses/expense-row-validation";

export type ExpenseCsvRow = {
  expenseDate: string;
  category: string;
  description: string;
  amount: number | null | undefined;
  createdAt?: string | null;
  updatedAt?: string | null;
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

/** Build CSV string for vendor expenses (Excel-friendly). */
export function buildExpensesCsv(rows: ExpenseCsvRow[]): string {
  const header = ["Date", "Category", "Description", "Amount", "Created", "Updated"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        formatCsvDate(row.expenseDate),
        escapeCsvCell(categoryLabelForExport(row.category)),
        escapeCsvCell(row.description ?? ""),
        row.amount != null && Number.isFinite(row.amount) ? row.amount.toFixed(2) : "",
        formatCsvDate(row.createdAt ?? undefined),
        formatCsvDate(row.updatedAt ?? undefined),
      ].join(","),
    ),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

export function downloadExpensesCsv(rows: ExpenseCsvRow[], filenamePrefix = "expenses"): void {
  const csv = buildExpensesCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filenamePrefix}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
