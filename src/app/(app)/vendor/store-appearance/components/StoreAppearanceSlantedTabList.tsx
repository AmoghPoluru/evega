"use client";

import type { LucideIcon } from "lucide-react";
import {
  ImageIcon,
  LayoutGrid,
  Layers,
  Palette,
  Sparkles,
} from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const STORE_APPEARANCE_TAB_VALUES = [
  "logo",
  "layout",
  "style",
  "banners",
  "sections",
] as const;

export type StoreAppearanceTabValue = (typeof STORE_APPEARANCE_TAB_VALUES)[number];

/** Legacy tab query values from the previous store appearance IA. */
const LEGACY_TAB_MAP: Record<string, StoreAppearanceTabValue> = {
  template: "style",
  banner: "banners",
  preview: "layout",
};

type StoreAppearanceTabDefinition = {
  value: StoreAppearanceTabValue;
  label: string;
  step: number;
  icon: LucideIcon;
};

export const STORE_APPEARANCE_TABS: StoreAppearanceTabDefinition[] = [
  { value: "logo", label: "Logo", step: 1, icon: Sparkles },
  { value: "layout", label: "Layout", step: 2, icon: LayoutGrid },
  { value: "style", label: "Style", step: 3, icon: Palette },
  { value: "banners", label: "Banners", step: 4, icon: ImageIcon },
  { value: "sections", label: "Sections", step: 5, icon: Layers },
];

export function isStoreAppearanceTabValue(value: string | null): value is StoreAppearanceTabValue {
  return STORE_APPEARANCE_TAB_VALUES.includes(value as StoreAppearanceTabValue);
}

export function resolveStoreAppearanceTab(value: string | null): StoreAppearanceTabValue {
  if (isStoreAppearanceTabValue(value)) return value;
  if (value && value in LEGACY_TAB_MAP) return LEGACY_TAB_MAP[value]!;
  return "logo";
}

const tabTriggerClass =
  "group/tab relative z-[1] flex flex-none items-center gap-2 border-0 bg-transparent px-4 pb-3 pt-2.5 " +
  "text-sm font-medium shadow-none transition-colors " +
  "mr-[-0.55rem] last:mr-0 " +
  "text-emerald-900 hover:z-[2] " +
  "data-[state=active]:z-10 data-[state=active]:text-white " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 after:hidden";

type StoreAppearanceStepNavProps = {
  orientation?: "horizontal" | "vertical";
};

export function StoreAppearanceStepNav({ orientation = "horizontal" }: StoreAppearanceStepNavProps) {
  return (
    <div className={orientation === "horizontal" ? "border-b border-gray-300 pb-0" : "space-y-1"}>
      <TabsList
        aria-label="Store appearance steps"
        variant="line"
        className={
          orientation === "horizontal"
            ? "mx-auto flex h-auto w-fit max-w-full flex-wrap items-end justify-center gap-y-2 rounded-none bg-transparent p-0"
            : "flex h-auto w-full flex-col items-stretch rounded-none bg-transparent p-0"
        }
      >
        {STORE_APPEARANCE_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={
                orientation === "vertical"
                  ? "relative flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left text-sm data-[state=active]:border-primary/30 data-[state=active]:bg-primary/5"
                  : tabTriggerClass
              }
            >
              {orientation === "horizontal" ? (
                <span aria-hidden className="store-appearance-slanted-tab-bg pointer-events-none" />
              ) : null}
              <Icon className="relative z-[1] size-4 shrink-0" strokeWidth={2.25} />
              <span className="relative z-[1] whitespace-nowrap">
                {orientation === "vertical" ? `${tab.step}. ${tab.label}` : tab.label}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}

/** @deprecated Use StoreAppearanceStepNav */
export function StoreAppearanceSlantedTabList() {
  return <StoreAppearanceStepNav orientation="horizontal" />;
}
