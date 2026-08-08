"use client";

import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type RevenueRow = inferRouterOutputs<AppRouter>["vendor"]["revenue"]["list"]["docs"][number];

type ClosedOrderRevenueTableProps = {
  rows: RevenueRow[];
  isLoading?: boolean;
};

export function ClosedOrderRevenueTable({ rows, isLoading }: ClosedOrderRevenueTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
        No closed sales yet. Add revenue from a store visit or expo, or mark orders as Complete in
        My Orders.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Closed date</TableHead>
            <TableHead>Closed order</TableHead>
            <TableHead>Product details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sale type</TableHead>
            <TableHead className="text-right">Sale price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(row.closedDate), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Link
                  href={`/vendor/orders/${row.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {row.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="min-w-[220px]">
                <div className="font-medium text-foreground">{row.productDetails}</div>
                {row.description ? (
                  <div className="mt-1 text-xs text-muted-foreground">{row.description}</div>
                ) : null}
                {row.quantity > 1 ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatCurrency(row.unitPrice)} each
                  </div>
                ) : null}
              </TableCell>
              <TableCell>
                <Badge variant="default">{row.orderStatusLabel}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={row.orderSource === "online" ? "default" : "secondary"}>
                  {row.orderSourceLabel}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(row.salePrice)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
