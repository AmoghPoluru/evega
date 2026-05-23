"use client";

import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { CreateOrderDialog } from "@/app/(app)/vendor/orders/components/CreateOrderDialog";
import { trpc } from "@/trpc/client";
import { AdminOrdersTable } from "./components/AdminOrdersTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatusFilter } from "./order-utils";

export default function StaffOrdersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<OrderStatusFilter>("all");
  const [vendorId, setVendorId] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, vendorId, dateFrom, dateTo]);

  const { data: vendorsData } = trpc.admin.vendors.listOptions.useQuery();

  const { data, isLoading, error, refetch } = trpc.admin.orders.list.useQuery({
    status,
    search: debouncedSearch || undefined,
    vendorId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-red-600">Error loading orders: {error.message}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create manual orders or edit line items, totals, and status inline from the list.
          </p>
        </div>
        <Button onClick={() => setCreateOrderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create order
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search order # or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatusFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="payment_done">Payment Done</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={vendorId || "all"}
          onValueChange={(v) => setVendorId(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All vendors</SelectItem>
            {(vendorsData ?? []).map((v: { id: string; name: string }) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[150px]"
          aria-label="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[150px]"
          aria-label="To date"
        />
      </div>

      {isLoading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <AdminOrdersTable
          orders={data?.docs ?? []}
          isLoading={isLoading}
          totalDocs={data?.totalDocs ?? 0}
          totalPages={data?.totalPages ?? 1}
          currentPage={page}
          onPageChange={setPage}
        />
      )}

      <CreateOrderDialog
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
        context="staff"
        onSuccess={() => {
          setCreateOrderOpen(false);
          void refetch();
        }}
      />
    </div>
  );
}
