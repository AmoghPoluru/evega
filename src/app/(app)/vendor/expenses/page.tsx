"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Receipt, Search, X } from "lucide-react";

import { trpc } from "@/trpc/client";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { VENDOR_EXPENSE_CATEGORIES } from "@/lib/vendor-expenses/categories";
import { ExpenseFormDialog } from "./components/ExpenseFormDialog";
import { ExpensesTable } from "./components/ExpensesTable";

export default function VendorExpensesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.vendor.expenses.list.useQuery({
    search: debouncedSearch || undefined,
    category: category as "all" | (typeof VENDOR_EXPENSE_CATEGORIES)[number]["id"],
    page,
    limit: 20,
  });

  const { data: summary, isLoading: summaryLoading } = trpc.vendor.expenses.summary.useQuery({
    category: category as "all" | (typeof VENDOR_EXPENSE_CATEGORIES)[number]["id"],
  });

  const refreshExpenses = () => {
    void utils.vendor.expenses.list.invalidate();
    void utils.vendor.expenses.summary.invalidate();
  };

  const expenses = data?.docs ?? [];
  const totalDocs = data?.totalDocs ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">{vendorPageTitles.expenses}</h1>
          </div>
          <p className="text-sm text-gray-600">
            Record rent, inventory purchases, marketing, Zvastra fees, and other business costs.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add expense
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-semibold">{formatCurrency(summary?.totalAmount ?? 0)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expense entries</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold">{summary?.count ?? 0}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {summary?.byCategory?.length ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses by category
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {summary.byCategory.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span>{item.label}</span>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search descriptions..."
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

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {VENDOR_EXPENSE_CATEGORIES.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
          Failed to load expenses: {error.message}
        </div>
      ) : (
        <ExpensesTable expenses={expenses} isLoading={isLoading} onChanged={refreshExpenses} />
      )}

      {totalDocs > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, totalDocs)} of {totalDocs} expenses
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
        View sales revenue in{" "}
        <Link href="/vendor/revenue" className="font-medium text-primary hover:underline">
          My Revenue
        </Link>
        .
      </p>

      <ExpenseFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={refreshExpenses}
      />
    </div>
  );
}
