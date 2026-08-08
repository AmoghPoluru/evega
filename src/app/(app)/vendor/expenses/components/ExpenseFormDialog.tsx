"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import {
  VENDOR_EXPENSE_CATEGORIES,
  type VendorExpenseCategoryId,
} from "@/lib/vendor-expenses/categories";

type ExpenseListItem =
  inferRouterOutputs<AppRouter>["vendor"]["expenses"]["list"]["docs"][number];

type ExpenseFormState = {
  category: VendorExpenseCategoryId;
  expenseDate: string;
  amount: string;
  description: string;
};

type ExpenseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseListItem | null;
  onSaved: () => void;
};

function emptyFormState(): ExpenseFormState {
  return {
    category: "other",
    expenseDate: new Date().toISOString().slice(0, 10),
    amount: "",
    description: "",
  };
}

function toFormState(expense: ExpenseListItem): ExpenseFormState {
  const dateValue = expense.expenseDate
    ? format(new Date(expense.expenseDate), "yyyy-MM-dd")
    : new Date().toISOString().slice(0, 10);

  return {
    category: expense.category as VendorExpenseCategoryId,
    expenseDate: dateValue,
    amount: String(expense.amount ?? ""),
    description: expense.description ?? "",
  };
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  onSaved,
}: ExpenseFormDialogProps) {
  const isEditing = Boolean(expense);
  const [form, setForm] = useState<ExpenseFormState>(emptyFormState);

  useEffect(() => {
    if (!open) return;
    setForm(expense ? toFormState(expense) : emptyFormState());
  }, [open, expense]);

  const createExpense = trpc.vendor.expenses.create.useMutation({
    onSuccess: () => {
      toast.success("Expense added");
      onSaved();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add expense");
    },
  });

  const updateExpense = trpc.vendor.expenses.update.useMutation({
    onSuccess: () => {
      toast.success("Expense updated");
      onSaved();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update expense");
    },
  });

  const isPending = createExpense.isPending || updateExpense.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const amount = Number.parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid expense amount");
      return;
    }

    const payload = {
      category: form.category,
      expenseDate: form.expenseDate,
      amount,
      description: form.description.trim(),
    };

    if (isEditing && expense) {
      updateExpense.mutate({ id: expense.id, ...payload });
      return;
    }

    createExpense.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>
            Record what you spent for inventory, rent, marketing, Zvastra, and other business costs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  category: value as VendorExpenseCategoryId,
                }))
              }
            >
              <SelectTrigger id="expense-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_EXPENSE_CATEGORIES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expense-date">Date of expense</Label>
              <Input
                id="expense-date"
                type="date"
                value={form.expenseDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, expenseDate: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount">Expense amount</Label>
              <Input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: event.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-description">Description</Label>
            <Textarea
              id="expense-description"
              rows={3}
              placeholder="e.g. March shop rent, Instagram ad campaign, saree stock purchase"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Add expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExpenseRowActions({
  expense,
  onChanged,
}: {
  expense: ExpenseListItem;
  onChanged: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const utils = trpc.useUtils();

  const deleteExpense = trpc.vendor.expenses.delete.useMutation({
    onSuccess: async () => {
      toast.success("Expense deleted");
      await utils.vendor.expenses.list.invalidate();
      await utils.vendor.expenses.summary.invalidate();
      onChanged();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={deleteExpense.isPending}
          onClick={() => {
            if (window.confirm("Delete this expense?")) {
              deleteExpense.mutate({ id: expense.id });
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ExpenseFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        expense={expense}
        onSaved={() => {
          void utils.vendor.expenses.list.invalidate();
          void utils.vendor.expenses.summary.invalidate();
          onChanged();
        }}
      />
    </>
  );
}
