"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductForm } from "@/app/(app)/vendor/products/components/ProductForm";

export function StaffNewProductClient() {
  const { data: vendors, isLoading } = trpc.admin.vendors.listOptions.useQuery();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link href="/staff/products">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to products
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Create product</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a product for a vendor — same fields as the vendor catalog form (images, variants,
          video, tags).
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <ProductForm context="staff" vendors={vendors ?? []} />
      )}
    </div>
  );
}
