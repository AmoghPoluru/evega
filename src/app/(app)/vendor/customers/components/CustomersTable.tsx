"use client";

// Task 5.2.1: Customers table component with Table structure and customer row mapping
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail } from "lucide-react";

interface Customer {
  user: any;
  orders: any[];
  totalSpent: number;
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

// Task 5.4.7: Customer status badge mapping
const getCustomerStatus = (lastOrderDate: Date | null, orderCount: number): string => {
  if (!lastOrderDate) return "inactive";
  
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  if (lastOrderDate >= ninetyDaysAgo) {
    return "active";
  } else if (orderCount === 1 && lastOrderDate >= thirtyDaysAgo) {
    return "new";
  }
  return "inactive";
};

const statusColorMap: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  new: "bg-blue-100 text-blue-800",
};

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
  const router = useRouter();

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
            <TableHead>Customer</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="text-right">Total Spent</TableHead>
            <TableHead className="text-right">Avg Order Value</TableHead>
            <TableHead>Last Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Task 5.2.4: Table body with customer rows */}
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => {
              const user = typeof customer.user === "string" ? null : customer.user;
              const userName = customer.name || user?.name || user?.email || "Unknown";
              const userEmail = customer.email || user?.email || "";
              const status = getCustomerStatus(customer.lastOrderDate, customer.orderCount);
              const userId = user?.id || customer.user;

              return (
                <TableRow
                  key={customer.customerId || userId || "unknown"}
                  // Task 5.2.5: Make rows clickable to navigate to customer detail page
                  onClick={() => router.push(`/vendor/customers/${userId}`)}
                  // Task 5.2.6: Hover effect on table rows
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {/* Task 5.4.1: Customer name column with avatar/initials */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{userName}</div>
                        {/* Task 5.4.2: Customer email column */}
                        <div className="text-sm text-gray-500">{userEmail}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Task 5.4.3: Total orders count column */}
                  <TableCell>{customer.orderCount}</TableCell>

                  {/* Task 5.4.4: Total spent column (format currency) */}
                  <TableCell className="text-right font-medium">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>

                  {/* Task 5.4.5: Average order value column */}
                  <TableCell className="text-right">
                    {formatCurrency(customer.averageOrderValue)}
                  </TableCell>

                  {/* Task 5.4.6: Last order date column (format with date-fns) */}
                  <TableCell>
                    {customer.lastOrderDate
                      ? format(customer.lastOrderDate, "MMM d, yyyy")
                      : "Never"}
                  </TableCell>

                  {/* Task 5.4.7: Customer status badge */}
                  <TableCell>
                    <Badge className={statusColorMap[status] || statusColorMap.inactive}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </TableCell>

                  {/* Task 5.4.8: Actions column with dropdown menu */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/vendor/customers/${userId}`)}>
                          View Details
                        </DropdownMenuItem>
                        {userEmail && (
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${userEmail}`}>
                              <Mail className="h-4 w-4 mr-2" />
                              Email Customer
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
