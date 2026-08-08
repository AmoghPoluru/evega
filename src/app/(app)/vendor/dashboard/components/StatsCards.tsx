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
import { Activity, BarChart3, Package, Users } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  getBusinessHealthStyles,
  type BusinessHealthStatus,
} from "@/lib/vendor-dashboard/business-health";
import { vendorDashboardStatLabels } from "@/lib/vendor-portal-labels";
import {
  CUSTOMER_SEGMENTS,
  TOP_CUSTOMERS_CARD,
  type CustomerSegmentId,
} from "@/lib/customers/customer-segments";
import {
  PRODUCT_SNAPSHOT_METRICS,
  type ProductSnapshotMetricId,
} from "@/lib/vendor-dashboard/product-snapshot";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type DashboardStats = inferRouterOutputs<AppRouter>["vendor"]["dashboard"]["stats"];

const SEGMENT_BAR_STYLES: Record<
  CustomerSegmentId | "top",
  { bar: string; label: string; value: string }
> = {
  completed: {
    bar: "bg-green-500",
    label: "text-muted-foreground",
    value: "text-green-700",
  },
  pending: {
    bar: "bg-amber-500",
    label: "text-muted-foreground",
    value: "text-amber-700",
  },
  visitor: {
    bar: "bg-blue-500",
    label: "text-muted-foreground",
    value: "text-blue-700",
  },
  top: {
    bar: "bg-violet-500",
    label: "text-muted-foreground",
    value: "text-violet-700",
  },
};

const PRODUCT_BAR_STYLES: Record<
  ProductSnapshotMetricId,
  { bar: string; label: string; value: string }
> = {
  ordered: {
    bar: "bg-green-500",
    label: "text-muted-foreground",
    value: "text-green-700",
  },
  liked: {
    bar: "bg-rose-500",
    label: "text-muted-foreground",
    value: "text-rose-700",
  },
  visited: {
    bar: "bg-blue-500",
    label: "text-muted-foreground",
    value: "text-blue-700",
  },
  favorited: {
    bar: "bg-violet-500",
    label: "text-muted-foreground",
    value: "text-violet-700",
  },
};

function RevenueExpenseBars({
  revenue,
  expenses,
}: {
  revenue: number;
  expenses: number;
}) {
  const maxValue = Math.max(revenue, expenses, 1);
  const revenueWidth = (revenue / maxValue) * 100;
  const expenseWidth = (expenses / maxValue) * 100;

  return (
    <div className="mt-3 space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Revenue</span>
          <span className="font-medium text-green-700">{formatCurrency(revenue)}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${revenueWidth}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Expenses</span>
          <span className="font-medium text-amber-700">{formatCurrency(expenses)}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${expenseWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function CustomerSegmentBars({
  segmentCounts,
}: {
  segmentCounts: NonNullable<DashboardStats["customerSegmentCounts"]>;
}) {
  const maxValue = Math.max(
    segmentCounts.completed,
    segmentCounts.pending,
    segmentCounts.visitor,
    segmentCounts.top,
    1,
  );

  const barSegments = [...CUSTOMER_SEGMENTS, TOP_CUSTOMERS_CARD];

  return (
    <div className="mt-3 space-y-3">
      {barSegments.map((segment) => {
        const count = segmentCounts[segment.id as keyof typeof segmentCounts];
        const width = (count / maxValue) * 100;
        const styles = SEGMENT_BAR_STYLES[segment.id as CustomerSegmentId | "top"];

        return (
          <div key={segment.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={cn("font-medium", styles.label)}>{segment.shortLabel}</span>
              <span className={cn("font-medium", styles.value)}>{count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", styles.bar)}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProductSnapshotBars({
  metrics,
}: {
  metrics: NonNullable<DashboardStats["productSnapshot"]>["metrics"];
}) {
  const maxValue = Math.max(...metrics.map((metric) => metric.total), 1);

  return (
    <div className="mt-3 space-y-3">
      {PRODUCT_SNAPSHOT_METRICS.map((definition) => {
        const metric = metrics.find((entry) => entry.id === definition.id);
        const total = metric?.total ?? 0;
        const width = (total / maxValue) * 100;
        const styles = PRODUCT_BAR_STYLES[definition.id];

        return (
          <div key={definition.id} className="space-y-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", styles.label)}>{definition.shortLabel}</span>
                <span className={cn("font-medium", styles.value)}>{total}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", styles.bar)}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
            {metric?.topProductName && metric.topCount > 0 ? (
              <p className="truncate text-[11px] text-muted-foreground" title={metric.topProductName}>
                Top: {metric.topProductName} ({metric.topCount})
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function BusinessHealthCard({
  stats,
  isLoading,
}: {
  stats?: DashboardStats;
  isLoading: boolean;
}) {
  const status = (stats?.businessHealth ?? "break_even") as BusinessHealthStatus;
  const styles = getBusinessHealthStyles(status);
  const netProfit = stats?.netProfit ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalExpenses = stats?.totalExpenses ?? 0;

  return (
    <Link href="/vendor/revenue" className="group block">
      <Card className={cn("h-full transition-colors", styles.card)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
            {vendorDashboardStatLabels.businessHealth}
          </CardTitle>
          <CardDescription className="text-xs">
            {vendorDashboardStatLabels.businessHealthDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-full" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className={cn("h-5 w-5", styles.icon)} />
                <p className={cn("text-2xl font-semibold", styles.value)}>
                  {stats?.businessHealthLabel ?? "Break even"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Net: {formatCurrency(netProfit)}
              </p>
              <RevenueExpenseBars revenue={totalRevenue} expenses={totalExpenses} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function MyCustomersCard({
  stats,
  isLoading,
}: {
  stats?: DashboardStats;
  isLoading: boolean;
}) {
  const totalCustomers = stats?.totalCustomers ?? 0;
  const segmentCounts = stats?.customerSegmentCounts ?? {
    all: 0,
    visitor: 0,
    completed: 0,
    pending: 0,
    top: 0,
  };

  return (
    <Link href="/vendor/customers" className="group block">
      <Card
        className={cn(
          "h-full transition-colors",
          "border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50",
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
            {vendorDashboardStatLabels.customers}
          </CardTitle>
          <CardDescription className="text-xs">
            {vendorDashboardStatLabels.customersDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-full" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <p className="text-2xl font-semibold text-blue-700">{totalCustomers}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {vendorDashboardStatLabels.customersTotal}
              </p>
              <CustomerSegmentBars segmentCounts={segmentCounts} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function MyProductSnapshotCard({
  stats,
  isLoading,
}: {
  stats?: DashboardStats;
  isLoading: boolean;
}) {
  const snapshot = stats?.productSnapshot;
  const totalProducts = snapshot?.totalProducts ?? stats?.totalProducts ?? 0;
  const metrics = snapshot?.metrics ?? [];

  return (
    <Link href="/vendor/products/snapshot?period=month&metric=ordered" className="group block">
      <Card
        className={cn(
          "h-full transition-colors",
          "border-orange-200 bg-orange-50/50 hover:border-orange-300 hover:bg-orange-50",
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
            {vendorDashboardStatLabels.productSnapshot}
          </CardTitle>
          <CardDescription className="text-xs">
            {vendorDashboardStatLabels.productSnapshotDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-full" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                <p className="text-2xl font-semibold text-orange-700">{totalProducts}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {vendorDashboardStatLabels.productSnapshotTotal}
              </p>
              <ProductSnapshotBars metrics={metrics} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function AnalyticsTodayBars({
  analyticsToday,
}: {
  analyticsToday: NonNullable<DashboardStats["analyticsToday"]>;
}) {
  const rows = [
    { label: "Orders", value: analyticsToday.orders, bar: "bg-teal-500", text: "text-teal-700" },
    { label: "Likes", value: analyticsToday.likes, bar: "bg-rose-500", text: "text-rose-700" },
    {
      label: "Potential",
      value: analyticsToday.potentialCustomers,
      bar: "bg-blue-500",
      text: "text-blue-700",
    },
    {
      label: "Open",
      value: analyticsToday.openOrders,
      bar: "bg-amber-500",
      text: "text-amber-700",
    },
    {
      label: "Completed",
      value: analyticsToday.completedOrders,
      bar: "bg-green-500",
      text: "text-green-700",
    },
    {
      label: "Awaiting payment",
      value: analyticsToday.awaitingPayment,
      bar: "bg-violet-500",
      text: "text-violet-700",
    },
  ];
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="mt-3 space-y-3">
      {rows.map((row) => {
        const width = (row.value / maxValue) * 100;

        return (
          <div key={row.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">{row.label}</span>
              <span className={cn("font-medium", row.text)}>{row.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", row.bar)}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MyAnalyticsCard({
  stats,
  isLoading,
}: {
  stats?: DashboardStats;
  isLoading: boolean;
}) {
  const analyticsToday = stats?.analyticsToday ?? {
    orders: 0,
    likes: 0,
    potentialCustomers: 0,
    openOrders: 0,
    completedOrders: 0,
    awaitingPayment: 0,
    businessHealthLabel: "Break even",
    netProfit: 0,
  };

  return (
    <Link href="/vendor/analytics" className="group block">
      <Card
        className={cn(
          "h-full transition-colors",
          "border-teal-200 bg-teal-50/50 hover:border-teal-300 hover:bg-teal-50",
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
            {vendorDashboardStatLabels.analytics}
          </CardTitle>
          <CardDescription className="text-xs">
            {vendorDashboardStatLabels.analyticsDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-full" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-600" />
                <p className="text-2xl font-semibold text-teal-700">
                  {analyticsToday.businessHealthLabel}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {vendorDashboardStatLabels.analyticsToday} · Net {formatCurrency(analyticsToday.netProfit)}
              </p>
              <AnalyticsTodayBars analyticsToday={analyticsToday} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function StatsCards() {
  const { data: stats, isLoading } = trpc.vendor.dashboard.stats.useQuery();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <BusinessHealthCard stats={stats} isLoading={isLoading} />
      <MyCustomersCard stats={stats} isLoading={isLoading} />
      <MyProductSnapshotCard stats={stats} isLoading={isLoading} />
      <MyAnalyticsCard stats={stats} isLoading={isLoading} />
    </div>
  );
}
