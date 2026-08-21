"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  vendorNavGroupLabels,
  vendorNavLabels,
  vendorPortalBrandLabel,
  vendorStorefrontHref,
} from "@/lib/vendor-portal-labels";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Store,
  Users,
  CreditCard,
  Bell,
  Palette,
  Receipt,
  DollarSign,
  ChevronUp,
  Share2,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { GoShoppingButton } from "@/components/go-shopping-button";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

const storeAppearanceHref = "/vendor/store-appearance?started=1&tab=logo";

/** Always-visible primary destinations. */
const primaryItems: NavItem[] = [
  {
    href: "/vendor/dashboard",
    label: vendorNavLabels.dashboard,
    icon: LayoutDashboard,
  },
  {
    href: "/vendor/products",
    label: vendorNavLabels.products,
    icon: Package,
  },
  {
    href: "/vendor/orders",
    label: vendorNavLabels.orders,
    icon: ShoppingCart,
  },
];

/** Secondary links, collapsed under More by default. */
const moreItems: NavItem[] = [
  { href: "/vendor/customers", label: vendorNavLabels.customers, icon: Users },
  { href: "/vendor/revenue", label: vendorNavLabels.revenue, icon: DollarSign },
  { href: "/vendor/expenses", label: vendorNavLabels.expenses, icon: Receipt },
  {
    href: storeAppearanceHref,
    label: vendorNavLabels.storeAppearance,
    description: "Theme, banner, and preview",
    icon: Palette,
  },
  { href: "/vendor/analytics", label: vendorNavLabels.analytics, icon: BarChart3 },
  {
    href: "/vendor/stripe-onboarding",
    label: vendorNavLabels.payouts,
    icon: CreditCard,
  },
  {
    href: "/vendor/connected-channels",
    label: vendorNavLabels.connectedChannels,
    icon: Share2,
  },
  {
    href: "/vendor/notifications",
    label: vendorNavLabels.notifications,
    icon: Bell,
  },
  { href: "/vendor/settings", label: vendorNavLabels.settings, icon: Settings },
];

type VendorSidebarProps = {
  vendorSlug?: string | null;
};

export function VendorSidebar({ vendorSlug }: VendorSidebarProps) {
  const pathname = usePathname();
  const storefrontHref = vendorStorefrontHref(vendorSlug);
  const [moreCollapsed, setMoreCollapsed] = useState(true);

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    return pathname === path || pathname.startsWith(path + "/");
  };

  const moreHasActive = moreItems.some((item) => isActive(item.href));
  const isMoreOpen = !moreCollapsed || moreHasActive;

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive(item.href)
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <div className="flex flex-col">
          <span>{item.label}</span>
          {item.description && (
            <span className="text-[11px] text-muted-foreground">{item.description}</span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="space-y-3 border-b border-sidebar-border p-4">
        <Link href={storefrontHref} className="flex items-center gap-2">
          <Store className="h-6 w-6 text-sidebar-foreground" />
          <span className="font-semibold text-sidebar-foreground">
            {vendorPortalBrandLabel}
          </span>
        </Link>
        <Button
          className="w-full bg-violet-600 font-semibold text-white hover:bg-violet-700"
          asChild
        >
          <Link href={storeAppearanceHref}>
            <Palette />
            <span>{vendorNavGroupLabels.store}</span>
          </Link>
        </Button>
        <GoShoppingButton className="w-full" />
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">{primaryItems.map(renderItem)}</div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setMoreCollapsed((prev) => !prev)}
            aria-expanded={isMoreOpen}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 text-left">{vendorNavGroupLabels.more}</span>
            <ChevronUp
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                !isMoreOpen && "rotate-180",
              )}
            />
          </button>
          {isMoreOpen && (
            <div className="mt-1 space-y-1 pl-1">{moreItems.map(renderItem)}</div>
          )}
        </div>
      </nav>
    </aside>
  );
}
