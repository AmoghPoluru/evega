"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

import { VendorHappyBannerPageClient } from "@/app/(app)/vendor/hero-banner/components/VendorHappyBannerPageClient";
import { HeroBannerForm } from "@/app/(app)/vendor/hero-banner/components/HeroBannerForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";

export function StoreAppearanceBannersPanel() {
  const { data: banners, isLoading } = trpc.vendor.heroBanners.list.useQuery();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const selected =
    banners?.find((banner) => banner.id === editingId) ?? banners?.[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Step 4 · Banners
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Promotional and hero banners are independent of your layout and color
          style. Only the banners you keep in this tab appear on your store.
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
            Headline, background image, and featured products at the top of your
            store.
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : creating || !selected ? (
          <HeroBannerForm
            onSuccess={() => setCreating(false)}
            onCancel={banners && banners.length > 0 ? () => setCreating(false) : undefined}
          />
        ) : (
          <div className="space-y-3">
            {banners && banners.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {banners.map((banner) => (
                  <Button
                    key={banner.id}
                    type="button"
                    size="sm"
                    variant={banner.id === selected.id ? "secondary" : "outline"}
                    onClick={() => setEditingId(banner.id)}
                  >
                    {banner.title || "Untitled banner"}
                    {banner.isActive === false ? " (hidden)" : ""}
                  </Button>
                ))}
              </div>
            ) : null}
            <p className="text-sm">
              Editing: <span className="font-medium">{selected.title}</span>
            </p>
            <HeroBannerForm
              key={selected.id}
              banner={selected}
              onSuccess={() => setEditingId(null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreating(true)}
            >
              Add another hero banner
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
