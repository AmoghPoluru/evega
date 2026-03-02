"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { ProductFilters } from "./product-filters";
import { ProductFiltersProvider, useProductFilters } from "./product-filters-provider";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import type { Media } from "@/payload-types";

interface Product {
  id: string;
  name: string;
  description?: string | any;
  price: number;
  image?: Media | string | null;
  vendor?: {
    id: string;
    name?: string;
    slug?: string;
    logo?: { url?: string | null } | string | null;
  } | string | null;
  refundPolicy?: '30-day' | '14-day' | '7-day' | '3-day' | '1-day' | 'no-refunds' | null;
  tags?: Array<{
    id: string;
    name: string;
  } | string> | null;
  variants?: Array<{
    variantData?: Record<string, any>; // Dynamic variant data
    stock: number;
    price?: number | null;
  }> | null;
}

interface ProductsListProps {
  products: Product[];
  title?: string;
}

const ProductsListContent = ({ products, title = "Products" }: ProductsListProps) => {
  const [filters, setFilters] = useProductFilters();

  // Extract unique tags from products
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach((product) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag) => {
          // Handle both object and string formats
          if (typeof tag === "string") {
            tagSet.add(tag);
          } else if (tag && typeof tag === "object" && "name" in tag) {
            tagSet.add(tag.name);
          }
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [products]);

  // Extract available variant options dynamically from products
  const availableVariants = useMemo(() => {
    const variantMap: Record<string, Set<string>> = {};
    
    products.forEach((product) => {
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          const variantData = variant.variantData || {};
          Object.keys(variantData).forEach((variantType) => {
            const value = variantData[variantType];
            if (value && typeof value === 'string') {
              if (!variantMap[variantType]) {
                variantMap[variantType] = new Set();
              }
              variantMap[variantType].add(value);
            }
          });
        });
      }
    });
    
    // Convert Sets to sorted arrays
    const result: Record<string, string[]> = {};
    Object.keys(variantMap).forEach((variantType) => {
      result[variantType] = Array.from(variantMap[variantType]).sort();
    });
    
    return result;
  }, [products]);

  // Check if any filters are active
  const hasAnyFilters = useMemo(() => {
    const hasVariantFilters = filters.variants && Object.values(filters.variants).some((values) => values.length > 0);
    return (
      (filters.minPrice && filters.minPrice !== "") ||
      (filters.maxPrice && filters.maxPrice !== "") ||
      (filters.tags && filters.tags.length > 0) ||
      hasVariantFilters
    );
  }, [filters]);

  // Clear all filters
  const onClearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      tags: [],
      variants: {},
      sort: undefined,
    });
  };

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by price range
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter((product) => product.price >= minPrice);
      }
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter((product) => product.price <= maxPrice);
      }
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.tags || !Array.isArray(product.tags)) {
          return false;
        }
        // Check if product has any of the selected tags
        const productTagNames = product.tags.map((tag) => {
          if (typeof tag === "string") {
            return tag;
          }
          if (tag && typeof tag === "object" && "name" in tag) {
            return tag.name;
          }
          return "";
        }).filter(Boolean);
        
        // Product must have at least one of the selected tags
        return filters.tags!.some((selectedTag) => productTagNames.includes(selectedTag));
      });
    }

    // Filter by dynamic variants
    if (filters.variants && Object.keys(filters.variants).length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.variants || !Array.isArray(product.variants)) {
          return false;
        }
        
        // Check if product has at least one variant matching all selected variant filters
        return product.variants.some((variant) => {
          const variantData = variant.variantData || {};
          
          // Check each variant type filter
          for (const [variantType, selectedValues] of Object.entries(filters.variants!)) {
            if (selectedValues.length === 0) continue; // Skip empty filters
            
            const variantValue = variantData[variantType];
            if (!variantValue || !selectedValues.includes(String(variantValue))) {
              return false; // This variant doesn't match
            }
          }
          
          return true; // All variant filters match
        });
      });
    }

    return filtered;
  }, [products, filters]);

  return (
    <div className="flex gap-8">
      {/* Filters Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4">
          <ProductFilters 
            availableTags={availableTags} 
            availableVariants={availableVariants}
            products={products} 
          />
        </div>
      </aside>

      {/* Products Grid */}
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {title} ({filteredProducts.length})
          </h2>
          {hasAnyFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="size-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              // Extract image URL from product.image
              const imageUrl = 
                product.image && 
                typeof product.image === 'object' && 
                product.image.url 
                  ? product.image.url 
                  : null;

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  imageUrl={imageUrl}
                  price={product.price}
                  vendor={product.vendor}
                  // Optional fields - can be added later when you have review data
                  // reviewRating={product.reviewRating}
                  // reviewCount={product.reviewCount}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No products found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProductsList = ({ products, title = "Products" }: ProductsListProps) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <ProductFiltersProvider>
        <ProductsListContent products={products} title={title} />
      </ProductFiltersProvider>
    </div>
  );
};
