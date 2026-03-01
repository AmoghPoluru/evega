"use client";

// Task 4.1.1: Orders list page as client component using tRPC for data fetching with React Query
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { OrdersTable } from "./components/OrdersTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Download } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";

export default function VendorOrdersPage() {
  const router = useRouter();
  
  // Task 4.1.2: Page layout with header, filters, and table sections using state management with nuqs for URL state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [queryState, setQueryState] = useQueryStates({
    status: parseAsString.withDefault("all"),
    page: parseAsString.withDefault("1"),
    sortBy: parseAsString.withDefault("createdAt"),
    sortOrder: parseAsString.withDefault("desc"),
  });

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const page = parseInt(queryState.page || "1", 10);

  // Task 4.3.3: Debounce search input (300ms) to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Task 4.1.3: Page title and description in header section
  const { data, isLoading, error } = trpc.vendor.orders.list.useQuery({
    status: queryState.status as any,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit: 20,
    sortBy: (queryState.sortBy as any) || "createdAt",
    sortOrder: (queryState.sortOrder as any) || "desc",
  });

  // Task 4.1.4: Loading skeleton state with shadcn/ui Skeleton component
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Task 4.1.5: Error state with retry button and error message display
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your orders</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading orders: {error.message}</p>
              <Button onClick={() => router.refresh()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Task 4.1.6: Empty state when no orders found with helpful message
  const hasOrders = data && data.docs.length > 0;

  return (
    <div className="p-6">
      {/* Task 4.1.2: Header section with title and description */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your orders</p>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Task 4.3.1: Search input component with icon and clear button */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Task 4.4.1: Status filter dropdown with all status options */}
          <Select
            value={queryState.status}
            onValueChange={(value) => setQueryState({ status: value, page: "1" })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="payment_done">Payment Done</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          {/* Task 4.5.1: Date range filter inputs for from and to dates with labels */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">From Date</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">To Date</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
            />
          </div>

          {/* Task 4.6.1: Sort dropdown with date, amount, and status options */}
          <Select
            value={`${queryState.sortBy}-${queryState.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-");
              setQueryState({ sortBy, sortOrder });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Date (Newest)</SelectItem>
              <SelectItem value="createdAt-asc">Date (Oldest)</SelectItem>
              <SelectItem value="total-desc">Amount (High to Low)</SelectItem>
              <SelectItem value="total-asc">Amount (Low to High)</SelectItem>
              <SelectItem value="status-asc">Status (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          {/* Task 4.10.1: Export button in orders list header with dropdown menu */}
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Task 4.3.9: Search result count display */}
        {debouncedSearch && (
          <p className="text-sm text-gray-600">
            {data?.totalDocs || 0} orders found
          </p>
        )}
      </div>

      {/* Task 4.1.6: Empty state component when no orders match filters */}
      {!hasOrders && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No orders found</p>
            {(search || queryState.status !== "all" || dateFrom || dateTo) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setQueryState({ status: "all", page: "1" });
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task 4.2: Orders table component with all order data */}
      {hasOrders && (
        <OrdersTable
          orders={data.docs}
          isLoading={isLoading}
          totalDocs={data.totalDocs}
          totalPages={data.totalPages}
          currentPage={page}
          onPageChange={(newPage) => setQueryState({ page: newPage.toString() })}
          status={queryState.status as any}
          onStatusChange={(newStatus) => setQueryState({ status: newStatus, page: "1" })}
          search={debouncedSearch}
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}
