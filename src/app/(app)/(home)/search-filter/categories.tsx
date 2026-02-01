"use client";

/// <reference types="next" />
// @ts-expect-error - Next.js navigation module works at runtime with NodeNext resolution
import { usePathname, useParams } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/payload-types";
import { CategoryDropdown } from "./category-dropdown";

interface Props {
  data: Category[];
}

export const Categories = ({ data }: Props) => {
  console.log("Categories data:", data);
  const params = useParams();
  const pathname = usePathname();
  // Extract category slug from pathname (e.g., "/electronics" -> "electronics", "/" -> "all")
  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "all";
 
  
  if (!data || data.length === 0) {
    return <div>No categories found</div>;
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