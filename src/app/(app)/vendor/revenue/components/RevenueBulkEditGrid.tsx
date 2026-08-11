"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Loader2, Lock, Plus, Trash2 } from "lucide-react";
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
  isRevenueDraftEmpty,
  validateRevenueDraft,
  type BulkRevenueRowInput,
  type RevenueDraftErrors,
  type RevenueDraftFields,
} from "@/lib/vendor-revenue/revenue-row-validation";
import {
  VENDOR_SALE_CONTEXTS,
  type VendorSaleContextId,
} from "@/lib/vendor-revenue/sale-context";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type RevenueListItem =
  inferRouterOutputs<AppRouter>["vendor"]["revenue"]["list"]["docs"][number];

type BulkRow = RevenueDraftFields & {
  rowId: string;
  sourceId: string | null;
  isNew: boolean;
  isDeleted: boolean;
  isReadOnly: boolean;
  orderNumber: string | null;
};

type RevenueBulkEditGridProps = {
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
    isReadOnly: false,
    orderNumber: null,
    saleDate: new Date().toISOString().slice(0, 10),
    saleContext: "other",
    expoName: "",
    description: "",
    amount: "",
  };
}

function fromRevenue(row: RevenueListItem): BulkRow {
  return {
    rowId: row.id,
    sourceId: row.id,
    isNew: false,
    isDeleted: false,
    isReadOnly: !row.isEditable,
    orderNumber: row.orderNumber,
    saleDate: format(new Date(row.closedDate), "yyyy-MM-dd"),
    saleContext: row.saleContextId ?? "other",
    expoName: row.expoName ?? "",
    description: row.revenueDescription ?? row.description ?? "",
    amount: row.salePrice != null ? String(row.salePrice) : "",
  };
}

function serializeRow(row: BulkRow): string {
  return JSON.stringify({
    sourceId: row.sourceId,
    isNew: row.isNew,
    isDeleted: row.isDeleted,
    isReadOnly: row.isReadOnly,
    saleDate: row.saleDate,
    saleContext: row.saleContext,
    expoName: row.expoName,
    description: row.description,
    amount: row.amount,
  });
}

function rowsAreEqual(a: BulkRow[], b: BulkRow[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, index) => serializeRow(row) === serializeRow(b[index]!));
}

function parsePastedRows(text: string): RevenueDraftFields[] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split("\t"))
    .filter((cells) => cells.some((cell) => cell.trim()))
    .map((cells) => {
      const [dateCell, contextCell, descriptionCell, expoCell, amountCell] = cells;
      const contextMatch = VENDOR_SALE_CONTEXTS.find(
        (item) =>
          item.label.toLowerCase() === contextCell?.trim().toLowerCase() ||
          item.id === contextCell?.trim().toLowerCase(),
      );

      return {
        saleDate: dateCell?.trim() ?? "",
        saleContext: contextMatch?.id ?? "other",
        description: descriptionCell?.trim() ?? "",
        expoName: expoCell?.trim() ?? "",
        amount: amountCell?.replace(/[$,]/g, "").trim() ?? "",
      };
    });
}

export function RevenueBulkEditGrid({ search, onExit, onSaved }: RevenueBulkEditGridProps) {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [baseline, setBaseline] = useState<BulkRow[]>([]);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [rowErrors, setRowErrors] = useState<Record<string, RevenueDraftErrors>>({});
  const gridRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = trpc.vendor.revenue.listForBulkEdit.useQuery({
    search: search || undefined,
  });

  const bulkSave = trpc.vendor.revenue.bulkSave.useMutation({
    onSuccess: (result) => {
      const total = result.createdCount + result.updatedCount + result.deletedCount;
      toast.success(`Saved ${total} change${total === 1 ? "" : "s"}`);
      onSaved();
      onExit();
    },
    onError: (saveError) => {
      toast.error(saveError.message || "Failed to save revenue changes");
    },
  });

  useEffect(() => {
    if (!data) return;
    const nextRows = data.docs.map(fromRevenue);
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

      if (row.isDeleted || row.isReadOnly || isRevenueDraftEmpty(row)) continue;

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
      current.map((row) => (row.rowId === rowId ? { ...row, isDeleted: true } : row)),
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
    const nextErrors: Record<string, RevenueDraftErrors> = {};
    const updates: Array<BulkRevenueRowInput & { id: string }> = [];
    const creates: BulkRevenueRowInput[] = [];
    const deletes: string[] = [];

    for (const row of rows) {
      if (row.isDeleted) {
        if (row.sourceId && !row.isReadOnly) deletes.push(row.sourceId);
        continue;
      }

      if (row.isReadOnly || isRevenueDraftEmpty(row)) continue;

      const validated = validateRevenueDraft(row);
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
        Failed to load revenue for bulk edit: {error.message}
      </div>
    );
  }

  const visibleRows = rows.filter((row) => !(row.isNew && row.isDeleted));

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Bulk edit</p>
            <p className="text-xs text-muted-foreground">
              Editing {data?.docs.length ?? 0} closed sale{(data?.docs.length ?? 0) === 1 ? "" : "s"}
              {search.trim() ? ` · Search: “${search.trim()}”` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Online orders and manual sales with product line items are read-only here.
            </p>
            {data?.truncated ? (
              <p className="text-xs text-amber-700">
                Showing first {data.maxRows} matches. Narrow your search to edit the rest.
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

      <div ref={gridRef} className="overflow-x-auto rounded-lg border" onPaste={handlePaste}>
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b text-left">
              <th className="px-3 py-2 font-medium">Closed date</th>
              <th className="px-3 py-2 font-medium">Order #</th>
              <th className="px-3 py-2 font-medium">Sale type</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium">Expo / event</th>
              <th className="px-3 py-2 font-medium text-right">Amount</th>
              <th className="px-3 py-2 font-medium text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  No rows yet. Add a manual sale or paste from Excel.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const errors = rowErrors[row.rowId];
                const readOnly = row.isReadOnly && !row.isNew;

                return (
                  <tr
                    key={row.rowId}
                    className={cn(
                      "border-b align-top",
                      readOnly && "bg-muted/30",
                      row.isDeleted && "bg-destructive/5 opacity-70",
                      row.isNew && !row.isDeleted && "bg-emerald-50/60",
                      !row.isNew &&
                        !row.isDeleted &&
                        !readOnly &&
                        baseline.find((item) => item.rowId === row.rowId) &&
                        serializeRow(baseline.find((item) => item.rowId === row.rowId)!) !==
                          serializeRow(row) &&
                        "border-l-2 border-l-amber-400",
                    )}
                  >
                    <td className="px-3 py-2">
                      {readOnly || row.isDeleted ? (
                        <span className={cn(readOnly && "text-muted-foreground", row.isDeleted && "line-through")}>
                          {row.saleDate || "—"}
                        </span>
                      ) : (
                        <>
                          <Input
                            type="date"
                            value={row.saleDate}
                            aria-invalid={Boolean(errors?.saleDate)}
                            onChange={(event) =>
                              updateRow(row.rowId, { saleDate: event.target.value })
                            }
                            className={cn("h-9", errors?.saleDate && "border-destructive")}
                          />
                          {errors?.saleDate ? (
                            <p className="mt-1 text-xs text-destructive">{errors.saleDate}</p>
                          ) : null}
                        </>
                      )}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {row.orderNumber && row.sourceId ? (
                        <Link
                          href={`/vendor/orders/${row.sourceId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {row.orderNumber}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">New</span>
                      )}
                      {readOnly ? (
                        <Badge variant="outline" className="ml-2 gap-1 text-[10px]">
                          <Lock className="h-3 w-3" />
                          Read-only
                        </Badge>
                      ) : null}
                    </td>

                    <td className="px-3 py-2">
                      {readOnly || row.isDeleted ? (
                        <span className={row.isDeleted ? "line-through text-muted-foreground" : ""}>
                          {VENDOR_SALE_CONTEXTS.find((item) => item.id === row.saleContext)?.label ??
                            "Other"}
                        </span>
                      ) : (
                        <>
                          <Select
                            value={row.saleContext}
                            onValueChange={(value) =>
                              updateRow(row.rowId, {
                                saleContext: value as VendorSaleContextId,
                                expoName: value === "expo" ? row.expoName : "",
                              })
                            }
                          >
                            <SelectTrigger
                              className={cn("h-9", errors?.saleContext && "border-destructive")}
                            >
                              <SelectValue placeholder="Sale type" />
                            </SelectTrigger>
                            <SelectContent>
                              {VENDOR_SALE_CONTEXTS.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors?.saleContext ? (
                            <p className="mt-1 text-xs text-destructive">{errors.saleContext}</p>
                          ) : null}
                        </>
                      )}
                    </td>

                    <td className="px-3 py-2">
                      {readOnly || row.isDeleted ? (
                        <span className={cn("block max-w-xs", row.isDeleted && "line-through text-muted-foreground")}>
                          {row.description || "—"}
                        </span>
                      ) : (
                        <>
                          <Input
                            value={row.description}
                            aria-invalid={Boolean(errors?.description)}
                            placeholder="What was sold?"
                            onChange={(event) =>
                              updateRow(row.rowId, { description: event.target.value })
                            }
                            className={cn("h-9", errors?.description && "border-destructive")}
                          />
                          {errors?.description ? (
                            <p className="mt-1 text-xs text-destructive">{errors.description}</p>
                          ) : null}
                        </>
                      )}
                    </td>

                    <td className="px-3 py-2">
                      {readOnly || row.isDeleted ? (
                        <span className={row.isDeleted ? "line-through text-muted-foreground" : ""}>
                          {row.expoName || "—"}
                        </span>
                      ) : row.saleContext === "expo" ? (
                        <>
                          <Input
                            value={row.expoName}
                            aria-invalid={Boolean(errors?.expoName)}
                            placeholder="Expo name"
                            onChange={(event) =>
                              updateRow(row.rowId, { expoName: event.target.value })
                            }
                            className={cn("h-9", errors?.expoName && "border-destructive")}
                          />
                          {errors?.expoName ? (
                            <p className="mt-1 text-xs text-destructive">{errors.expoName}</p>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="px-3 py-2">
                      {readOnly || row.isDeleted ? (
                        <span
                          className={cn(
                            "block text-right",
                            row.isDeleted && "line-through text-muted-foreground",
                          )}
                        >
                          {row.amount || "—"}
                        </span>
                      ) : (
                        <>
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
                          {errors?.amount ? (
                            <p className="mt-1 text-right text-xs text-destructive">{errors.amount}</p>
                          ) : null}
                        </>
                      )}
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        {row.isNew && !row.isDeleted ? (
                          <Badge variant="outline" className="mr-1 text-[10px]">
                            New
                          </Badge>
                        ) : null}
                        {readOnly ? null : row.isDeleted ? (
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
          Tip: paste from Excel with columns Date, Sale type, Description, Expo, Amount. New rows use
          sale type Other unless you pick Expo.
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
