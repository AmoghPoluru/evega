"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseAsString, useQueryStates } from "nuqs";
import { ArrowLeft, Search, X } from "lucide-react";

import { trpc } from "@/trpc/client";
import { vendorDashboardStatLabels, vendorPageTitles } from "@/lib/vendor-portal-labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PRODUCT_SNAPSHOT_METRICS,
  PRODUCT_SNAPSHOT_PERIODS,
  type ProductSnapshotMetricId,
  type ProductSnapshotPeriod,
} from "@/lib/vendor-dashboard/product-snapshot";
import {
  ProductSnapshotTable,
} from "./components/ProductSnapshotTable";

export default function VendorProductSnapshotPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [queryState, setQueryState] = useQueryStates({
    period: parseAsString.withDefault("month"),
    metric: parseAsString.withDefault("ordered"),
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const period = queryState.period as ProductSnapshotPeriod;
  const metric = queryState.metric as ProductSnapshotMetricId;

  const { data, isLoading, error } = trpc.vendor.products.snapshot.useQuery({
    period,
    metric,
    search: debouncedSearch || undefined,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link href="/vendor/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendorPageTitles.productSnapshot}</h1>
            <p className="mt-1 text-gray-600">
              {vendorDashboardStatLabels.productSnapshotDescription}
            </p>
            {data?.periodLabel ? (
              <p className="mt-1 text-sm text-muted-foreground">Showing data for {data.periodLabel}</p>
            ) : null}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/vendor/products">Manage products</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRODUCT_SNAPSHOT_PERIODS.map((item) => {
          const isActive = period === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              variant={isActive ? "default" : "outline"}
              onClick={() => setQueryState({ period: item.id })}
            >
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PRODUCT_SNAPSHOT_METRICS.map((item) => {
          const isActive = metric === item.id;
          const count =
            item.id === "ordered"
              ? data?.summary.sold
              : item.id === "liked"
                ? data?.summary.liked
                : item.id === "visited"
                  ? data?.summary.visited
                  : data?.summary.favorited;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setQueryState({ metric: item.id })}
              className="text-left"
            >
              <Card className={isActive ? "border-primary shadow-sm" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <p className="text-2xl font-semibold">{count ?? 0}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="pl-10"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          ) : null}
        </div>
        {(search || period !== "month" || metric !== "ordered") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setQueryState({ period: "month", metric: "ordered" });
            }}
          >
            Reset filters
          </Button>
        )}
      </div>

      {error ? (
        <Card>
          <CardContent className="py-8 text-center text-red-600">{error.message}</CardContent>
        </Card>
      ) : (
        <ProductSnapshotTable rows={data?.rows ?? []} metric={metric} isLoading={isLoading} />
      )}
    </div>
  );
}
