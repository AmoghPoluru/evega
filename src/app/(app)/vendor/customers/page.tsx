"use client";

// Task 5.1.1: Customers list page as client component using tRPC for data fetching with React Query
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import { trpc } from "@/trpc/client";
import { CustomersTable, type CustomerListRow } from "./components/CustomersTable";
import { CustomerEditDialog } from "./components/CustomerEditDialog";
import { CustomerAddDialog } from "./components/CustomerAddDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Download, Plus } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { CUSTOMER_SEGMENTS, TOP_CUSTOMERS_CARD, type CustomerFilterId } from "@/lib/customers/customer-segments";

const CUSTOMER_FILTER_CARDS = [...CUSTOMER_SEGMENTS, TOP_CUSTOMERS_CARD] as const;

export default function VendorCustomersPage() {
  const router = useRouter();
  
  // Task 5.1.2: Page layout with header, filters, and table sections using state management with nuqs for URL state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [queryState, setQueryState] = useQueryStates({
    status: parseAsString.withDefault("all"),
    segment: parseAsString.withDefault("all"),
    page: parseAsString.withDefault("1"),
    sortBy: parseAsString.withDefault("lastOrderDate"),
    sortOrder: parseAsString.withDefault("desc"),
  });

  const page = parseInt(queryState.page || "1", 10);
  const [editingCustomer, setEditingCustomer] = useState<CustomerListRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Task 5.3.3: Debounce search input (300ms) to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Task 5.1.3: Page title and description in header section
  const { data, isLoading, error } = trpc.vendor.customers.list.useQuery({
    status: queryState.status as "all" | "active" | "inactive" | "new",
    segment: queryState.segment as CustomerFilterId | "all",
    search: debouncedSearch || undefined,
    page,
    limit: 20,
    sortBy: (queryState.sortBy as "name" | "totalSpent" | "totalOrders" | "lastOrderDate") || "lastOrderDate",
    sortOrder: (queryState.sortOrder as "asc" | "desc") || "desc",
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
  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    queryState.status !== "all" ||
    queryState.segment !== "all";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vendorPageTitles.customers}</h1>
          <p className="text-gray-600 mt-1">
            Potential customers, open order customers, confirmed loyal customers, and top customers —
            grouped so you know who to follow up with
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CUSTOMER_FILTER_CARDS.map((segment) => {
          const count = data?.segmentCounts?.[segment.id as CustomerFilterId] ?? 0;
          const isActive = queryState.segment === segment.id;

          return (
            <button
              key={segment.id}
              type="button"
              onClick={() => setQueryState({ segment: segment.id, page: "1" })}
              className="text-left"
            >
              <Card className={isActive ? "border-primary shadow-sm" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{segment.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{count}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{segment.description}</p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        {queryState.segment !== "all" ? (
          <Button variant="outline" onClick={() => setQueryState({ segment: "all", page: "1" })}>
            Show all customers
          </Button>
        ) : null}
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
        {(search || queryState.status !== "all" || queryState.segment !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setQueryState({ status: "all", segment: "all", page: "1" });
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Task 5.3.8: Show result count */}
      {hasActiveFilters ? (
        <p className="text-sm text-gray-600">
          {totalDocs} customer{totalDocs !== 1 ? "s" : ""} found
          {queryState.segment !== "all" && totalDocs === 0
            ? " for this category"
            : ""}
        </p>
      ) : null}

      {/* Table */}
      <CustomersTable
        customers={customers}
        isLoading={isLoading}
        onEditCustomer={(customer) => {
          setEditingCustomer(customer);
          setEditDialogOpen(true);
        }}
      />

      <CustomerEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={
          editingCustomer
            ? {
                listCustomerId: String(
                  editingCustomer.customerId || editingCustomer.customerRecordId || editingCustomer.name,
                ),
                customerRecordId: editingCustomer.customerRecordId,
                name: editingCustomer.name || "Unknown",
                email: editingCustomer.email || "",
                phone: editingCustomer.phone || "",
                systemSegment: editingCustomer.systemSegment ?? null,
                displaySegment: editingCustomer.displaySegment ?? null,
                isManualSegment: editingCustomer.isManualSegment ?? false,
                segmentOverrideReason: editingCustomer.segmentOverrideReason ?? null,
                segmentOverrideSetAt: editingCustomer.segmentOverrideSetAt ?? null,
              }
            : null
        }
        onSaved={() => {
          setEditingCustomer(null);
        }}
      />

      <CustomerAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSaved={() => {}}
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
