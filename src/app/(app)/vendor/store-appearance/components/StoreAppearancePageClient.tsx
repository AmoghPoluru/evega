"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { VendorTemplatesPicker } from "@/app/(app)/vendor/templates/components/VendorTemplatesPicker";
import { VendorHappyBannerPageClient } from "@/app/(app)/vendor/hero-banner/components/VendorHappyBannerPageClient";
import { VendorLogoTemplateClient } from "@/app/(app)/vendor/settings/components/VendorLogoTemplateClient";
import { cn } from "@/lib/utils";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import { StoreAppearancePreview } from "./StoreAppearancePreview";

const TAB_VALUES = ["template", "banner", "logo", "preview"] as const;
type TabValue = (typeof TAB_VALUES)[number];

const APPEARANCE_TABS = [
  {
    value: "template" as const,
    label: "Choose Theme for Your site",
    bg: "#dc2626",
    border: "#991b1b",
  },
  {
    value: "banner" as const,
    label: "Choose Banner for your site",
    bg: "#16a34a",
    border: "#166534",
  },
  {
    value: "logo" as const,
    label: "Choose logo for your site",
    bg: "#ea580c",
    border: "#9a3412",
  },
  {
    value: "preview" as const,
    label: "Preview your site",
    bg: "#2563eb",
    border: "#1e40af",
  },
] as const;

/** Shared tab shape — same height/border for active and inactive (no “pressed down” shift). */
const appearanceTabBase =
  "min-h-[3.25rem] h-auto w-full rounded-lg border-2 px-3 py-2.5 text-center text-xs font-semibold leading-snug text-white sm:text-sm " +
  "shadow-none transition-[opacity,box-shadow] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function isTabValue(value: string | null): value is TabValue {
  return TAB_VALUES.includes(value as TabValue);
}

export function StoreAppearancePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<TabValue>(
    isTabValue(tabParam) ? tabParam : "template",
  );

  useEffect(() => {
    if (!isTabValue(tabParam)) {
      router.replace("/vendor/store-appearance?started=1&tab=template", { scroll: false });
      return;
    }
    setActiveTab(tabParam);
  }, [tabParam, router]);

  const handleTabChange = (value: string) => {
    if (!isTabValue(value)) return;
    setActiveTab(value);
    router.replace(`/vendor/store-appearance?started=1&tab=${value}`, { scroll: false });
  };

  return (
    <div className={activeTab === "preview" ? "px-6 pb-4 pt-4" : "p-6"}>
      {activeTab !== "preview" ? (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">{vendorPageTitles.storeAppearance}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your storefront template, logo, promotional banner, and preview your live store.
          </p>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        {/* Custom nav — avoid TabsList default h-9/inline-flex styles hiding the logo tab */}
        <div
          role="tablist"
          aria-label="Store appearance steps"
          className="grid w-full grid-cols-2 gap-3 md:grid-cols-4"
        >
          {APPEARANCE_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.value)}
                style={{
                  backgroundColor: tab.bg,
                  borderColor: isActive ? "#ffffff" : tab.border,
                }}
                className={cn(
                  appearanceTabBase,
                  isActive ? "opacity-100 ring-2 ring-white" : "opacity-80 hover:opacity-95",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <TabsContent value="template" className="mt-0">
          <VendorTemplatesPicker embedded />
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
