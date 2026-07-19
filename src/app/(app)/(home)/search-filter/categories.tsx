"use client";

/// <reference types="next" />
import { useParams } from "next/navigation";
import type { Category } from "@/payload-types";
import { CategoryDropdown } from "./category-dropdown";

interface Props {
  data: Category[];
}

export const Categories = ({ data }: Props) => {
  const params = useParams();
  // Extract category slug from route params (e.g., "/electronics" -> "electronics", "/" -> "all")
  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "all";

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
        No categories found
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.map((category) => (
        <CategoryDropdown
          key={category.id}
          category={category}
          isActive={activeCategory === category.slug}
          isNavigationHovered={false}
        />
      ))}
    </div>
  );
};