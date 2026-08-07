"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Palette, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VendorTemplatesPicker } from "@/app/(app)/vendor/templates/components/VendorTemplatesPicker";
import { VendorHappyBannerPageClient } from "@/app/(app)/vendor/hero-banner/components/VendorHappyBannerPageClient";
import { cn } from "@/lib/utils";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import { StoreAppearancePreview } from "./StoreAppearancePreview";

const TAB_VALUES = ["template", "banner", "preview"] as const;
type TabValue = (typeof TAB_VALUES)[number];

const appearanceTabClass =
  "h-auto whitespace-normal px-2 py-2 text-center text-xs font-medium text-white shadow-sm sm:text-sm dark:text-white";

function isTabValue(value: string | null): value is TabValue {
  return TAB_VALUES.includes(value as TabValue);
}

export function StoreAppearancePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const startedParam = searchParams.get("started") === "1";

  const [started, setStarted] = useState(startedParam);
  const [activeTab, setActiveTab] = useState<TabValue>(
    isTabValue(tabParam) ? tabParam : "template",
  );

  useEffect(() => {
    if (isTabValue(tabParam)) {
      setActiveTab(tabParam);
      setStarted(true);
    }
  }, [tabParam]);

  const openAppearance = (tab: TabValue = "template") => {
    setStarted(true);
    setActiveTab(tab);
    router.replace(`/vendor/store-appearance?started=1&tab=${tab}`, { scroll: false });
  };

  const handleTabChange = (value: string) => {
    if (!isTabValue(value)) return;
    setActiveTab(value);
    router.replace(`/vendor/store-appearance?started=1&tab=${value}`, { scroll: false });
  };

  if (!started) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{vendorPageTitles.storeAppearance}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure your storefront template, promotional banner, and preview your live store.
          </p>
        </div>
        <Card className="max-w-2xl border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Palette className="h-5 w-5 text-primary" />
            Choose your store appearance
          </CardTitle>
          <CardDescription>
            Set up how your storefront looks — pick a template, add a Happy Banner, then preview
            your live store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" onClick={() => openAppearance("template")}>
            <Sparkles className="mr-2 h-4 w-4" />
            Get started
          </Button>
        </CardContent>
      </Card>
      </div>
    );
  }

  return (
    <div className={activeTab === "preview" ? "px-6 pb-4 pt-4" : "p-6"}>
      {activeTab !== "preview" ? (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{vendorPageTitles.storeAppearance}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure your storefront template, promotional banner, and preview your live store.
          </p>
        </div>
      ) : null}

    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid h-auto w-full max-w-4xl grid-cols-3 gap-2 bg-transparent p-0">
        <TabsTrigger
          value="template"
          className={cn(
            appearanceTabClass,
            "bg-red-600 hover:bg-red-700 data-[state=active]:!bg-red-700 data-[state=active]:!text-white data-[state=active]:shadow-md dark:data-[state=active]:!bg-red-700 dark:data-[state=active]:!text-white",
          )}
        >
          Choose Theme for Your site
        </TabsTrigger>
        <TabsTrigger
          value="banner"
          className={cn(
            appearanceTabClass,
            "bg-green-600 hover:bg-green-700 data-[state=active]:!bg-green-700 data-[state=active]:!text-white data-[state=active]:shadow-md dark:data-[state=active]:!bg-green-700 dark:data-[state=active]:!text-white",
          )}
        >
          Choose Banner for your site
        </TabsTrigger>
        <TabsTrigger
          value="preview"
          className={cn(
            appearanceTabClass,
            "bg-blue-600 hover:bg-blue-700 data-[state=active]:!bg-blue-700 data-[state=active]:!text-white data-[state=active]:shadow-md dark:data-[state=active]:!bg-blue-700 dark:data-[state=active]:!text-white",
          )}
        >
          Preview your site
        </TabsTrigger>
      </TabsList>

      <TabsContent value="template" className="mt-0">
        <VendorTemplatesPicker embedded />
      </TabsContent>

      <TabsContent value="banner" className="mt-0">
        <VendorHappyBannerPageClient embedded />
      </TabsContent>

      <TabsContent value="preview" className="mt-0 flex min-h-0 flex-col">
        <StoreAppearancePreview />
      </TabsContent>
    </Tabs>
    </div>
  );
}
