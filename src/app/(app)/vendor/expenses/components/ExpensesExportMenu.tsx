"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadExpensesCsv } from "@/lib/vendor-expenses/export-expenses-csv";
import type { VendorExpenseCategoryId } from "@/lib/vendor-expenses/categories";

type ExpensesExportMenuProps = {
  category: "all" | VendorExpenseCategoryId;
  search: string;
  disabled?: boolean;
};

export function ExpensesExportMenu({ category, search, disabled }: ExpensesExportMenuProps) {
  const utils = trpc.useUtils();
  const [isExporting, setIsExporting] = useState(false);

  const exportFiltered = async () => {
    setIsExporting(true);
    try {
      const result = await utils.vendor.expenses.listForBulkEdit.fetch({
        category,
        search: search || undefined,
      });

      if (result.docs.length === 0) {
        toast.message("No expenses match your current filters");
        return;
      }

      downloadExpensesCsv(result.docs, "expenses-filtered");
      toast.success(`Exported ${result.docs.length} expense${result.docs.length === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAll = async () => {
    setIsExporting(true);
    try {
      const docs = await utils.vendor.expenses.exportAll.fetch();

      if (docs.length === 0) {
        toast.message("No expenses to export");
        return;
      }

      downloadExpensesCsv(docs, "expenses-all");
      toast.success(`Exported ${docs.length} expense${docs.length === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export CSV
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void exportFiltered()}>
          Current filters
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void exportAll()}>All expenses</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
