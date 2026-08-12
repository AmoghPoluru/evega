"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  isExpenseDraftEmpty,
  validateExpenseDraft,
  type ExpenseDraftErrors,
  type ExpenseDraftFields,
  type ValidatedExpenseDraft,
} from "@/lib/vendor-expenses/expense-row-validation";
import {
  VENDOR_EXPENSE_CATEGORIES,
  type VendorExpenseCategoryId,
} from "@/lib/vendor-expenses/categories";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type ExpenseListItem =
  inferRouterOutputs<AppRouter>["vendor"]["expenses"]["list"]["docs"][number];

type BulkRow = ExpenseDraftFields & {
  rowId: string;
  sourceId: string | null;
  isNew: boolean;
  isDeleted: boolean;
};

type ExpensesBulkEditGridProps = {
  category: "all" | VendorExpenseCategoryId;
  search: string;
  onExit: () => void;
  onSaved: () => void;
};

function createRowId(): string {
  return `new-${crypto.randomUUID()}`;
}

function emptyRow(): BulkRow {
  return {
    rowId: createRowId(),
    sourceId: null,
    isNew: true,
    isDeleted: false,
    category: "other",
    expenseDate: new Date().toISOString().slice(0, 10),
    amount: "",
    description: "",
  };
}

function fromExpense(expense: ExpenseListItem): BulkRow {
  return {
    rowId: expense.id,
    sourceId: expense.id,
    isNew: false,
    isDeleted: false,
    category: expense.category as VendorExpenseCategoryId,
    expenseDate: expense.expenseDate
      ? format(new Date(expense.expenseDate), "yyyy-MM-dd")
      : new Date().toISOString().slice(0, 10),
    amount: expense.amount != null ? String(expense.amount) : "",
    description: expense.description ?? "",
  };
}

function serializeRow(row: BulkRow): string {
  return JSON.stringify({
    sourceId: row.sourceId,
    isNew: row.isNew,
    isDeleted: row.isDeleted,
    category: row.category,
    expenseDate: row.expenseDate,
    amount: row.amount,
    description: row.description,
  });
}

function rowsAreEqual(a: BulkRow[], b: BulkRow[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, index) => serializeRow(row) === serializeRow(b[index]!));
}

function parsePastedRows(text: string): ExpenseDraftFields[] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split("\t"))
    .filter((cells) => cells.some((cell) => cell.trim()))
    .map((cells) => {
      const [dateCell, categoryCell, descriptionCell, amountCell] = cells;
      const categoryMatch = VENDOR_EXPENSE_CATEGORIES.find(
        (item) =>
          item.label.toLowerCase() === categoryCell?.trim().toLowerCase() ||
          item.id === categoryCell?.trim().toLowerCase(),
      );

      return {
        expenseDate: dateCell?.trim() ?? "",
        category: categoryMatch?.id ?? "other",
        description: descriptionCell?.trim() ?? "",
        amount: amountCell?.replace(/[$,]/g, "").trim() ?? "",
      };
    });
}

export function ExpensesBulkEditGrid({
  category,
  search,
  onExit,
  onSaved,
}: ExpensesBulkEditGridProps) {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [baseline, setBaseline] = useState<BulkRow[]>([]);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [rowErrors, setRowErrors] = useState<Record<string, ExpenseDraftErrors>>({});
  const gridRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = trpc.vendor.expenses.listForBulkEdit.useQuery({
    category,
    search: search || undefined,
  });

  const bulkSave = trpc.vendor.expenses.bulkSave.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Saved ${result.createdCount + result.updatedCount + result.deletedCount} change${
          result.createdCount + result.updatedCount + result.deletedCount === 1 ? "" : "s"
        }`,
      );
      onSaved();
      onExit();
    },
    onError: (saveError) => {
      toast.error(saveError.message || "Failed to save expenses");
    },
  });

  useEffect(() => {
    if (!data) return;
    const nextRows = data.docs.map(fromExpense);
    setRows(nextRows);
    setBaseline(nextRows);
    setRowErrors({});
  }, [data]);

  const isDirty = useMemo(() => !rowsAreEqual(rows, baseline), [rows, baseline]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const stats = useMemo(() => {
    let updates = 0;
    let creates = 0;
    let deletes = 0;

    for (const row of rows) {
      if (row.isDeleted && row.sourceId) {
        deletes += 1;
        continue;
      }

      if (row.isDeleted || isExpenseDraftEmpty(row)) continue;

      if (row.isNew) {
        creates += 1;
        continue;
      }

      const original = baseline.find((item) => item.sourceId === row.sourceId);
      if (original && serializeRow(original) !== serializeRow(row)) {
        updates += 1;
      }
    }

    return { updates, creates, deletes, total: updates + creates + deletes };
  }, [rows, baseline]);

  const updateRow = useCallback((rowId: string, patch: Partial<BulkRow>) => {
    setRows((current) =>
      current.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
    );
    setRowErrors((current) => {
      if (!current[rowId]) return current;
      const next = { ...current };
      delete next[rowId];
      return next;
    });
  }, []);

  const handleAddRow = () => {
    setRows((current) => [...current, emptyRow()]);
  };

  const handleDeleteRow = (rowId: string) => {
    setRows((current) =>
      current.map((row) => {
        if (row.rowId !== rowId) return row;
        if (row.isNew) return { ...row, isDeleted: true };
        return { ...row, isDeleted: true };
      }),
    );
  };

  const handleRestoreRow = (rowId: string) => {
    const original = baseline.find((row) => row.rowId === rowId);
    if (original) {
      setRows((current) =>
        current.map((row) => (row.rowId === rowId ? { ...original, isDeleted: false } : row)),
      );
      return;
    }

    updateRow(rowId, { isDeleted: false });
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const text = event.clipboardData.getData("text/plain");
    if (!text.includes("\t") && !text.includes("\n")) return;

    event.preventDefault();
    const pasted = parsePastedRows(text);
    if (pasted.length === 0) return;

    const newRows = pasted.map((fields) => ({
      ...emptyRow(),
      ...fields,
    }));

    setRows((current) => [...current, ...newRows]);
    toast.success(`Added ${newRows.length} row${newRows.length === 1 ? "" : "s"} from paste`);
  };

  const handleSave = () => {
    const nextErrors: Record<string, ExpenseDraftErrors> = {};
    const updates: Array<ValidatedExpenseDraft & { id: string }> = [];
    const creates: ValidatedExpenseDraft[] = [];
    const deletes: string[] = [];

    for (const row of rows) {
      if (row.isDeleted) {
        if (row.sourceId) deletes.push(row.sourceId);
        continue;
      }

      if (isExpenseDraftEmpty(row)) continue;

      const validated = validateExpenseDraft(row);
      if (!validated.ok) {
        nextErrors[row.rowId] = validated.errors;
        continue;
      }

      if (row.isNew) {
        creates.push(validated.value);
        continue;
      }

      if (row.sourceId) {
        const original = baseline.find((item) => item.sourceId === row.sourceId);
        if (!original || serializeRow(original) !== serializeRow(row)) {
          updates.push({ id: row.sourceId, ...validated.value });
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setRowErrors(nextErrors);
      toast.error("Fix highlighted rows before saving");
      return;
    }

    if (updates.length === 0 && creates.length === 0 && deletes.length === 0) {
      toast.message("No changes to save");
      return;
    }

    bulkSave.mutate({ updates, creates, deletes });
  };

  const requestExit = () => {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    onExit();
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
        Failed to load expenses for bulk edit: {error.message}
      </div>
    );
  }

  const visibleRows = rows.filter((row) => !(row.isNew && row.isDeleted));

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Bulk edit</p>
            <p className="text-xs text-muted-foreground">
              Editing {data?.docs.length ?? 0} expense
              {(data?.docs.length ?? 0) === 1 ? "" : "s"}
              {category !== "all" ? ` · ${VENDOR_EXPENSE_CATEGORIES.find((c) => c.id === category)?.label}` : ""}
              {search.trim() ? ` · Search: “${search.trim()}”` : ""}
            </p>
            {data?.truncated ? (
              <p className="text-xs text-amber-700">
                Showing first {data.maxRows} matches. Narrow filters to edit the rest.
              </p>
            ) : null}
            {isDirty ? (
              <p className="text-xs text-muted-foreground">
                {stats.total} unsaved change{stats.total === 1 ? "" : "s"}
                {stats.creates ? ` · ${stats.creates} new` : ""}
                {stats.deletes ? ` · ${stats.deletes} deleted` : ""}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={requestExit}>
              {isDirty ? "Discard" : "Done"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isDirty || bulkSave.isPending}
              onClick={handleSave}
            >
              {bulkSave.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                `Save changes${stats.total ? ` (${stats.total})` : ""}`
              )}
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={gridRef}
        className="overflow-x-auto rounded-lg border"
        onPaste={handlePaste}
      >
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b text-left">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium text-right">Amount</th>
              <th className="px-3 py-2 font-medium text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">
                  No rows yet. Add a row or paste from Excel.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const errors = rowErrors[row.rowId];
                return (
                  <tr
                    key={row.rowId}
                    className={cn(
                      "border-b align-top",
                      row.isDeleted && "bg-destructive/5 opacity-70",
                      row.isNew && !row.isDeleted && "bg-emerald-50/60",
                      !row.isNew &&
                        !row.isDeleted &&
                        baseline.find((item) => item.rowId === row.rowId) &&
                        serializeRow(baseline.find((item) => item.rowId === row.rowId)!) !==
                          serializeRow(row) &&
                        "border-l-2 border-l-amber-400",
                    )}
                  >
                    <td className="px-3 py-2">
                      {row.isDeleted ? (
                        <span className="text-muted-foreground line-through">
                          {row.expenseDate || "—"}
                        </span>
                      ) : (
                        <Input
                          type="date"
                          value={row.expenseDate}
                          aria-invalid={Boolean(errors?.expenseDate)}
                          onChange={(event) =>
                            updateRow(row.rowId, { expenseDate: event.target.value })
                          }
                          className={cn("h-9", errors?.expenseDate && "border-destructive")}
                        />
                      )}
                      {errors?.expenseDate ? (
                        <p className="mt-1 text-xs text-destructive">{errors.expenseDate}</p>
                      ) : null}
                    </td>

                    <td className="px-3 py-2">
                      {row.isDeleted ? (
                        <Badge variant="secondary" className="line-through">
                          {VENDOR_EXPENSE_CATEGORIES.find((item) => item.id === row.category)?.label}
                        </Badge>
                      ) : (
                        <Select
                          value={row.category}
                          onValueChange={(value) =>
                            updateRow(row.rowId, { category: value as VendorExpenseCategoryId })
                          }
                        >
                          <SelectTrigger
                            className={cn("h-9", errors?.category && "border-destructive")}
                          >
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {VENDOR_EXPENSE_CATEGORIES.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {errors?.category ? (
                        <p className="mt-1 text-xs text-destructive">{errors.category}</p>
                      ) : null}
                    </td>

                    <td className="px-3 py-2">
                      {row.isDeleted ? (
                        <span className="line-through text-muted-foreground">{row.description}</span>
                      ) : (
                        <Input
                          value={row.description}
                          aria-invalid={Boolean(errors?.description)}
                          placeholder="What was this expense for?"
                          onChange={(event) =>
                            updateRow(row.rowId, { description: event.target.value })
                          }
                          className={cn("h-9", errors?.description && "border-destructive")}
                        />
                      )}
                      {errors?.description ? (
                        <p className="mt-1 text-xs text-destructive">{errors.description}</p>
                      ) : null}
                    </td>

                    <td className="px-3 py-2">
                      {row.isDeleted ? (
                        <span className="block text-right line-through text-muted-foreground">
                          {row.amount || "—"}
                        </span>
                      ) : (
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={row.amount}
                          aria-invalid={Boolean(errors?.amount)}
                          placeholder="0.00"
                          onChange={(event) => updateRow(row.rowId, { amount: event.target.value })}
                          className={cn("h-9 text-right", errors?.amount && "border-destructive")}
                        />
                      )}
                      {errors?.amount ? (
                        <p className="mt-1 text-right text-xs text-destructive">{errors.amount}</p>
                      ) : null}
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        {row.isNew && !row.isDeleted ? (
                          <Badge variant="outline" className="mr-1 text-[10px]">
                            New
                          </Badge>
                        ) : null}
                        {row.isDeleted ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestoreRow(row.rowId)}
                          >
                            Undo
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            aria-label="Delete row"
                            onClick={() => handleDeleteRow(row.rowId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleAddRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add row
        </Button>
        <p className="text-xs text-muted-foreground">
          Tip: paste rows from Excel with columns Date, Category, Description, Amount.
        </p>
      </div>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {stats.total} unsaved change{stats.total === 1 ? "" : "s"}. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false);
                onExit();
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
