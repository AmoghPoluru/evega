"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, Store, X } from "lucide-react";

import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type VendorListItem = inferRouterOutputs<AppRouter>["vendor"]["list"]["vendors"][number];

function VendorCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

function VendorSelectionHeader() {
  return (
    <div className="text-center mb-8 sm:mb-10">
      <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
        Select a Vendor
      </h1>
      <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
        Browse our marketplace vendors and shop their storefronts.
      </p>
    </div>
  );
}

function VendorCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <VendorCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** Suspense fallback: renders the page shell while the vendor list streams in. */
export function VendorSelectionSkeleton() {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-10 sm:py-14">
      <VendorSelectionHeader />
      <VendorCardSkeletonGrid />
    </div>
  );
}

export function VendorSelection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = trpc.vendor.list.useQuery({ limit: 50 });

  const vendors: VendorListItem[] = data?.vendors ?? [];

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;

    const query = searchQuery.toLowerCase();
    return vendors.filter((vendor) => vendor.name.toLowerCase().includes(query));
  }, [vendors, searchQuery]);

  const handleVendorSelect = (vendor: VendorListItem) => {
    setOpen(false);
    setSearchQuery("");
    router.push(`/vendors/${vendor.slug || vendor.id}`);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-10 sm:py-14">
      <VendorSelectionHeader />

      {!isLoading && !error && vendors.length > 0 && (
        <div className="max-w-md mx-auto mb-8">
          <DropdownMenu
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) setSearchQuery("");
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-11 justify-between text-base font-normal"
                aria-label="Search and select a vendor"
              >
                <span className="text-muted-foreground">Search vendors...</span>
                <ChevronDown className="size-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-(--radix-dropdown-menu-trigger-width) max-h-[min(24rem,var(--radix-dropdown-menu-content-available-height))] p-0"
            >
              <div className="p-2 border-b sticky top-0 bg-popover z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-8 pr-8 h-9"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSearchQuery("");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto max-h-64">
                {filteredVendors.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchQuery ? "No vendors found" : "No vendors available"}
                  </div>
                ) : (
                  filteredVendors.map((vendor) => (
                    <DropdownMenuItem
                      key={vendor.id}
                      className="cursor-pointer py-2.5"
                      onSelect={() => handleVendorSelect(vendor)}
                    >
                      {vendor.name}
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {isLoading && <VendorCardSkeletonGrid />}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
          Unable to load vendors. Please try again later.
        </div>
      )}

      {!isLoading && !error && vendors.length === 0 && (
        <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
          <Store className="size-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No vendors available</p>
        </div>
      )}

      {!isLoading && !error && vendors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {vendors.map((vendor) => {
            const { logoUrl, descriptionText } = vendor;
            const href = `/vendors/${vendor.slug || vendor.id}`;

            return (
              <Link key={vendor.id} href={href} className="group block h-full">
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md border-border">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full">
                    <div className="size-16 rounded-full border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`${vendor.name} logo`}
                          className="size-full object-cover"
                        />
                      ) : (
                        <Store className="size-7 text-muted-foreground" />
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                        {vendor.name}
                      </h2>
                      {descriptionText && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {descriptionText}
                        </p>
                      )}
                    </div>

                    <span className="text-sm font-medium text-primary">
                      Visit storefront
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
