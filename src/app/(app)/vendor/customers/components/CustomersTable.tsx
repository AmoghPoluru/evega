"use client";

import { format } from "date-fns";
import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { CustomerSegmentId } from "@/lib/customers/customer-segments";
import {
  getCustomerSegmentShortLabel,
  TOP_CUSTOMERS_CARD,
} from "@/lib/customers/customer-segments";

export interface CustomerListRow {
  user: unknown;
  orders: Array<{
    id: string;
    orderNumber?: string | null;
    status?: string | null;
    total?: number | null;
    createdAt?: string | null;
    product?: string | { name?: string | null } | null;
  }>;
  totalSpent: number;
  totalAmountPaid?: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: Date | string | null;
  lastViewedAt?: Date | string | null;
  productViewCount?: number;
  customerId?: string;
  customerRecordId?: string | null;
  name?: string;
  email?: string;
  phone?: string;
  segments?: CustomerSegmentId[];
  segmentLabels?: string[];
  primarySegment?: CustomerSegmentId | null;
  systemSegment?: CustomerSegmentId | null;
  displaySegment?: CustomerSegmentId | null;
  isManualSegment?: boolean;
  segmentOverrideReason?: string | null;
  segmentOverrideSetAt?: string | null;
  isTopCustomer?: boolean;
}

interface CustomersTableProps {
  customers: CustomerListRow[];
  isLoading?: boolean;
  onEditCustomer?: (customer: CustomerListRow) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

function segmentBadgeVariant(
  segment: CustomerSegmentId,
): "default" | "secondary" | "outline" {
  switch (segment) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "visitor":
      return "outline";
  }
}

export function CustomersTable({
  customers,
  isLoading,
  onEditCustomer,
}: CustomersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead className="text-right">Amount paid</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => {
              const user = typeof customer.user === "string" ? null : (customer.user as {
                id?: string;
                name?: string;
                email?: string;
              } | null);
              const userName = customer.name || user?.name || user?.email || "Unknown";
              const userEmail = customer.email || user?.email || "";
              const userPhone = customer.phone || "";
              const userId = user?.id || customer.customerId || customer.user;
              const orders = customer.orders || [];
              const totalAmountPaid = customer.totalAmountPaid || customer.totalSpent || 0;
              const displaySegment = customer.displaySegment ?? customer.primarySegment ?? null;
              const listCustomerId = String(customer.customerId || userId || userName);

              return (
                <TableRow key={String(customer.customerId || userId || userName)} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{userName}</div>
                        {userEmail ? (
                          <div className="text-sm text-gray-500">{userEmail}</div>
                        ) : null}
                        {userPhone ? (
                          <div className="text-sm text-gray-500">{userPhone}</div>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {displaySegment ? (
                        <Badge variant={segmentBadgeVariant(displaySegment)}>
                          {getCustomerSegmentShortLabel(displaySegment)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">Uncategorized</span>
                      )}
                      {customer.isManualSegment ? (
                        <Badge variant="outline">Manual</Badge>
                      ) : null}
                      {customer.isTopCustomer ? (
                        <Badge variant="default" className="bg-violet-600 hover:bg-violet-600">
                          {TOP_CUSTOMERS_CARD.shortLabel}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {orders.length === 0 ? (
                        customer.lastViewedAt ? (
                          <div className="text-sm text-gray-600">
                            Viewed {customer.productViewCount ?? 1} product
                            {(customer.productViewCount ?? 1) !== 1 ? "s" : ""}
                            <div className="text-xs text-gray-500">
                              Last visit{" "}
                              {format(new Date(customer.lastViewedAt), "MMM d, yyyy")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No activity yet</span>
                        )
                      ) : (
                        orders.map((order) => {
                          const product =
                            typeof order.product === "string" ? null : order.product;
                          const productName = product?.name || "Unknown Product";
                          const orderNumber = order.orderNumber || order.id;
                          const orderDate = order.createdAt
                            ? format(new Date(order.createdAt), "MMM d, yyyy")
                            : "";
                          const orderTotal = order.total || 0;
                          const orderStatus = order.status || "pending";

                          return (
                            <div
                              key={order.id}
                              className="flex items-center justify-between gap-3 text-sm border-b pb-2 last:border-0"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{productName}</div>
                                <div className="text-xs text-gray-500">
                                  {orderNumber} • {orderDate} • {orderStatus}
                                </div>
                              </div>
                              <div className="text-right font-medium">
                                {formatCurrency(orderTotal)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(totalAmountPaid)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {orders.length} order{orders.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    {onEditCustomer ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditCustomer(customer)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
