"use client";

// Task 5.2.1: Customers table component with Table structure and customer row mapping
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Customer {
  user: any;
  orders: any[];
  totalSpent: number;
  totalAmountPaid?: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
  customerId?: string;
  name?: string;
  email?: string;
}

interface CustomersTableProps {
  customers: Customer[];
  isLoading?: boolean;
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

export function CustomersTable({ customers, isLoading }: CustomersTableProps) {

  // Task 5.2.7: Loading state with skeleton rows
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
    <div className="border rounded-lg">
      {/* Task 5.2.2: Use shadcn/ui Table component with proper structure */}
      <Table>
        {/* Task 5.2.3: Table header row with column labels */}
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Order List</TableHead>
            <TableHead className="text-right">Amount Paid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Task 5.2.4: Table body with customer rows */}
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => {
              const user = typeof customer.user === "string" ? null : customer.user;
              const userName = customer.name || user?.name || user?.email || "Unknown";
              const userEmail = customer.email || user?.email || "";
              const userId = user?.id || customer.user;
              const orders = customer.orders || [];
              const totalAmountPaid = customer.totalAmountPaid || customer.totalSpent || 0;

              return (
                <TableRow
                  key={customer.customerId || userId || "unknown"}
                  className="hover:bg-gray-50"
                >
                  {/* Customer Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{userName}</div>
                        <div className="text-sm text-gray-500">{userEmail}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Order List */}
                  <TableCell>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {orders.length === 0 ? (
                        <span className="text-sm text-gray-400">No orders</span>
                      ) : (
                        orders.map((order: any) => {
                          const product = typeof order.product === "string" ? null : order.product;
                          const productName = product?.name || "Unknown Product";
                          const orderNumber = order.orderNumber || order.id;
                          const orderDate = order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "";
                          const orderTotal = order.total || 0;
                          const orderStatus = order.status || "pending";

                          return (
                            <div key={order.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                              <div className="flex-1">
                                <div className="font-medium">{productName}</div>
                                <div className="text-xs text-gray-500">
                                  {orderNumber} • {orderDate} • {orderStatus}
                                </div>
                              </div>
                              <div className="text-right font-medium ml-4">
                                {formatCurrency(orderTotal)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </TableCell>

                  {/* Amount Paid */}
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
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
