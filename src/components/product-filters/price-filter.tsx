"use client";

import { useMemo } from "react";
import { PriceRangeSlider } from "./price-range-slider";

interface PriceFilterProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  products?: Array<{ price: number }>;
}

export const PriceFilter = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  products = [],
}: PriceFilterProps) => {
  // Calculate min/max from products
  const { productMin, productMax } = useMemo(() => {
    if (products.length === 0) {
      return { productMin: 0, productMax: 10000 };
    }
    const prices = products.map((p) => p.price);
    return {
      productMin: Math.floor(Math.min(...prices)),
      productMax: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Convert string values to numbers, defaulting to product range
  const currentMin = minPrice ? parseFloat(minPrice) : productMin;
  const currentMax = maxPrice ? parseFloat(maxPrice) : productMax;

  // Ensure values are within bounds
  const sliderMin = Math.max(productMin, currentMin);
  const sliderMax = Math.min(productMax, currentMax);

  const handleChange = ([newMin, newMax]: [number, number]) => {
    // Always update when slider changes
    onMinPriceChange(newMin === productMin ? "" : newMin.toString());
    onMaxPriceChange(newMax === productMax ? "" : newMax.toString());
  };

  return (
    <div className="px-2 py-4">
      <PriceRangeSlider
        minPrice={productMin}
        maxPrice={productMax}
        value={[sliderMin, sliderMax]}
        onChange={handleChange}
        step={10}
      />
    </div>
  );
};
