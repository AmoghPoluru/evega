"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeft, Copy, Mail, MapPin, Phone, Printer, Package, Truck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentPending = searchParams.get("payment") === "pending";

  // Fetch order data (protected - only returns orders for logged-in user)
  const { data: order, isLoading, error } = trpc.orders.getOneForUser.useQuery({ id });

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-4">
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
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/orders">
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
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <div className="bg-gray-100 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/orders">
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
                  <Link href="/orders">Back to Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pending", variant: "secondary" },
      payment_done: { label: "Payment Done", variant: "default" },
      processing: { label: "Processing", variant: "default" },
      complete: { label: "Complete", variant: "default" },
      canceled: { label: "Canceled", variant: "destructive" },
      refunded: { label: "Refunded", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const product = typeof order.product === "object" ? order.product : null;
  const vendor = typeof order.vendor === "object" ? order.vendor : null;

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 mt-4">
            Order #{order.orderNumber || id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
          </p>
        </div>

        {/* Offline Payment Pending Banner */}
        {paymentPending && order.paymentMethod === "offline" && order.paymentStatus === "pending" && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">
                    Payment Pending - Vendor Will Contact You
                  </h3>
                  <p className="text-amber-800 mb-4">
                    Your order has been placed! The vendor will contact you at the phone number you provided to complete the payment.
                  </p>
                  {order.offlinePaymentContact?.customerPhone && (
                    <div className="bg-white rounded p-3 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Contact Number:</p>
                      <p className="text-sm text-gray-900">{order.offlinePaymentContact.customerPhone}</p>
                    </div>
                  )}
                  {order.offlinePaymentContact?.phone && (
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-amber-700" />
                      <span className="text-sm text-amber-800">Vendor Phone: {order.offlinePaymentContact.phone}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `tel:${order.offlinePaymentContact?.phone}`}
                      >
                        Call
                      </Button>
                    </div>
                  )}
                  {order.offlinePaymentContact?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-700" />
                      <span className="text-sm text-amber-800">Vendor Email: {order.offlinePaymentContact.email}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `mailto:${order.offlinePaymentContact?.email}`}
                      >
                        Email
                      </Button>
                    </div>
                  )}
                  {order.offlinePaymentNotes && (
                    <div className="mt-4 p-3 bg-white rounded border border-amber-200">
                      <p className="font-medium mb-1 text-xs uppercase text-gray-600">Payment Instructions:</p>
                      <p className="text-sm text-gray-700">{order.offlinePaymentNotes}</p>
                    </div>
                  )}
                  <p className="text-sm text-amber-700 mt-4">
                    Once payment is received, the vendor will update your order status and begin processing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableHead className="w-[150px]">Order Number</TableHead>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.orderNumber || id.slice(0, 8)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(order.orderNumber || id);
                              toast.success("Order number copied to clipboard");
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                    </TableRow>
                    {order.paymentMethod && (
                      <TableRow>
                        <TableHead>Payment Method</TableHead>
                        <TableCell>
                          <Badge variant="outline">
                            {order.paymentMethod === "stripe" ? "Stripe" : "Offline Payment"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )}
                    {order.paymentStatus && (
                      <TableRow>
                        <TableHead>Payment Status</TableHead>
                        <TableCell>
                          <Badge variant={order.paymentStatus === "completed" ? "default" : "secondary"}>
                            {order.paymentStatus === "completed" ? "Completed" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableHead>Total Amount</TableHead>
                      <TableCell className="font-semibold">
                        ${order.total?.toFixed(2) || "0.00"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableCell>
                        {format(new Date(order.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Product Information */}
            {product && (
              <Card>
                <CardHeader>
                  <CardTitle>Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {product.image && typeof product.image === "object" && (
                      <div className="w-24 h-24 border border-gray-300 rounded overflow-hidden bg-white shrink-0">
                        <img
                          src={product.image.url || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-lg font-medium text-blue-600 hover:text-orange-600 hover:underline"
                      >
                        {product.name}
                      </Link>
                      {order.size && (
                        <p className="text-sm text-gray-600 mt-1">Size: {order.size}</p>
                      )}
                      {order.color && (
                        <p className="text-sm text-gray-600">Color: {order.color}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">Quantity: {order.quantity || 1}</p>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        ${order.total?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    {order.shippingAddress.phone && (
                      <p className="text-gray-600">{order.shippingAddress.phone}</p>
                    )}
                    <p className="text-gray-600">{order.shippingAddress.street}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipcode}
                    </p>
                    {order.shippingAddress.country && (
                      <p className="text-gray-600">{order.shippingAddress.country}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tracking Information */}
            {order.trackingNumber && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Tracking Number</p>
                      <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                    </div>
                    {order.carrier && (
                      <div>
                        <p className="text-sm font-medium">Carrier</p>
                        <p className="text-sm text-gray-600 capitalize">{order.carrier}</p>
                      </div>
                    )}
                    {order.trackingUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                          Track Package
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                {product && (
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/products/${product.id}`}>
                      <Package className="mr-2 h-4 w-4" />
                      Buy Again
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${order.total?.toFixed(2) || "0.00"}</span>
                  </div>
                  {order.shipping !== undefined && order.shipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">${order.shipping.toFixed(2)}</span>
                    </div>
                  )}
                  {order.tax !== undefined && order.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${order.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
