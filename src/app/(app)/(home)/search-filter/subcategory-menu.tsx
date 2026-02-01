"use client";

/// <reference types="next" />
// @ts-expect-error - Next.js link module works at runtime with NodeNext resolution
import Link from "next/link";

import type { Category } from "@/payload-types";

interface Props {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
}

export const SubcategoryMenu = ({
  category,
  isOpen,
  onClose,
}: Props) => {
  // Handle both formats: array directly or object with docs property
  const subcategories = Array.isArray(category.subcategories) 
    ? category.subcategories 
    : (category.subcategories?.docs || []);
  
  console.log("SubcategoryMenu - category:", category.name);
  console.log("SubcategoryMenu - raw subcategories:", category.subcategories);
  console.log("SubcategoryMenu - processed subcategories:", subcategories);
  console.log("SubcategoryMenu - subcategories length:", subcategories.length);
  
  // Filter to only Category objects (not string IDs)
  const validSubcategories = subcategories.filter((sub): sub is Category => 
    typeof sub === 'object' && sub !== null && 'id' in sub
  );
  
  console.log("SubcategoryMenu - validSubcategories:", validSubcategories);
  console.log("SubcategoryMenu - validSubcategories length:", validSubcategories.length);
  
  if (!isOpen || validSubcategories.length === 0) {
    return null;
  }

  const backgroundColor = category.color || "#F5F5F5";

  return (
    <div
      className="absolute z-50"
      style={{
        top: "100%",
        left: 0,
      }}
    >
      {/* Invisible bridge to maintain hover */}
      <div className="h-3 w-60" />
      <div
        style={{ backgroundColor }}
        className="w-60 text-black rounded-md overflow-hidden border"
      >
        <div>
          {validSubcategories.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/${category.slug}/${subcategory.slug}`}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium"
              onClick={onClose}
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
