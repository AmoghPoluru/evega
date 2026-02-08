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
  refundPolicy?: '30-day' | '14-day' | '7-day' | '3-day' | '1-day' | 'no-refunds' | null;
  tags?: Array<{
    id: string;
    name: string;
  } | string> | null;
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

  // Check if any filters are active
  const hasAnyFilters = useMemo(() => {
    return (
      (filters.minPrice && filters.minPrice !== "") ||
      (filters.maxPrice && filters.maxPrice !== "") ||
      (filters.tags && filters.tags.length > 0)
    );
  }, [filters]);

  // Clear all filters
  const onClearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      tags: [],
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
    if (filters.tags.length > 0) {
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
        return filters.tags.some((selectedTag) => productTagNames.includes(selectedTag));
      });
    }

    return filtered;
  }, [products, filters]);

  return (
    <div className="flex gap-8">
      {/* Filters Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4">
          <ProductFilters availableTags={availableTags} products={products} />
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
                  // Optional fields - can be added later when you have tenant/review data
                  // tenantSlug={product.tenantSlug}
                  // tenantImageUrl={product.tenantImageUrl}
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
