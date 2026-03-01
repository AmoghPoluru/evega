"use client";

// Task 5.1.1: Customers list page as client component using tRPC for data fetching with React Query
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { CustomersTable } from "./components/CustomersTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Download } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";

export default function VendorCustomersPage() {
  const router = useRouter();
  
  // Task 5.1.2: Page layout with header, filters, and table sections using state management with nuqs for URL state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [queryState, setQueryState] = useQueryStates({
    status: parseAsString.withDefault("all"),
    page: parseAsString.withDefault("1"),
    sortBy: parseAsString.withDefault("lastOrderDate"),
    sortOrder: parseAsString.withDefault("desc"),
  });

  const page = parseInt(queryState.page || "1", 10);

  // Task 5.3.3: Debounce search input (300ms) to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Task 5.1.3: Page title and description in header section
  const { data, isLoading, error } = trpc.vendor.customers.list.useQuery({
    status: queryState.status as any,
    search: debouncedSearch || undefined,
    page,
    limit: 20,
    sortBy: (queryState.sortBy as any) || "lastOrderDate",
    sortOrder: (queryState.sortOrder as any) || "desc",
  });

  // Task 5.1.4: Loading skeleton state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Task 5.1.5: Error state with retry button
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-red-600">Error loading customers: {error.message}</p>
              <Button onClick={() => router.refresh()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customers = data?.docs || [];
  const totalDocs = data?.totalDocs || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

  // Task 5.1.6: Empty state when no customers found
  if (customers.length === 0 && !isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customers and view their order history</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-gray-500">No customers found</p>
              {(search || queryState.status !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setQueryState({ status: "all", page: "1" });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">Manage your customers and view their order history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Task 5.3.1: Search input component in customers list header */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {/* Task 5.3.4: Clear search button (X icon) */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Task 5.7.1: Filter by customer status */}
        <Select
          value={queryState.status}
          onValueChange={(value) => setQueryState({ status: value, page: "1" })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="new">New</SelectItem>
          </SelectContent>
        </Select>

        {/* Task 5.5.1: Sort dropdown component */}
        <Select
          value={`${queryState.sortBy}-${queryState.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split("-");
            setQueryState({ sortBy, sortOrder });
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="totalSpent-desc">Total Spent (High to Low)</SelectItem>
            <SelectItem value="totalSpent-asc">Total Spent (Low to High)</SelectItem>
            <SelectItem value="orderCount-desc">Order Count (High to Low)</SelectItem>
            <SelectItem value="lastOrderDate-desc">Last Order (Newest)</SelectItem>
            <SelectItem value="lastOrderDate-asc">Last Order (Oldest)</SelectItem>
          </SelectContent>
        </Select>

        {/* Task 5.8.1: Export button */}
        <Button variant="outline" disabled>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        {/* Task 5.7.6: Clear filters button */}
        {(search || queryState.status !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setQueryState({ status: "all", page: "1" });
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Task 5.3.8: Show search result count */}
      {debouncedSearch && (
        <p className="text-sm text-gray-600">
          {totalDocs} customer{totalDocs !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Table */}
      <CustomersTable
        customers={customers}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {totalDocs > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalDocs)} of {totalDocs} customers
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setQueryState({ page: String(currentPage - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setQueryState({ page: String(currentPage + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
