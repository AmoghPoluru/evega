"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { ProductsTable } from "./components/ProductsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";

export default function VendorProductsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") as "all" | "published" | "draft" | "archived" | null;
  const [status, setStatus] = useState<"all" | "published" | "draft" | "archived">(
    statusParam || "all"
  );

  // Update status when URL param changes
  useEffect(() => {
    if (statusParam) {
      setStatus(statusParam);
    }
  }, [statusParam]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "price" | "createdAt" | "updatedAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: categoriesData } = trpc.categories.useQuery();
  const { data, isLoading, error } = trpc.vendor.products.list.useQuery({
    status,
    search: search || undefined,
    category,
    page,
    limit: 20,
    sortBy,
    sortOrder,
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your product catalog
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/vendor/products/import">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/vendor/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          Error loading products: {error.message}
        </div>
      )}

      <ProductsTable
        products={data?.docs || []}
        isLoading={isLoading}
        totalDocs={data?.totalDocs || 0}
        totalPages={data?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={categoriesData?.map((cat) => ({ id: cat.id, name: cat.name })) || []}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field, order) => {
          setSortBy(field);
          setSortOrder(order);
        }}
      />
    </div>
  );
}
