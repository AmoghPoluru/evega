"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EditableOrderRow } from "./EditableOrderRow";
import type { ProductPickerOption } from "./OrderItemsEditor";
import {
  type OrderDraft,
  type OrderRow,
  type OrderStatus,
  draftsEqual,
  orderDraftSchema,
  orderToDraft,
} from "../order-utils";

interface AdminOrdersTableProps {
  orders: OrderRow[];
  isLoading: boolean;
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

function getVendorId(order: OrderRow): string | undefined {
  if (typeof order.vendor === "object" && order.vendor) {
    return order.vendor.id;
  }
  if (typeof order.vendor === "string") {
    return order.vendor;
  }
  return undefined;
}

export function AdminOrdersTable({
  orders,
  isLoading,
  totalDocs,
  totalPages,
  currentPage,
  onPageChange,
}: AdminOrdersTableProps) {
  const utils = trpc.useUtils();
  const [deleteTarget, setDeleteTarget] = useState<OrderRow | null>(null);
  const [quickStatusId, setQuickStatusId] = useState<string | null>(null);

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [originalDraft, setOriginalDraft] = useState<OrderDraft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof OrderDraft, string>>>({});
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [pendingEditOrderId, setPendingEditOrderId] = useState<string | null>(null);
  const [canceledConfirmOpen, setCanceledConfirmOpen] = useState(false);
  const [pendingCanceledSave, setPendingCanceledSave] = useState<{
    orderId: string;
    draft: OrderDraft;
  } | null>(null);

  const editingOrder = useMemo(
    () => orders.find((o) => o.id === editingRowId) ?? null,
    [orders, editingRowId],
  );

  const { data: pickerProducts = [] } = trpc.admin.orders.productPicker.useQuery(
    { vendorId: editingOrder ? getVendorId(editingOrder) : undefined, limit: 200 },
    { enabled: Boolean(editingRowId) },
  );

  const productOptions = useMemo((): ProductPickerOption[] => {
    const base: ProductPickerOption[] = pickerProducts.map((p: { id: string; name: string; price: number }) => ({
      id: p.id,
      name: p.name,
      price: p.price,
    }));
    if (!editingOrder || !draft?.product) return base;
    if (base.some((p) => p.id === draft.product)) return base;
    const qty = draft.quantity || 1;
    const fallbackPrice =
      draft.total && qty > 0 ? Math.round((draft.total / qty) * 100) / 100 : 0;
    return [
      {
        id: draft.product,
        name: editingOrder.productName || "Current product",
        price: fallbackPrice,
      },
      ...base,
    ];
  }, [pickerProducts, editingOrder, draft?.product, draft?.quantity, draft?.total]);

  const cancelEdit = useCallback(() => {
    setEditingRowId(null);
    setDraft(null);
    setOriginalDraft(null);
    setFieldErrors({});
    setPendingCanceledSave(null);
  }, []);

  const updateMutation = trpc.admin.orders.update.useMutation({
    onSuccess: async () => {
      toast.success("Order updated");
      cancelEdit();
      setSavingRowId(null);
      setCanceledConfirmOpen(false);
      setPendingCanceledSave(null);
      await utils.admin.orders.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      setSavingRowId(null);
    },
  });

  const updateStatusMutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: async () => {
      toast.success("Order status updated");
      setQuickStatusId(null);
      await utils.admin.orders.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      setQuickStatusId(null);
    },
  });

  const deleteMutation = trpc.admin.orders.delete.useMutation({
    onSuccess: async () => {
      toast.success("Order deleted");
      setDeleteTarget(null);
      if (deleteTarget?.id === editingRowId) {
        cancelEdit();
      }
      await utils.admin.orders.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const isDirty = draft && originalDraft ? !draftsEqual(draft, originalDraft) : false;

  const startEdit = useCallback(
    (order: OrderRow) => {
      if (editingRowId && editingRowId !== order.id && isDirty) {
        setPendingEditOrderId(order.id);
        setDiscardConfirmOpen(true);
        return;
      }
      const nextDraft = orderToDraft(order);
      setEditingRowId(order.id);
      setDraft(nextDraft);
      setOriginalDraft(nextDraft);
      setFieldErrors({});
    },
    [editingRowId, isDirty],
  );

  const validateDraft = (values: OrderDraft): boolean => {
    const result = orderDraftSchema.safeParse(values);
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const errors: Partial<Record<keyof OrderDraft, string>> = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof OrderDraft;
      if (key) errors[key] = issue.message;
    });
    setFieldErrors(errors);
    return false;
  };

  const commitSave = (orderId: string, values: OrderDraft) => {
    if (!validateDraft(values)) return;
    if (originalDraft && draftsEqual(values, originalDraft)) {
      cancelEdit();
      return;
    }
    setSavingRowId(orderId);
    updateMutation.mutate({
      id: orderId,
      name: values.name,
      product: values.product,
      quantity: values.quantity,
      size: values.size || undefined,
      color: values.color || undefined,
      total: values.total,
      status: values.status,
    });
  };

  const handleSaveRow = (order: OrderRow) => {
    if (!draft) return;

    if (draft.status === "canceled" && originalDraft?.status !== "canceled") {
      setPendingCanceledSave({ orderId: order.id, draft: { ...draft } });
      setCanceledConfirmOpen(true);
      return;
    }

    commitSave(order.id, draft);
  };

  const handleDraftChange = (patch: Partial<OrderDraft>) => {
    if (!editingRowId) return;
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setFieldErrors((prev) => {
      const next = { ...prev };
      (Object.keys(patch) as (keyof OrderDraft)[]).forEach((k) => {
        delete next[k];
      });
      return next;
    });
  };

  const handleRecalculateTotal = () => {
    if (!draft) return;
    const product = productOptions.find((p: ProductPickerOption) => p.id === draft.product);
    if (!product) return;
    setDraft((prev) =>
      prev
        ? { ...prev, total: Math.round(product.price * prev.quantity * 100) / 100 }
        : prev,
    );
  };

  const handleQuickStatusChange = (order: OrderRow, status: OrderStatus) => {
    if (status === order.status) return;
    setQuickStatusId(order.id);
    updateStatusMutation.mutate({ id: order.id, status });
  };

  const confirmDiscardAndSwitch = () => {
    setDiscardConfirmOpen(false);
    if (pendingEditOrderId) {
      const order = orders.find((o) => o.id === pendingEditOrderId);
      if (order) {
        const nextDraft = orderToDraft(order);
        setEditingRowId(order.id);
        setDraft(nextDraft);
        setOriginalDraft(nextDraft);
        setFieldErrors({});
      }
      setPendingEditOrderId(null);
    } else {
      cancelEdit();
    }
  };

  const tableDisabled =
    Boolean(savingRowId) || updateMutation.isPending || updateStatusMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const startItem = (currentPage - 1) * 20 + 1;
  const endItem = Math.min(currentPage * 20, totalDocs);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Click a row or the pencil icon to edit customer, line items, total, and status. Press Escape
        to cancel.
      </p>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-gray-500">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const isEditing = editingRowId === order.id;
                const isSaving = savingRowId === order.id;

                if (isEditing && draft) {
                  return (
                    <EditableOrderRow
                      key={order.id}
                      order={order}
                      isEditing
                      isSaving={isSaving}
                      draft={draft}
                      fieldErrors={fieldErrors}
                      products={productOptions}
                      onStartEdit={() => startEdit(order)}
                      onCancelEdit={cancelEdit}
                      onSaveRow={() => handleSaveRow(order)}
                      onDraftChange={handleDraftChange}
                      onRecalculateTotal={handleRecalculateTotal}
                      onQuickStatusChange={(status) => handleQuickStatusChange(order, status)}
                      onArchive={() => setDeleteTarget(order)}
                      disabled={tableDisabled && !isSaving}
                    />
                  );
                }

                return (
                  <EditableOrderRow
                    key={order.id}
                    order={order}
                    isEditing={false}
                    isSaving={false}
                    draft={orderToDraft(order)}
                    fieldErrors={{}}
                    products={productOptions}
                    onStartEdit={() => startEdit(order)}
                    onCancelEdit={cancelEdit}
                    onSaveRow={() => {}}
                    onDraftChange={() => {}}
                    onRecalculateTotal={() => {}}
                    onQuickStatusChange={(status) => handleQuickStatusChange(order, status)}
                    onArchive={() => setDeleteTarget(order)}
                    disabled={tableDisabled}
                    isQuickStatusUpdating={quickStatusId === order.id}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalDocs} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1 || Boolean(editingRowId)}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages || Boolean(editingRowId)}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              Order {deleteTarget?.orderNumber || deleteTarget?.id} will be permanently deleted.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits on this order. Switching rows will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingEditOrderId(null)}>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscardAndSwitch}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={canceledConfirmOpen} onOpenChange={setCanceledConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark order as canceled?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set the order status to canceled. You can change it again later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingCanceledSave(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                pendingCanceledSave &&
                commitSave(pendingCanceledSave.orderId, pendingCanceledSave.draft)
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
