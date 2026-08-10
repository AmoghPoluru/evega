"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { VendorTemplatesPicker } from "@/app/(app)/vendor/templates/components/VendorTemplatesPicker";
import { VendorHappyBannerPageClient } from "@/app/(app)/vendor/hero-banner/components/VendorHappyBannerPageClient";
import { VendorLogoTemplateClient } from "@/app/(app)/vendor/settings/components/VendorLogoTemplateClient";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import { VendorStorefrontLayoutPicker } from "./VendorStorefrontLayoutPicker";
import { StoreAppearancePreview } from "./StoreAppearancePreview";
import {
  isStoreAppearanceTabValue,
  StoreAppearanceSlantedTabList,
  type StoreAppearanceTabValue,
} from "./StoreAppearanceSlantedTabList";

export function StoreAppearancePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<StoreAppearanceTabValue>(
    isStoreAppearanceTabValue(tabParam) ? tabParam : "template",
  );

  useEffect(() => {
    if (!isStoreAppearanceTabValue(tabParam)) {
      router.replace("/vendor/store-appearance?started=1&tab=template", { scroll: false });
      return;
    }
    setActiveTab(tabParam);
  }, [tabParam, router]);

  const handleTabChange = (value: string) => {
    if (!isStoreAppearanceTabValue(value)) return;
    setActiveTab(value);
    router.replace(`/vendor/store-appearance?started=1&tab=${value}`, { scroll: false });
  };

  return (
    <div className={activeTab === "preview" ? "px-6 pb-4 pt-4" : "p-6"}>
      {activeTab !== "preview" ? (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">{vendorPageTitles.storeAppearance}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your storefront theme, layout, logo, promotional banner, and preview your live store.
          </p>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <StoreAppearanceSlantedTabList />

        <TabsContent value="template" className="mt-0">
          <VendorTemplatesPicker embedded />
        </TabsContent>

        <TabsContent value="layout" className="mt-0">
          <VendorStorefrontLayoutPicker embedded />
        </TabsContent>

        <TabsContent value="banner" className="mt-0">
          <VendorHappyBannerPageClient embedded />
        </TabsContent>

        <TabsContent value="logo" className="mt-0">
          <VendorLogoTemplateClient embedded />
        </TabsContent>

        <TabsContent value="preview" className="mt-0 flex min-h-0 flex-col">
          <StoreAppearancePreview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
