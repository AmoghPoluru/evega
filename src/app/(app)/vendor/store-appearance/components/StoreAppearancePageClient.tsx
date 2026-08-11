"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { VendorLogoTemplateClient } from "@/app/(app)/vendor/settings/components/VendorLogoTemplateClient";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import { VendorStorefrontLayoutPicker } from "./VendorStorefrontLayoutPicker";
import { StoreAppearancePreview } from "./StoreAppearancePreview";
import { StoreAppearanceStylePanel } from "./StoreAppearanceStylePanel";
import { StoreAppearanceBannersPanel } from "./StoreAppearanceBannersPanel";
import { StoreAppearanceSectionsPanel } from "./StoreAppearanceSectionsPanel";
import {
  resolveStoreAppearanceTab,
  StoreAppearanceStepNav,
  type StoreAppearanceTabValue,
} from "./StoreAppearanceSlantedTabList";

export function StoreAppearancePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<StoreAppearanceTabValue>(() =>
    resolveStoreAppearanceTab(tabParam),
  );

  useEffect(() => {
    const resolved = resolveStoreAppearanceTab(tabParam);
    if (tabParam !== resolved) {
      router.replace(`/vendor/store-appearance?started=1&tab=${resolved}`, { scroll: false });
      return;
    }
    setActiveTab(resolved);
  }, [tabParam, router]);

  const handleTabChange = (value: string) => {
    const resolved = resolveStoreAppearanceTab(value);
    setActiveTab(resolved);
    router.replace(`/vendor/store-appearance?started=1&tab=${resolved}`, { scroll: false });
  };

  const handlePreviewRefresh = useCallback(() => {
    // Preview iframe refresh is handled inside StoreAppearancePreview via invalidation hooks
  }, []);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col p-6">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold text-foreground">{vendorPageTitles.storeAppearance}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Design your storefront — pick a shape, make it yours, then add logo and banners.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <StoreAppearanceStepNav orientation="horizontal" />

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
          <div className="min-h-0 w-full flex-1 overflow-y-auto lg:max-w-[min(420px,40%)] lg:border-r lg:pr-6">
            <TabsContent value="logo" className="mt-0">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Step 1 · Logo
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a monogram design or upload your own logo.
                </p>
              </div>
              <VendorLogoTemplateClient embedded />
            </TabsContent>

            <TabsContent value="layout" className="mt-0">
              <VendorStorefrontLayoutPicker embedded onLayoutSelected={handlePreviewRefresh} />
            </TabsContent>

            <TabsContent value="style" className="mt-0">
              <StoreAppearanceStylePanel onSaved={handlePreviewRefresh} />
            </TabsContent>

            <TabsContent value="banners" className="mt-0">
              <StoreAppearanceBannersPanel />
            </TabsContent>

            <TabsContent value="sections" className="mt-0">
              <StoreAppearanceSectionsPanel onSaved={handlePreviewRefresh} />
            </TabsContent>
          </div>

          <div className="sticky top-4 flex min-h-[480px] min-w-0 flex-1 flex-col self-start lg:min-h-[calc(100dvh-12rem)]">
            <StoreAppearancePreview compact />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
