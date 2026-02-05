"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import type { Category } from "@/payload-types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
}

export const CategoriesSidebar = ({ open, onOpenChange, categories = [] }: Props) => {
  const params = useParams();
  const categoryParam = params.category as string | undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {categories.map((category) => {
              const subcategories = Array.isArray(category.subcategories)
                ? category.subcategories
                : (category.subcategories?.docs || []);
              
              const validSubcategories = subcategories.filter(
                (sub): sub is Category =>
                  typeof sub === 'object' && sub !== null && 'id' in sub
              );

              return (
                <div key={category.id} className="space-y-1">
                  <Link
                    href={`/${category.slug}`}
                    onClick={() => onOpenChange(false)}
                    className={`block p-3 rounded-md hover:bg-gray-100 font-medium ${
                      categoryParam === category.slug ? 'bg-gray-100' : ''
                    }`}
                  >
                    {category.name}
                  </Link>
                  {validSubcategories.length > 0 && (
                    <div className="pl-4 space-y-1">
                      {validSubcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/${category.slug}/${subcategory.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="block p-2 rounded-md hover:bg-gray-100 text-sm text-gray-600"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
