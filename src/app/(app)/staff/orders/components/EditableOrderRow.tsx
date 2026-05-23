"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { Check, Loader2, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { OrderItemsEditor, type ProductPickerOption } from "./OrderItemsEditor";
import {
  type OrderDraft,
  type OrderRow,
  type OrderStatus,
  formatItemsSummary,
  getCustomerLabel,
} from "../order-utils";

interface EditableOrderRowProps {
  order: OrderRow;
  isEditing: boolean;
  isSaving: boolean;
  draft: OrderDraft;
  fieldErrors: Partial<Record<keyof OrderDraft, string>>;
  products: ProductPickerOption[];
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveRow: () => void;
  onDraftChange: (patch: Partial<OrderDraft>) => void;
  onRecalculateTotal: () => void;
  onQuickStatusChange: (status: OrderStatus) => void;
  onArchive: () => void;
  disabled?: boolean;
  isQuickStatusUpdating?: boolean;
}

export function EditableOrderRow({
  order,
  isEditing,
  isSaving,
  draft,
  fieldErrors,
  products,
  onStartEdit,
  onCancelEdit,
  onSaveRow,
  onDraftChange,
  onRecalculateTotal,
  onQuickStatusChange,
  onArchive,
  disabled,
  isQuickStatusUpdating,
}: EditableOrderRowProps) {
  const orderNumber = order.orderNumber || order.id;
  const itemsSummary = order.itemsSummary || formatItemsSummary(order);

  useEffect(() => {
    if (!isEditing) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancelEdit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isEditing, onCancelEdit]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

  return (
    <TableRow
      className={cn(
        isEditing && "bg-blue-50/50",
        (isSaving || disabled) && "pointer-events-none opacity-70",
      )}
    >
      <TableCell
        className={cn("font-medium", !isEditing && "cursor-pointer hover:bg-gray-50")}
        onClick={() => !isEditing && !disabled && onStartEdit()}
      >
        {orderNumber}
      </TableCell>

      <TableCell
        className={cn(!isEditing && "cursor-pointer hover:bg-gray-50")}
        onClick={() => !isEditing && !disabled && onStartEdit()}
      >
        {isEditing ? (
          <Input
            value={draft.name}
            onChange={(e) => onDraftChange({ name: e.target.value })}
            className={cn("h-8", fieldErrors.name && "border-red-500")}
            aria-label={`Customer name for order ${orderNumber}`}
          />
        ) : (
          <div className="max-w-[180px] truncate" title={getCustomerLabel(order)}>
            {getCustomerLabel(order)}
          </div>
        )}
      </TableCell>

      <TableCell className="text-sm text-gray-600">
        <div className="max-w-[140px] truncate" title={order.vendorName || "—"}>
          {order.vendorName || "—"}
        </div>
      </TableCell>

      <TableCell
        className={cn(!isEditing && "cursor-pointer hover:bg-gray-50")}
        onClick={() => !isEditing && !disabled && onStartEdit()}
      >
        {isEditing ? (
          <OrderItemsEditor
            draft={draft}
            products={products}
            fieldErrors={fieldErrors}
            onChange={onDraftChange}
            onRecalculateTotal={onRecalculateTotal}
            compact
          />
        ) : (
          <div className="max-w-[220px] text-sm">
            <div className="font-medium text-gray-900">{itemsSummary}</div>
          </div>
        )}
      </TableCell>

      <TableCell
        className={cn(!isEditing && "cursor-pointer hover:bg-gray-50")}
        onClick={() => !isEditing && !disabled && onStartEdit()}
      >
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={draft.total}
            onChange={(e) =>
              onDraftChange({ total: e.target.value === "" ? 0 : Number(e.target.value) })
            }
            className={cn("h-8 w-28", fieldErrors.total && "border-red-500")}
          />
        ) : (
          <span className="font-medium">{formatCurrency(order.total || 0)}</span>
        )}
      </TableCell>

      <TableCell onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <OrderStatusSelect
            value={draft.status}
            onChange={(status) => onDraftChange({ status })}
            disabled={isSaving}
          />
        ) : isQuickStatusUpdating ? (
          <span className="text-xs text-gray-500">Saving…</span>
        ) : (
          <OrderStatusSelect
            value={(order.status || "pending") as OrderStatus}
            onChange={(status) => onQuickStatusChange(status)}
            disabled={disabled}
          />
        )}
      </TableCell>

      <TableCell className="text-sm text-gray-600">
        {order.createdAt ? (
          <>
            <div>{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
            <div className="text-xs text-gray-500">{format(new Date(order.createdAt), "h:mm a")}</div>
          </>
        ) : (
          "—"
        )}
      </TableCell>

      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-700"
                onClick={onSaveRow}
                disabled={isSaving}
                title="Save"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onCancelEdit}
                disabled={isSaving}
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onStartEdit}
                disabled={disabled}
                title="Edit row"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={disabled}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onStartEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit row
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={onArchive}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
