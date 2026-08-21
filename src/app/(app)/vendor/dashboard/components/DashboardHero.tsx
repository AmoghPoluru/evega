"use client";

import Link from "next/link";
import { PackagePlus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTimeOfDayGreeting } from "@/lib/vendor-greeting";
import { ProductAiImportDialog } from "@/app/(app)/vendor/products/components/ProductAiImportDialog";
import { trpc } from "@/trpc/client";

type DashboardHeroProps = {
  vendorName: string;
};

/**
 * First viewport: greeting + one clear next action.
 */
export function DashboardHero({ vendorName }: DashboardHeroProps) {
  const greeting = getTimeOfDayGreeting();
  const { data: stats, isLoading } = trpc.vendor.dashboard.stats.useQuery();
  const productCount = stats?.totalProducts ?? 0;
  const isNew = productCount < 3;

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting}, {vendorName}
        </h1>
        {isLoading ? (
          <Skeleton className="h-4 w-64" />
        ) : (
          <p className="text-sm text-muted-foreground">
            {isNew
              ? "Start with a product — customers can only buy what you list."
              : "Here’s what needs your attention today."}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Button asChild size="lg" className="font-semibold">
          <Link href="/vendor/products/new">
            <PackagePlus className="h-4 w-4" />
            {isNew ? "Add your first product" : "Add a product"}
          </Link>
        </Button>
        <ProductAiImportDialog
          trigger={
            <Button type="button" variant="outline" size="lg">
              <Sparkles className="h-4 w-4" />
              Import with AI
            </Button>
          }
        />
      </div>
    </div>
  );
}
