"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import { AdminProductsTable } from "./components/AdminProductsTable";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Input of the first page load, prefetched on the server. */
export const STAFF_PRODUCTS_DEFAULT_INPUT = {
  status: "all",
  page: 1,
  limit: 20,
  sortBy: "updatedAt",
  sortOrder: "desc",
} as const;

export function StaffProductsClient() {
  const [status, setStatus] = useState<"all" | "published" | "draft" | "archived">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [vendorId, setVendorId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "price" | "createdAt" | "updatedAt">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, vendorId]);

  const { data: vendorsData } = trpc.admin.vendors.listOptions.useQuery();

  const { data, isLoading, error } = trpc.admin.products.list.useQuery({
    ...STAFF_PRODUCTS_DEFAULT_INPUT,
    status,
    search: debouncedSearch || undefined,
    vendorId,
    page,
    sortBy,
    sortOrder,
  });

  const vendors = vendorsData ?? [];

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center text-red-600">
            Error loading products: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-600">
          All products across vendors — use Add product for full create (same as vendor catalog), or
          edit and archive from this list.
        </p>
      </div>

      {isLoading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <AdminProductsTable
          products={data?.docs ?? []}
          isLoading={isLoading}
          totalDocs={data?.totalDocs ?? 0}
          totalPages={data?.totalPages ?? 1}
          currentPage={page}
          onPageChange={setPage}
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
          vendorId={vendorId}
          onVendorChange={setVendorId}
          vendors={vendors}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
          }}
        />
      )}
    </div>
  );
}
