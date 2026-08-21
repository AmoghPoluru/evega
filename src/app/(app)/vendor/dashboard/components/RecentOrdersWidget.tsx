"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { trpc } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, PackagePlus, ShoppingBag } from "lucide-react";
import type { Order } from "@/payload-types";

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getCustomerName(order: Order): string {
  if (typeof order.user === "object" && order.user?.name) {
    return order.user.name;
  }
  return order.name ?? "Guest";
}

export function RecentOrdersWidget() {
  const router = useRouter();
  const { data, isLoading } = trpc.vendor.orders.list.useQuery({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "all",
  });

  const orders: Order[] = data?.docs ?? [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Recent orders</CardTitle>
          <CardDescription>What customers just bought</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendor/orders">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">No orders yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Once someone buys from your store, their order shows up here so you can pack and
              ship.
            </p>
            <Button size="sm" className="mt-5" asChild>
              <Link href="/vendor/products/new">
                <PackagePlus className="h-4 w-4" />
                Add a product to get started
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const orderNumber = order.orderNumber ?? order.id;
                  const status = order.status ?? "pending";
                  const formattedDate = order.createdAt
                    ? format(new Date(order.createdAt), "MMM d, yyyy")
                    : "—";

                  return (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/vendor/orders/${order.id}`)}
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/vendor/orders/${order.id}`}
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getCustomerName(order)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColorMap[status] ?? "outline"}>
                          {statusLabels[status] ?? status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total ?? 0)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formattedDate}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
