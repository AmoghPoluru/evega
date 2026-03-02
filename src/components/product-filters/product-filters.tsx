"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, X } from "lucide-react";

// @ts-expect-error - Utils import works at runtime with NodeNext resolution
import { cn } from "@/lib/utils";
// @ts-expect-error - Component import works at runtime with NodeNext resolution
import { Button } from "@/components/ui/button";

import { TagsFilter } from "./tags-filter";
import { PriceFilter } from "./price-filter";
import { VariantFilter } from "./variant-filter";
import { useProductFilters } from "./product-filters-provider";

interface ProductFilterProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

const ProductFilter = ({ title, className, children }: ProductFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;

  return (
    <div className={cn(
      "p-4 border-b flex flex-col gap-2",
      className
    )}>
      <div
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center justify-between cursor-pointer"
      >
        <p className="font-medium">{title}</p>
        <Icon className="size-5" />
      </div>
      {isOpen && children}
    </div>
  );
};

interface ProductFiltersProps {
  availableTags?: string[];
  availableVariants?: Record<string, string[]>; // Dynamic variant options: { "size": ["M", "L"], "color": ["Red", "Blue"] }
  products?: Array<{ price: number }>;
}

export const ProductFilters = ({ 
  availableTags = [], 
  availableVariants = {},
  products = [] 
}: ProductFiltersProps) => {
  const [filters, setFilters] = useProductFilters();

  const hasAnyFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "sort") return false;

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "string") {
      return value !== "";
    }

    return value !== null;
  });

  const onClear = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      tags: [],
      variants: {},
    });
  };

  const onChange = (key: keyof typeof filters, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="border rounded-md bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        <p className="font-medium">Filters</p>
        {hasAnyFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-auto py-1 px-2 text-xs"
          >
            <X className="size-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <ProductFilter title="Price">
        <PriceFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={(value: string) => onChange("minPrice", value)}
          onMaxPriceChange={(value: string) => onChange("maxPrice", value)}
          products={products}
        />
      </ProductFilter>
      {/* Dynamic Variant Filters */}
      {Object.keys(availableVariants).map((variantType) => {
        const options = availableVariants[variantType];
        if (!options || options.length === 0) return null;
        
        // Capitalize first letter for display
        const variantLabel = variantType.charAt(0).toUpperCase() + variantType.slice(1);
        const variantFilters = filters.variants || {};
        
        return (
          <ProductFilter key={variantType} title={variantLabel}>
            <VariantFilter
              variantType={variantType}
              variantLabel={variantLabel}
              availableOptions={options}
              value={variantFilters[variantType] || []}
              onChange={(value: string[]) => {
                onChange("variants", {
                  ...variantFilters,
                  [variantType]: value,
                });
              }}
            />
          </ProductFilter>
        );
      })}
      {availableTags.length > 0 && (
        <ProductFilter title="Tags" className="border-b-0">
          <TagsFilter
            availableTags={availableTags}
            value={filters.tags}
            onChange={(value: string[]) => onChange("tags", value)}
          />
        </ProductFilter>
      )}
    </div>
  );
};
