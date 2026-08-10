"use client";

import type { LucideIcon } from "lucide-react";
import {
  Eye,
  ImageIcon,
  LayoutGrid,
  Palette,
  Sparkles,
} from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const STORE_APPEARANCE_TAB_VALUES = [
  "template",
  "layout",
  "banner",
  "logo",
  "preview",
] as const;

export type StoreAppearanceTabValue = (typeof STORE_APPEARANCE_TAB_VALUES)[number];

type StoreAppearanceTabDefinition = {
  value: StoreAppearanceTabValue;
  label: string;
  icon: LucideIcon;
};

export const STORE_APPEARANCE_TABS: StoreAppearanceTabDefinition[] = [
  { value: "template", label: "Choose Theme", icon: Palette },
  { value: "layout", label: "Choose Layout", icon: LayoutGrid },
  { value: "banner", label: "Choose Banner", icon: ImageIcon },
  { value: "logo", label: "Choose Icon", icon: Sparkles },
  { value: "preview", label: "Preview", icon: Eye },
];

export function isStoreAppearanceTabValue(value: string | null): value is StoreAppearanceTabValue {
  return STORE_APPEARANCE_TAB_VALUES.includes(value as StoreAppearanceTabValue);
}

const tabTriggerClass =
  "group/tab relative z-[1] flex flex-none items-center gap-2 border-0 bg-transparent px-4 pb-3 pt-2.5 " +
  "text-sm font-medium shadow-none transition-colors " +
  "mr-[-0.55rem] last:mr-0 " +
  "text-emerald-900 hover:z-[2] " +
  "data-[state=active]:z-10 data-[state=active]:text-white " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 after:hidden";

export function StoreAppearanceSlantedTabList() {
  return (
    <div className="border-b border-gray-300 pb-0">
      <TabsList
        aria-label="Store appearance steps"
        variant="line"
        className="mx-auto flex h-auto w-fit max-w-full flex-wrap items-end justify-center gap-y-2 rounded-none bg-transparent p-0"
      >
        {STORE_APPEARANCE_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className={tabTriggerClass}>
              <span aria-hidden className="store-appearance-slanted-tab-bg pointer-events-none" />
              <Icon className="relative z-[1] size-4 shrink-0" strokeWidth={2.25} />
              <span className="relative z-[1] whitespace-nowrap">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}
