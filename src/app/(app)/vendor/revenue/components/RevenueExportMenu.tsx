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
import { downloadRevenueCsv } from "@/lib/vendor-revenue/export-revenue-csv";

type RevenueExportMenuProps = {
  search: string;
  disabled?: boolean;
};

export function RevenueExportMenu({ search, disabled }: RevenueExportMenuProps) {
  const utils = trpc.useUtils();
  const [isExporting, setIsExporting] = useState(false);

  const exportFiltered = async () => {
    setIsExporting(true);
    try {
      const result = await utils.vendor.revenue.listForBulkEdit.fetch({
        search: search || undefined,
      });

      if (result.docs.length === 0) {
        toast.message("No revenue matches your current search");
        return;
      }

      downloadRevenueCsv(
        result.docs.map((row) => ({
          closedDate: row.closedDate,
          orderNumber: row.orderNumber,
          productDetails: row.productDetails,
          description: row.description,
          saleContextId: row.saleContextId,
          orderSourceLabel: row.orderSourceLabel,
          salePrice: row.salePrice,
        })),
        "revenue-filtered",
      );
      toast.success(`Exported ${result.docs.length} row${result.docs.length === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAll = async () => {
    setIsExporting(true);
    try {
      const docs = await utils.vendor.revenue.exportAll.fetch();

      if (docs.length === 0) {
        toast.message("No revenue to export");
        return;
      }

      downloadRevenueCsv(
        docs.map((row) => ({
          closedDate: row.closedDate,
          orderNumber: row.orderNumber,
          productDetails: row.productDetails,
          description: row.description,
          saleContextId: row.saleContextId,
          orderSourceLabel: row.orderSourceLabel,
          salePrice: row.salePrice,
        })),
        "revenue-all",
      );
      toast.success(`Exported ${docs.length} row${docs.length === 1 ? "" : "s"}`);
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
        <DropdownMenuItem onClick={() => void exportFiltered()}>Current search</DropdownMenuItem>
        <DropdownMenuItem onClick={() => void exportAll()}>All revenue</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
