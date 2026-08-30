import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function OrderDetailShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">{children}</div>
    </div>
  );
}

function BackToOrders() {
  return (
    <div className="mb-6">
      <Button variant="ghost" asChild>
        <Link href="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <OrderDetailShell>
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
    </OrderDetailShell>
  );
}

export function OrderDetailError({
  message,
  onRetry,
  showBackLink = true,
}: {
  message: string;
  onRetry: () => void;
  showBackLink?: boolean;
}) {
  return (
    <OrderDetailShell>
      {showBackLink && <BackToOrders />}
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading order: {message}</p>
            <Button onClick={onRetry}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    </OrderDetailShell>
  );
}

export function OrderDetailNotFound() {
  return (
    <OrderDetailShell>
      <BackToOrders />
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
    </OrderDetailShell>
  );
}
