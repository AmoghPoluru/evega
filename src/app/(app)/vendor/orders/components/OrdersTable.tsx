"use client";

// Task 4.2.1: Orders table component using shadcn/ui Table with proper structure and responsive design
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import type { Order } from "@/payload-types";

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  status: "all" | "pending" | "payment_done" | "processing" | "complete" | "canceled" | "refunded";
  onStatusChange: (status: "all" | "pending" | "payment_done" | "processing" | "complete" | "canceled" | "refunded") => void;
  search: string;
  onSearchChange: (search: string) => void;
}

// Task 4.8.2: Status color mapping object for badge variants
const statusColorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  payment_done: "default",
  processing: "default",
  complete: "default",
  refunded: "outline",
  canceled: "destructive",
};

// Task 4.8.3-4.8.7: Status badge styling with color variants and labels
const statusLabels: Record<string, string> = {
  pending: "Pending",
  payment_done: "Payment Done",
  processing: "Processing",
  complete: "Complete",
  canceled: "Canceled",
  refunded: "Refunded",
};

export function OrdersTable({
  orders,
  isLoading,
  totalDocs,
  totalPages,
  currentPage,
  onPageChange,
}: OrdersTableProps) {
  const router = useRouter();

  // Task 4.2.7: Loading state with skeleton rows for better UX
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Task 4.9.3: Display "Showing X-Y of Z orders" text for pagination info
  const startItem = (currentPage - 1) * 20 + 1;
  const endItem = Math.min(currentPage * 20, totalDocs);

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        {/* Task 4.2.2: shadcn/ui Table component with proper structure */}
        <Table>
          {/* Task 4.2.3: Table header row with column labels */}
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Task 4.2.4: Table body with order rows mapping over orders array */}
            {orders.map((order) => {
              // Task 4.7.1: Display order number from order.orderNumber or order.id
              const orderNumber = order.orderNumber || order.id;
              
              // Task 4.7.2: Display customer name or email (depth 2 relationship)
              const customer = typeof order.user === "object" && order.user
                ? order.user.name || order.user.email || "Unknown"
                : "Unknown";
              
              // Task 4.7.3: Display items count from order.quantity
              const itemsCount = order.quantity || 1;
              
              // Task 4.7.5: Format total amount as currency
              const formattedTotal = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(order.total || 0);
              
              // Task 4.7.7: Format date with date-fns
              const formattedDate = order.createdAt
                ? format(new Date(order.createdAt), "MMM d, yyyy")
                : "N/A";
              
              // Task 4.7.8: Format time or combine with date
              const formattedTime = order.createdAt
                ? format(new Date(order.createdAt), "h:mm a")
                : "";

              return (
                <TableRow
                  key={order.id}
                  // Task 4.2.5: Make rows clickable to navigate to order detail page
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/vendor/orders/${order.id}`)}
                >
                  {/* Task 4.7.1: Order number column */}
                  <TableCell className="font-medium">{orderNumber}</TableCell>
                  
                  {/* Task 4.7.2: Customer column with truncation */}
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={customer}>
                      {customer}
                    </div>
                  </TableCell>
                  
                  {/* Task 4.7.3: Items count column */}
                  <TableCell>{itemsCount} {itemsCount === 1 ? "item" : "items"}</TableCell>
                  
                  {/* Task 4.7.5: Total amount column */}
                  <TableCell className="font-medium">{formattedTotal}</TableCell>
                  
                  {/* Task 4.7.6: Status column with badge */}
                  <TableCell>
                    {/* Task 4.8.1: shadcn/ui Badge component with status color mapping */}
                    <Badge
                      variant={statusColorMap[order.status] || "default"}
                      // Task 4.8.8: Map status to variant using statusColorMap
                      className={
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : order.status === "complete"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : order.status === "canceled"
                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                          : ""
                      }
                    >
                      {/* Task 4.8.9: Status label from statusLabels mapping */}
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  
                  {/* Task 4.7.7-4.7.8: Date and time column */}
                  <TableCell>
                    <div className="text-sm">
                      <div>{formattedDate}</div>
                      <div className="text-gray-500 text-xs">{formattedTime}</div>
                    </div>
                  </TableCell>
                  
                  {/* Task 4.7.9: Actions column with dropdown menu */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/vendor/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Task 4.9: Pagination component with page controls */}
      <div className="flex items-center justify-between">
        {/* Task 4.9.3: Display pagination info text */}
        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalDocs} orders
        </div>
        
        <div className="flex items-center gap-2">
          {/* Task 4.9.6: Previous button disabled when on first page */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Task 4.9.8: Page number display (current page) */}
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          
          {/* Task 4.9.7: Next button disabled when on last page */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
