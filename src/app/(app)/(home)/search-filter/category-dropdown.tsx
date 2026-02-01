"use client";

import { useRef, useState } from "react";
// @ts-expect-error - Next.js link module works at runtime with NodeNext resolution
import Link from "next/link";
import type { Category } from "@/payload-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SubcategoryMenu } from "./subcategory-menu";

interface Props {
  category: Category
  isActive?: boolean;
  isNavigationHovered?: boolean;
};

export const CategoryDropdown = ({
  category,
  isActive,
  isNavigationHovered
}: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const onMouseEnter = () => {
        // Handle both formats: array directly or object with docs property
        const subcategories = Array.isArray(category.subcategories) 
            ? category.subcategories 
            : (category.subcategories?.docs || []);
        const hasSubcategories = subcategories.length > 0;
        console.log("Mouse entered category:", {
            name: category.name,
            id: category.id,
            subcategories: category.subcategories,
            subcategoriesArray: subcategories,
            hasSubcategories: hasSubcategories
        });
        if (hasSubcategories) {
          setIsOpen(true);
        }
      };
    
      const onMouseLeave = () => setIsOpen(false);
    
    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="relative">
                <Button
                    asChild
                    variant="elevated"
                    className={cn(
                        "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black",
                        isActive && !isNavigationHovered && "bg-white border-primary",
                        isOpen && "bg-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[4px] -translate-y-[4px]"
                    )}
                >
                    <Link 
                        href={`/${category.slug}`}
                        onClick={() => setIsOpen(false)}
                    >
                        {category.name}
                    </Link>
                </Button>
                {(() => {
                    const subcategories = Array.isArray(category.subcategories) 
                        ? category.subcategories 
                        : (category.subcategories?.docs || []);
                    return subcategories.length > 0;
                })() && (
                    <div
                        className={cn(
                            // Using arbitrary values [10px] for exact 10px borders (border-r-10 would be 2.5rem/40px)
                            "opacity-0 absolute -bottom-3 w-0 h-0 border-l-10 border-r-10 border-b-10 border-l-transparent border-r-transparent border-b-black left-1/2 -translate-x-1/2",
                            isOpen && "opacity-100"
                        )}
                    />
                )}
            </div>

            <SubcategoryMenu
                category={category}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </div>
    )
}