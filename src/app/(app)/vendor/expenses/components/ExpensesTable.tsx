"use client";

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
import { ExpenseRowActions } from "./ExpenseFormDialog";

type ExpenseListItem =
  inferRouterOutputs<AppRouter>["vendor"]["expenses"]["list"]["docs"][number];

type ExpensesTableProps = {
  expenses: ExpenseListItem[];
  isLoading?: boolean;
  onChanged: () => void;
};

export function ExpensesTable({ expenses, isLoading, onChanged }: ExpensesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
        No expenses recorded yet. Add your first expense to start tracking business costs.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Expense</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="whitespace-nowrap">
                {expense.expenseDate
                  ? format(new Date(expense.expenseDate), "MMM d, yyyy")
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{expense.categoryLabel}</Badge>
              </TableCell>
              <TableCell className="max-w-md">{expense.description}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(expense.amount ?? 0)}
              </TableCell>
              <TableCell>
                <ExpenseRowActions expense={expense} onChanged={onChanged} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
