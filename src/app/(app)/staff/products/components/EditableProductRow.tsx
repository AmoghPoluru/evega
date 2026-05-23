"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Check, Loader2, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import type { Product } from "@/payload-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  type ProductDraft,
  type ProductStatus,
  getStatusFromProduct,
  productToDraft,
} from "../product-utils";

type ProductRow = Product & { remainingStock?: number };

interface CategoryOption {
  id: string;
  name: string;
}

interface VendorOption {
  id: string;
  name: string;
}

interface EditableProductRowProps {
  product: ProductRow;
  isEditing: boolean;
  isSaving: boolean;
  draft: ProductDraft;
  fieldErrors: Partial<Record<keyof ProductDraft, string>>;
  vendors: VendorOption[];
  categories: CategoryOption[];
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveRow: () => void;
  onDraftChange: (patch: Partial<ProductDraft>) => void;
  onArchive: () => void;
  disabled?: boolean;
}

function StatusBadge({ status }: { status: ProductStatus }) {
  if (status === "archived") {
    return <Badge variant="secondary">Archived</Badge>;
  }
  if (status === "draft") {
    return <Badge variant="outline">Draft</Badge>;
  }
  return <Badge className="bg-green-100 text-green-800">Published</Badge>;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function EditableProductRow({
  product,
  isEditing,
  isSaving,
  draft,
  fieldErrors,
  vendors,
  categories,
  onStartEdit,
  onCancelEdit,
  onSaveRow,
  onDraftChange,
  onArchive,
  disabled,
}: EditableProductRowProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const imageUrl =
    typeof product.image === "object" && product.image?.url ? product.image.url : null;

  const displayStatus = isEditing ? draft.status : getStatusFromProduct(product);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditing]);

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

  const vendorLabel =
    vendors.find((v) => v.id === (isEditing ? draft.vendor : productToDraft(product).vendor))
      ?.name ||
    (typeof product.vendor === "object" && product.vendor
      ? product.vendor.name || product.vendor.slug
      : "—");

  const categoryLabel =
    categories.find((c) => c.id === (isEditing ? draft.category : productToDraft(product).category))
      ?.name ||
    (typeof product.category === "object" && product.category ? product.category.name : "—");

  return (
    <TableRow
      className={cn(
        isEditing && "bg-blue-50/50",
        isSaving && "opacity-70 pointer-events-none",
      )}
    >
      <TableCell>
        {imageUrl ? (
          <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
            <Image src={imageUrl} alt={product.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200 text-xs text-gray-400">
            —
          </div>
        )}
      </TableCell>

      <TableCell
        className={cn(!isEditing && "cursor-pointer hover:bg-gray-50")}
        onClick={() => !isEditing && !disabled && onStartEdit()}
      >
        {isEditing ? (
          <div className="space-y-1 min-w-[140px]">
            <Input
              ref={nameInputRef}
              value={draft.name}
              onChange={(e) => onDraftChange({ name: e.target.value })}
              className={cn("h-8", fieldErrors.name && "border-red-500")}
              aria-label={`Edit product name for ${product.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveRow();
                }
              }}
            />
            {fieldErrors.name && (
              <p className="text-[11px] text-red-600">{fieldErrors.name}</p>
            )}
          </div>
        ) : (
          <span className="font-medium">{product.name}</span>
        )}
      </TableCell>

      <TableCell
        className={cn(!isEditing && "cursor-pointer hover:bg-gray-50")}
        onClick={() => !isEditing && !disabled && onStartEdit()}
      >
        {isEditing ? (
          <Select
            value={draft.vendor}
            onValueChange={(value) => onDraftChange({ vendor: value })}
          >
            <SelectTrigger className="h-8 w-[min(160px,100%)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm text-gray-600">{vendorLabel}</span>
        )}
      </TableCell>

      <TableCell
        className={cn(!isEditing && "cursor-pointer hover:bg-gray-50")}
        onClick={() => !isEditing && !disabled && onStartEdit()}
      >
        {isEditing ? (
          <Select
            value={draft.category}
            onValueChange={(value) => onDraftChange({ category: value })}
          >
            <SelectTrigger className="h-8 w-[min(140px,100%)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm text-gray-600">{categoryLabel}</span>
        )}
      </TableCell>

      <TableCell
        className={cn(!isEditing && "cursor-pointer hover:bg-gray-50")}
        onClick={() => !isEditing && !disabled && onStartEdit()}
      >
        {isEditing ? (
          <div className="space-y-1 min-w-[100px]">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={draft.price}
              onChange={(e) =>
                onDraftChange({ price: e.target.value === "" ? 0 : Number(e.target.value) })
              }
              className={cn("h-8", fieldErrors.price && "border-red-500")}
              aria-label={`Edit price for ${product.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveRow();
                }
              }}
            />
            {fieldErrors.price && (
              <p className="text-[11px] text-red-600">{fieldErrors.price}</p>
            )}
          </div>
        ) : (
          formatPrice(product.price)
        )}
      </TableCell>

      <TableCell className="text-sm text-gray-600">{product.remainingStock ?? 0}</TableCell>

      <TableCell
        className={cn(!isEditing && "cursor-pointer hover:bg-gray-50")}
        onClick={() => !isEditing && !disabled && onStartEdit()}
      >
        {isEditing ? (
          <Select
            value={draft.status}
            onValueChange={(value: ProductStatus) => onDraftChange({ status: value })}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <StatusBadge status={displayStatus} />
        )}
      </TableCell>

      <TableCell className="text-sm text-gray-600">
        {product.updatedAt ? formatDate(product.updatedAt) : "—"}
      </TableCell>

      <TableCell>
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
                title="Save row"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
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
                    Archive
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
