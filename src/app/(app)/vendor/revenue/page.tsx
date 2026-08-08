"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Plus, Search, X } from "lucide-react";

import { trpc } from "@/trpc/client";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { ClosedOrderRevenueTable } from "./components/ClosedOrderRevenueTable";
import { RevenueFormDialog } from "./components/RevenueFormDialog";

export default function VendorRevenuePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const utils = trpc.useUtils();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: summary, isLoading: summaryLoading } = trpc.vendor.revenue.summary.useQuery();
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = trpc.vendor.revenue.list.useQuery({
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });

  const revenueRows = revenueData?.docs ?? [];
  const totalDocs = revenueData?.totalDocs ?? 0;
  const totalPages = revenueData?.totalPages ?? 1;

  const refreshRevenue = () => {
    void utils.vendor.revenue.list.invalidate();
    void utils.vendor.revenue.summary.invalidate();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">{vendorPageTitles.revenue}</h1>
          </div>
          <p className="text-sm text-gray-600">
            All revenue comes from closed orders (Complete status). Add revenue here to create a
            closed manual order, or mark orders Complete in My Orders.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add revenue
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-semibold text-green-700">
                {formatCurrency(summary?.totalRevenue ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closed orders</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold">{summary?.closedOrderCount ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online sales</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold">{summary?.onlineCount ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manual sales</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold">{summary?.manualCount ?? 0}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order #, description, or expo..."
          className="pl-10 pr-10"
        />
        {search ? (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {revenueError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
          Failed to load revenue: {revenueError.message}
        </div>
      ) : (
        <ClosedOrderRevenueTable rows={revenueRows} isLoading={revenueLoading} />
      )}

      {totalDocs > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, totalDocs)} of {totalDocs} closed
            sales
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Track business costs in{" "}
        <Link href="/vendor/expenses" className="font-medium text-primary hover:underline">
          My Expenses
        </Link>
        .
      </p>

      <RevenueFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={refreshRevenue}
      />
    </div>
  );
}
