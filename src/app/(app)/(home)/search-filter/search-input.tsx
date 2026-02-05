"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookmarkCheckIcon, ListFilterIcon, SearchIcon } from "lucide-react";

import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProductFilters } from "@/modules/products/hooks/use-product-filters";

import { CategoriesSidebar } from "./categories-sidebar";
import type { Category } from "@/payload-types";

interface Props {
  disabled?: boolean;
  defaultValue?: string | undefined;
  onChange?: (value: string) => void;
  categories?: Category[];
}

export const SearchInput = ({
  disabled,
  defaultValue,
  onChange,
  categories = [],
}: Props) => {
  const [searchValue, setSearchValue] = useState(defaultValue || "");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useProductFilters();

  const { data: session } = trpc.auth.session.useQuery();

  // Sync local state with URL params
  useEffect(() => {
    if (filters.search !== searchValue) {
      setSearchValue(filters.search || "");
    }
  }, [filters.search]);

  // Function to trigger search immediately
  const handleSearch = () => {
    const trimmedValue = searchValue.trim();
    if (filters.search !== trimmedValue) {
      setFilters({ search: trimmedValue || "" });
    }
    onChange?.(trimmedValue);
  };

  // Update URL params when search value changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedValue = searchValue.trim();
      if (filters.search !== trimmedValue) {
        setFilters({ search: trimmedValue || "" });
      }
      onChange?.(trimmedValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, filters.search, setFilters, onChange]);

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <CategoriesSidebar 
        open={isSidebarOpen} 
        onOpenChange={setIsSidebarOpen}
        categories={categories}
      />
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input
          className="pl-8 pr-12"
          placeholder="Search products"
          disabled={disabled}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={handleSearch}
          disabled={disabled}
        >
          <SearchIcon className="size-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        className="size-12 shrink-0 flex lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <ListFilterIcon />
      </Button>
      {session?.user && (
        <Button
          asChild
          variant="outline"
        >
          <Link prefetch href="/library">
            <BookmarkCheckIcon />
            Library
          </Link>
        </Button>
      )}
    </div>
  );
};
