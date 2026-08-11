"use client";

import { ImageIcon } from "lucide-react";

import { VendorHappyBannerPageClient } from "@/app/(app)/vendor/hero-banner/components/VendorHappyBannerPageClient";
import { HeroBannerForm } from "@/app/(app)/vendor/hero-banner/components/HeroBannerForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";

export function StoreAppearanceBannersPanel() {
  const { data: banners, isLoading } = trpc.vendor.heroBanners.list.useQuery();
  const primaryBanner = banners?.[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Step 4 · Banners
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Promotional and hero banners are independent of your layout and color style.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Happy Banner (promo strip)</h2>
        </div>
        <VendorHappyBannerPageClient embedded />
      </section>

      <Separator />

      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h2 className="text-sm font-semibold">Hero Banner (top carousel)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Headline, background image, and featured products at the top of your store.
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : primaryBanner ? (
          <div className="space-y-3">
            <p className="text-sm">
              Editing: <span className="font-medium">{primaryBanner.title}</span>
            </p>
            <HeroBannerForm banner={primaryBanner} />
            {banners && banners.length > 1 ? (
              <p className="text-xs text-muted-foreground">
                You have {banners.length} hero banners — the first is shown above.
              </p>
            ) : null}
          </div>
        ) : (
          <HeroBannerForm />
        )}
      </section>
    </div>
  );
}
