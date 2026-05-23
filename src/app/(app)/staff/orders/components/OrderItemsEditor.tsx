"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OrderDraft } from "../order-utils";

export interface ProductPickerOption {
  id: string;
  name: string;
  price: number;
}

interface OrderItemsEditorProps {
  draft: OrderDraft;
  products: ProductPickerOption[];
  fieldErrors?: Partial<Record<keyof OrderDraft, string>>;
  onChange: (patch: Partial<OrderDraft>) => void;
  onRecalculateTotal?: () => void;
  compact?: boolean;
}

export function OrderItemsEditor({
  draft,
  products,
  fieldErrors,
  onChange,
  onRecalculateTotal,
  compact,
}: OrderItemsEditorProps) {
  const selected = products.find((p) => p.id === draft.product);

  return (
    <div className={cn("space-y-2", compact ? "min-w-[200px]" : "min-w-[240px]")}>
      <div className="space-y-1">
        <Label className="text-[11px] text-gray-500">Product</Label>
        <Select value={draft.product} onValueChange={(v) => onChange({ product: v })}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} (${p.price.toFixed(2)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors?.product && (
          <p className="text-[11px] text-red-600">{fieldErrors.product}</p>
        )}
      </div>

      <div className="flex gap-2">
        <div className="space-y-1 flex-1">
          <Label className="text-[11px] text-gray-500">Qty</Label>
          <Input
            type="number"
            min={1}
            className={cn("h-8", fieldErrors?.quantity && "border-red-500")}
            value={draft.quantity}
            onChange={(e) =>
              onChange({ quantity: e.target.value === "" ? 1 : parseInt(e.target.value, 10) })
            }
          />
        </div>
        <div className="space-y-1 flex-1">
          <Label className="text-[11px] text-gray-500">Size</Label>
          <Input
            className="h-8"
            value={draft.size || ""}
            onChange={(e) => onChange({ size: e.target.value })}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-1 flex-1">
          <Label className="text-[11px] text-gray-500">Color</Label>
          <Input
            className="h-8"
            value={draft.color || ""}
            onChange={(e) => onChange({ color: e.target.value })}
            placeholder="Optional"
          />
        </div>
      </div>

      {selected && onRecalculateTotal && (
        <button
          type="button"
          className="text-[11px] text-blue-600 hover:underline"
          onClick={onRecalculateTotal}
        >
          Recalc total ({selected.price.toFixed(2)} × {draft.quantity})
        </button>
      )}
    </div>
  );
}
