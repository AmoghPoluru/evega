"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PriceFilterProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

export const PriceFilter = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: PriceFilterProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="min-price" className="w-20 shrink-0">
          Min Price
        </Label>
        <Input
          id="min-price"
          type="number"
          placeholder="0"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="max-price" className="w-20 shrink-0">
          Max Price
        </Label>
        <Input
          id="max-price"
          type="number"
          placeholder="1000"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );
};
