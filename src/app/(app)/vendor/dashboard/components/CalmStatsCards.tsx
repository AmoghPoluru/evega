"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Package, ShoppingBag } from "lucide-react";

import { trpc } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { vendorDashboardStatLabels } from "@/lib/vendor-portal-labels";

/**
 * Three calm numbers for the dashboard home — deep insights live on Analytics.
 */
export function CalmStatsCards() {
  const { data: stats, isLoading } = trpc.vendor.dashboard.stats.useQuery();

  const todaysOrders = stats?.analyticsToday?.orders ?? 0;
  const pendingOrders = stats?.pendingOrders ?? 0;
  const activeProducts = stats?.totalProducts ?? 0;

  const cards = [
    {
      id: "todays-orders",
      title: vendorDashboardStatLabels.todaysOrders,
      value: todaysOrders,
      href: "/vendor/orders",
      icon: ShoppingBag,
      hint: "Orders placed today",
    },
    {
      id: "pending-fulfillment",
      title: vendorDashboardStatLabels.pendingFulfillment,
      value: pendingOrders,
      href: "/vendor/orders",
      icon: AlertCircle,
      hint: "Pending orders to handle",
    },
    {
      id: "active-products",
      title: vendorDashboardStatLabels.activeProducts,
      value: activeProducts,
      href: "/vendor/products",
      icon: Package,
      hint: "Listed in your catalog",
    },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.id} href={card.href} className="group block">
              <Card className="h-full transition-colors hover:border-foreground/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-xs">{card.hint}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <p className="text-3xl font-semibold tabular-nums tracking-tight">
                        {card.value}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Link
          href="/vendor/analytics"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {vendorDashboardStatLabels.seeInsights}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
