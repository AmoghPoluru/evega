"use client";

import { useCallback, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpDown, Plus } from "lucide-react";
import type { Product } from "@/payload-types";
import { EditableProductRow } from "./EditableProductRow";
import {
  type ProductDraft,
  draftsEqual,
  getStatusFromProduct,
  productDraftSchema,
  productToDraft,
} from "../product-utils";

interface VendorOption {
  id: string;
  name: string;
}

type ProductRow = Product & {
  remainingStock?: number;
  statusLabel?: string;
};

interface AdminProductsTableProps {
  products: ProductRow[];
  isLoading: boolean;
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  status: "all" | "published" | "draft" | "archived";
  onStatusChange: (status: "all" | "published" | "draft" | "archived") => void;
  search: string;
  onSearchChange: (search: string) => void;
  vendorId?: string;
  onVendorChange: (vendorId: string | undefined) => void;
  vendors: VendorOption[];
  sortBy: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  onSortChange: (field: "name" | "price" | "createdAt" | "updatedAt", order: "asc" | "desc") => void;
}

export function AdminProductsTable({
  products,
  isLoading,
  totalDocs,
  totalPages,
  currentPage,
  onPageChange,
  status,
  onStatusChange,
  search,
  onSearchChange,
  vendorId,
  onVendorChange,
  vendors,
  sortBy,
  sortOrder,
  onSortChange,
}: AdminProductsTableProps) {
  const utils = trpc.useUtils();
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [originalDraft, setOriginalDraft] = useState<ProductDraft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProductDraft, string>>>({});
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [pendingDraftSave, setPendingDraftSave] = useState<{
    productId: string;
    draft: ProductDraft;
  } | null>(null);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [pendingEditProductId, setPendingEditProductId] = useState<string | null>(null);

  const cancelEdit = useCallback(() => {
    setEditingRowId(null);
    setDraft(null);
    setOriginalDraft(null);
    setFieldErrors({});
    setPendingDraftSave(null);
  }, []);

  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: async () => {
      toast.success("Product updated");
      cancelEdit();
      setSavingRowId(null);
      await utils.admin.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      setSavingRowId(null);
    },
  });

  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: async (_data, variables) => {
      toast.success("Product archived");
      const archivedId = variables.id;
      setDeleteTarget(null);
      if (archivedId) {
        setEditingRowId((current) => {
          if (current === archivedId) {
            setDraft(null);
            setOriginalDraft(null);
            setFieldErrors({});
            return null;
          }
          return current;
        });
      }
      await utils.admin.products.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSort = (field: "name" | "price" | "createdAt" | "updatedAt") => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "desc");
    }
  };

  const isDirty =
    draft && originalDraft ? !draftsEqual(draft, originalDraft) : false;

  const startEdit = useCallback(
    (product: ProductRow) => {
      if (editingRowId && editingRowId !== product.id && isDirty) {
        setPendingEditProductId(product.id);
        setDiscardConfirmOpen(true);
        return;
      }
      const nextDraft = productToDraft(product);
      setEditingRowId(product.id);
      setDraft(nextDraft);
      setOriginalDraft(nextDraft);
      setFieldErrors({});
    },
    [editingRowId, isDirty],
  );

  const validateDraft = (values: ProductDraft): boolean => {
    const result = productDraftSchema.safeParse(values);
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const errors: Partial<Record<keyof ProductDraft, string>> = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof ProductDraft;
      if (key) errors[key] = issue.message;
    });
    setFieldErrors(errors);
    return false;
  };

  const commitSave = (productId: string, values: ProductDraft) => {
    if (!validateDraft(values)) return;
    if (originalDraft && draftsEqual(values, originalDraft)) {
      cancelEdit();
      return;
    }
    setSavingRowId(productId);
    updateMutation.mutate({ id: productId, ...values });
  };

  const handleSaveRow = (product: ProductRow) => {
    if (!draft) return;

    const wasPublished = getStatusFromProduct(product) === "published";
    const goingDraft = draft.status === "draft" && wasPublished;

    if (goingDraft) {
      setPendingDraftSave({ productId: product.id, draft: { ...draft } });
      return;
    }

    commitSave(product.id, draft);
  };

  const handleDraftChange = (patch: Partial<ProductDraft>) => {
    if (!editingRowId) return;
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setFieldErrors((prev) => {
      const next = { ...prev };
      (Object.keys(patch) as (keyof ProductDraft)[]).forEach((k) => {
        delete next[k];
      });
      return next;
    });
  };

  const confirmDiscardAndSwitch = () => {
    setDiscardConfirmOpen(false);
    if (pendingEditProductId) {
      const product = products.find((p) => p.id === pendingEditProductId);
      if (product) {
        const nextDraft = productToDraft(product);
        setEditingRowId(product.id);
        setDraft(nextDraft);
        setOriginalDraft(nextDraft);
        setFieldErrors({});
      }
      setPendingEditProductId(null);
    } else {
      cancelEdit();
    }
  };

  const tableDisabled = Boolean(savingRowId) || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
          <Select value={status} onValueChange={(v) => onStatusChange(v as typeof status)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={vendorId || "all"}
            onValueChange={(v) => onVendorChange(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vendors</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/staff/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        Use Add product for the full create form (images, variants, video). Click a row or pencil to
        edit name, price, and status inline.
      </p>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleSort("name")}>
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleSort("price")}>
                  Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleSort("updatedAt")}>
                  Updated
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-gray-500">
                  No products found. Click &quot;Add product&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <EditableProductRow
                  key={product.id}
                  product={product}
                  isEditing={editingRowId === product.id}
                  isSaving={savingRowId === product.id}
                  draft={editingRowId === product.id && draft ? draft : productToDraft(product)}
                  fieldErrors={editingRowId === product.id ? fieldErrors : {}}
                  vendors={vendors}
                  onStartEdit={() => startEdit(product)}
                  onCancelEdit={cancelEdit}
                  onSaveRow={() => handleSaveRow(product)}
                  onDraftChange={handleDraftChange}
                  onArchive={() => setDeleteTarget(product)}
                  disabled={tableDisabled && editingRowId !== product.id}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, totalDocs)} of {totalDocs}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive product?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will be archived and hidden from the storefront.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(pendingDraftSave)} onOpenChange={(open) => !open && setPendingDraftSave(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide from storefront?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing this product to draft will hide it from customers until you publish again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDraftSave) {
                  commitSave(pendingDraftSave.productId, pendingDraftSave.draft);
                }
              }}
            >
              Save as draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits on the current row. Switching rows will lose those changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingEditProductId(null)}>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscardAndSwitch}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
