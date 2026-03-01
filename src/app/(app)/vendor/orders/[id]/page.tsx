"use client";

// Task 4.11.1: Order detail page as client component using tRPC for data fetching with React Query
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Copy, Mail, MapPin, Printer, Package, Truck } from "lucide-react";
import { toast } from "sonner";
import { UpdateStatusModal } from "./components/UpdateStatusModal";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: Props) {
  // Task 4.11.2: Extract order ID from route params using React.use() for async params
  const { id } = use(params);
  const router = useRouter();

  // Task 4.11.3: Use tRPC query to fetch order data with depth 2 for relationships
  const { data: order, isLoading, error } = trpc.vendor.orders.getOne.useQuery({ id });

  // Task 4.11.4: Loading skeleton state with shadcn/ui Skeleton components
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Task 4.11.5: Error state with error message and retry button
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/vendor/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading order: {error.message}</p>
              <Button onClick={() => router.refresh()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Task 4.11.6: Not found state (404) when order doesn't exist
  if (!order) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/vendor/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Order not found</p>
              <Button asChild>
                <Link href="/vendor/orders">Back to Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Task 4.12.2: Display order number prominently from order.orderNumber or order.id
  const orderNumber = order.orderNumber || order.id;
  
  // Task 4.12.3: Format order date with date-fns
  const formattedDate = order.createdAt
    ? format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")
    : "N/A";
  
  // Task 4.12.4: Status badge with color coding
  const statusColorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    payment_done: "default",
    processing: "default",
    complete: "default",
    refunded: "outline",
    canceled: "destructive",
  };
  
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    payment_done: "Payment Done",
    processing: "Processing",
    complete: "Complete",
    canceled: "Canceled",
    refunded: "Refunded",
  };

  // Task 4.13.2-4.13.3: Customer information from order.user relationship (depth 2)
  const customer = typeof order.user === "object" && order.user
    ? {
        name: order.user.name || "Unknown",
        email: order.user.email || "N/A",
        id: order.user.id,
      }
    : { name: "Unknown", email: "N/A", id: "" };

  // Task 4.15: Order items - single product per order in current schema
  const product = typeof order.product === "object" && order.product
    ? order.product
    : null;

  // Task 4.16.5: Format currency for totals
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Task 4.12.10: Copy order number to clipboard functionality
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    toast.success("Order number copied to clipboard");
  };

  return (
    <div className="p-6">
      {/* Task 4.11.7: Back to Orders button/link */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/vendor/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      {/* Task 4.11.8: Page title with order number */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Order {orderNumber}</h1>
            <p className="text-sm text-gray-600 mt-1">Order Details</p>
          </div>
          {/* Task 4.12.9: Action buttons section with status update button */}
          <div className="flex gap-2">
            <UpdateStatusModal orderId={order.id} currentStatus={order.status}>
              <Button variant="default">
                <Package className="mr-2 h-4 w-4" />
                Update Status
              </Button>
            </UpdateStatusModal>
            <Button variant="outline" onClick={copyOrderNumber}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Order #
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Task 4.12: Order information card with number, date, status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Order details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Task 4.12.2: Order number display */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order Number:</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              
              {/* Task 4.12.3: Formatted order date */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order Date:</span>
                <span className="text-sm">{formattedDate}</span>
              </div>
              
              {/* Task 4.12.4: Status badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge
                  variant={statusColorMap[order.status] || "default"}
                  className={
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "complete"
                      ? "bg-green-100 text-green-800"
                      : order.status === "canceled"
                      ? "bg-red-100 text-red-800"
                      : ""
                  }
                >
                  {statusLabels[order.status] || order.status}
                </Badge>
              </div>
              
              {/* Task 4.12.5: Order ID (smaller, secondary text) */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-xs text-gray-500 font-mono">{order.id}</span>
              </div>
            </CardContent>
          </Card>

          {/* Task 4.15: Order items table with product details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Products in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    {/* Task 4.15.5: Product name column */}
                    <TableCell className="font-medium">
                      {product?.name || "Product"}
                    </TableCell>
                    
                    {/* Task 4.15.8: Quantity column */}
                    <TableCell>{order.quantity || 1}</TableCell>
                    
                    {/* Task 4.15.9: Unit price column (formatted currency) */}
                    <TableCell className="text-right">
                      {formatCurrency((order.total || 0) / (order.quantity || 1))}
                    </TableCell>
                    
                    {/* Task 4.15.10: Line total column (quantity × unit price) */}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total || 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Task 4.14: Shipping information card with tracking details and address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </CardTitle>
              <CardDescription>Tracking and delivery details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Task 4.14.1: Display shipping address if available */}
              {order.shippingAddress && (
                <div className="border-b pb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipcode}
                    </p>
                    {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                  </div>
                </div>
              )}

              {/* Task 4.14.12: Display shipping method */}
              {order.shippingMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shipping Method:</span>
                  <span className="text-sm font-medium capitalize">
                    {order.shippingMethod.replace("_", " ")}
                  </span>
                </div>
              )}

              {/* Task 4.14.12: Display shipping cost */}
              {order.shippingCost !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shipping Cost:</span>
                  <span className="text-sm font-medium">{formatCurrency(order.shippingCost || 0)}</span>
                </div>
              )}

              {/* Task 4.14.12: Display shipping status */}
              {order.shippingStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shipping Status:</span>
                  <Badge variant="outline" className="capitalize">
                    {order.shippingStatus.replace("_", " ")}
                  </Badge>
                </div>
              )}

              {/* Task 4.14.12: Display shipping method/carrier */}
              {order.carrier && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Carrier:</span>
                  <span className="text-sm font-medium capitalize">{order.carrier}</span>
                </div>
              )}
              
              {/* Task 4.18.10: Display tracking number if exists */}
              {order.trackingNumber ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tracking Number:</span>
                    <span className="text-sm font-mono">{order.trackingNumber}</span>
                  </div>
                  
                  {/* Task 4.18.13: Make tracking number clickable (link to carrier tracking page) */}
                  {order.trackingUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tracking URL:</span>
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Track Package
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No tracking information available yet
                </div>
              )}
              
              {/* Task 4.14.12: Display estimated delivery date */}
              {order.estimatedDelivery && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated Delivery:</span>
                  <span className="text-sm">
                    {format(new Date(order.estimatedDelivery), "MMM d, yyyy")}
                  </span>
                </div>
              )}

              {/* Task 4.14.12: Display actual delivery date */}
              {order.actualDeliveryDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Actual Delivery:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(order.actualDeliveryDate), "MMM d, yyyy")}
                  </span>
                </div>
              )}

              {/* Task 4.14.12: Display shipping label URL if available */}
              {order.shippingLabelUrl && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Shipping Label:</span>
                  <a
                    href={order.shippingLabelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Label
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Task 4.13: Customer information card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Customer details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Task 4.13.2: Customer name */}
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <p className="font-medium">{customer.name}</p>
              </div>
              
              {/* Task 4.13.3: Customer email */}
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="text-sm">{customer.email}</p>
              </div>
              
              {/* Task 4.13.6: Email customer button (mailto link) */}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`mailto:${customer.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Customer
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Task 4.16: Order summary card with totals */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Payment and totals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Task 4.16.2: Subtotal display */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(order.total || 0)}</span>
              </div>
              
              {/* Task 4.16.3: Shipping cost (if applicable) */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span>{formatCurrency(order.shippingCost || 0)}</span>
              </div>
              
              {/* Task 4.16.4: Tax amount (if applicable) */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span>$0.00</span>
              </div>
              
              {/* Task 4.16.10: Separator line before total */}
              <div className="border-t pt-3 mt-3">
                {/* Task 4.16.6: Total amount (bold, larger font) */}
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-lg">{formatCurrency(order.total || 0)}</span>
                </div>
              </div>
              
              {/* Task 4.16.12: Payment status display */}
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status:</span>
                  <Badge variant={order.status === "payment_done" || order.status === "complete" ? "default" : "outline"}>
                    {order.status === "payment_done" || order.status === "complete" ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
