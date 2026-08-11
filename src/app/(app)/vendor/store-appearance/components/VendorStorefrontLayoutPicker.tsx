"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { StorefrontLayoutId } from "@/lib/templates/storefront-layouts";
import { cn } from "@/lib/utils";

type VendorStorefrontLayoutPickerProps = {
  embedded?: boolean;
  onLayoutSelected?: () => void;
};

function LayoutWireframe({ layoutId }: { layoutId: StorefrontLayoutId }) {
  const tile = "rounded-sm bg-muted-foreground/25";

  if (layoutId === "runway") {
    return (
      <div className="flex h-28 flex-col gap-2 p-2">
        {[0, 1].map((row) => (
          <div key={row} className="flex flex-1 gap-2">
            <div className={cn(tile, "flex-[1.2]")} />
            <div className={cn(tile, "flex-1 opacity-60")} />
          </div>
        ))}
      </div>
    );
  }

  if (layoutId === "reloop") {
    return (
      <div className="grid h-28 grid-cols-5 gap-1 p-2">
        {Array.from({ length: 15 }).map((_, index) => (
          <div key={index} className={cn(tile, "aspect-square")} />
        ))}
      </div>
    );
  }

  if (layoutId === "emporium") {
    return (
      <div className="flex h-28 flex-col gap-2 p-2">
        <div className="h-3 w-full rounded-sm bg-muted-foreground/15" />
        <div className="grid flex-1 grid-cols-4 gap-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={tile} />
          ))}
        </div>
      </div>
    );
  }

  if (layoutId === "collection") {
    return (
      <div className="grid h-28 grid-cols-4 gap-1.5 p-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={cn(tile, "border border-muted-foreground/30")} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-28 grid-cols-3 gap-1.5 p-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={tile} />
      ))}
    </div>
  );
}

export function VendorStorefrontLayoutPicker({
  embedded = false,
  onLayoutSelected,
}: VendorStorefrontLayoutPickerProps) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.vendor.storefrontLayout.list.useQuery();

  const selectLayout = trpc.vendor.storefrontLayout.select.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.label} layout applied`);
      void utils.vendor.storefrontLayout.list.invalidate();
      onLayoutSelected?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to select layout");
    },
  });

  const clearLayout = trpc.vendor.storefrontLayout.clear.useMutation({
    onSuccess: () => {
      toast.success("Layout reset to classic grid");
      void utils.vendor.storefrontLayout.list.invalidate();
      onLayoutSelected?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset layout");
    },
  });

  const handleSelect = (layoutId: StorefrontLayoutId) => {
    selectLayout.mutate({ layoutId });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">Unable to load storefront layouts.</p>
    );
  }

  return (
    <div className={embedded ? "space-y-4" : "p-6"}>
      {!embedded ? (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Choose Your Layout</h1>
          <p className="mt-1 text-sm text-gray-600">
            Pick how products appear on your storefront. Theme controls colors and fonts separately.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Step 2 · Layout
          </p>
          <p className="text-sm text-muted-foreground">
            Pick your store&apos;s structure. Layout controls product arrangement only — not colors or
            banners.
          </p>
        </div>
      )}

      {!data.usesThemeDefault ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Layout selected</Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={clearLayout.isPending}
            onClick={() => clearLayout.mutate()}
          >
            {clearLayout.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Reset to classic grid
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.docs.map((layout) => {
          const isApplying =
            (selectLayout.isPending && selectLayout.variables?.layoutId === layout.id) ||
            (clearLayout.isPending && layout.isSelected && !data.usesThemeDefault);

          return (
            <Card
              key={layout.id}
              className={cn(
                "overflow-hidden transition-shadow",
                layout.isSelected ? "ring-2 ring-primary" : "hover:shadow-md",
              )}
            >
              <div className="border-b bg-muted/30">
                <LayoutWireframe layoutId={layout.id} />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{layout.label}</CardTitle>
                    <CardDescription className="text-xs">{layout.industryName}</CardDescription>
                  </div>
                  {layout.isSelected ? (
                    <Badge className="shrink-0 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{layout.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{layout.columnsHint}</Badge>
                  <Badge variant="outline">{layout.bestFor}</Badge>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  variant={layout.isSelected ? "secondary" : "default"}
                  disabled={layout.isSelected || selectLayout.isPending || clearLayout.isPending}
                  onClick={() => handleSelect(layout.id)}
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying…
                    </>
                  ) : layout.isSelected ? (
                    "Selected"
                  ) : (
                    "Use this layout"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
