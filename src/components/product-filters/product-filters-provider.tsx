"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ProductFilters {
  minPrice: string;
  maxPrice: string;
  tags: string[];
  sort?: string;
}

interface ProductFiltersContextType {
  filters: ProductFilters;
  setFilters: (filters: Partial<ProductFilters>) => void;
}

const ProductFiltersContext = createContext<ProductFiltersContextType | undefined>(undefined);

export const ProductFiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFiltersState] = useState<ProductFilters>({
    minPrice: "",
    maxPrice: "",
    tags: [],
    sort: undefined,
  });

  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return (
    <ProductFiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </ProductFiltersContext.Provider>
  );
};

export const useProductFilters = (): [ProductFilters, (filters: Partial<ProductFilters>) => void] => {
  const context = useContext(ProductFiltersContext);
  if (!context) {
    throw new Error("useProductFilters must be used within ProductFiltersProvider");
  }
  return [context.filters, context.setFilters];
};
