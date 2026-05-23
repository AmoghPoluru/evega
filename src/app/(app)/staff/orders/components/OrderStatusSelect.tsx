"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_OPTIONS, type OrderStatus } from "../order-utils";

interface OrderStatusSelectProps {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
}

export function OrderStatusSelect({ value, onChange, disabled }: OrderStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as OrderStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 w-[min(150px,100%)]" onClick={(e) => e.stopPropagation()}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
