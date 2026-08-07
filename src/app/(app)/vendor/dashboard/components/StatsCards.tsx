"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statCards = [
  {
    title: "Total Products",
    href: "/vendor/products",
    icon: Package,
    description: "Active products in your store",
    getValue: (stats: { totalProducts?: number }) => stats.totalProducts?.toString() ?? "0",
  },
  {
    title: "Total Orders",
    href: "/vendor/orders",
    icon: ShoppingCart,
    description: "Orders received",
    getValue: (stats: { totalOrders?: number }) => stats.totalOrders?.toString() ?? "0",
  },
  {
    title: "Revenue",
    href: "/vendor/stripe-onboarding",
    icon: DollarSign,
    description: "Total earnings",
    getValue: (stats: { totalRevenue?: number }) =>
      stats.totalRevenue
        ? `$${stats.totalRevenue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : "$0.00",
  },
  {
    title: "Pending Orders",
    href: "/vendor/orders?status=pending",
    icon: Clock,
    description: "Orders awaiting fulfillment",
    getValue: (stats: { pendingOrders?: number }) => stats.pendingOrders?.toString() ?? "0",
  },
] as const;

export function StatsCards() {
  const { data: stats, isLoading } = trpc.vendor.dashboard.stats.useQuery();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.title} href={stat.href} className="group block">
            <Card
              className={cn(
                "h-full transition-colors",
                "hover:border-primary/40 hover:bg-accent/30"
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                  {stat.title}
                </CardTitle>
                <CardDescription className="text-xs">{stat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    <p className="text-2xl font-semibold text-foreground">
                      {stat.getValue(stats ?? {})}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
