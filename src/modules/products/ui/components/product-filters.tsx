"use client";

import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useProductFilters } from "../../hooks/use-product-filters";
import { TagsFilter } from "./tags-filter";
import { PriceFilter } from "./price-filter";

interface ProductFiltersProps {
  category?: string;
}

export const ProductFilters = ({ category }: ProductFiltersProps) => {
  const [filters, setFilters] = useProductFilters();

  // Fetch products to calculate price range (for the current category if provided)
  const { data: productsData } = trpc.products.getMany.useQuery({
    limit: 1000,
    category: category || undefined,
    // Don't apply price/tag filters here - we want the full price range
  });

  // Calculate min/max price from products
  const { minPrice, maxPrice } = useMemo(() => {
    if (!productsData?.docs || productsData.docs.length === 0) {
      return { minPrice: 0, maxPrice: 10000 };
    }
    const prices = productsData.docs.map((p: any) => p.price || 0);
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [productsData]);

  // Get current price range values
  const currentMinPrice = filters.minPrice ? parseFloat(filters.minPrice) : minPrice;
  const currentMaxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : maxPrice;
  const priceRange: [number, number] = [
    Math.max(minPrice, currentMinPrice),
    Math.min(maxPrice, currentMaxPrice),
  ];

  const hasFilters = (filters.tags && filters.tags.length > 0) ||
    (filters.minPrice && parseFloat(filters.minPrice) !== minPrice) ||
    (filters.maxPrice && parseFloat(filters.maxPrice) !== maxPrice);

  const handleClear = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      tags: [],
    });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setFilters({
      ...filters,
      minPrice: range[0] === minPrice ? "" : range[0].toString(),
      maxPrice: range[1] === maxPrice ? "" : range[1].toString(),
    });
  };

  const handleTagsChange = (tags: string[]) => {
    setFilters({
      ...filters,
      tags,
    });
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        {hasFilters && (
          <button
            onClick={handleClear}
            className="flex items-center text-sm font-medium text-gray-900 hover:text-black transition-colors"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Clear
          </button>
        )}
      </div>

      {/* Tags Section */}
      <div className="px-6 py-5 border-b border-gray-200">
        <TagsFilter
          value={filters.tags || []}
          onChange={handleTagsChange}
        />
      </div>

      {/* Price Section */}
      <div className="px-6 py-5">
        <PriceFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceRange={priceRange}
          onPriceRangeChange={handlePriceRangeChange}
        />
      </div>
    </div>
  );
};
