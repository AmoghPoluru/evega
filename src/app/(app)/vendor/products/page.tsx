"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { ProductsTable } from "./components/ProductsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import { ProductAiImportDialog } from "./components/ProductAiImportDialog";

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
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "price" | "createdAt" | "updatedAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading, error } = trpc.vendor.products.list.useQuery({
    status,
    search: search || undefined,
    page,
    limit: 20,
    sortBy,
    sortOrder,
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{vendorPageTitles.products}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your product catalog
          </p>
        </div>
        <div className="flex gap-2">
          <ProductAiImportDialog />
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

      {/* Inventory Summary Card */}
      {data && data.docs.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.docs.reduce((sum: number, p: any) => sum + (p.soldCount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Remaining</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.docs.reduce((sum: number, p: any) => sum + (p.remainingStock || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {data.docs.filter((p: any) => {
                    const remaining = p.remainingStock !== undefined ? p.remainingStock : 0;
                    return remaining > 0 && remaining < 5;
                  }).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
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
