"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  MessageCircle,
  Palette,
  Folder,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import { GoShoppingButton } from "@/components/go-shopping-button";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const standaloneItem: NavItem = {
  href: "/vendor/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
};

const navGroups: NavGroup[] = [
  {
    label: "Sales",
    items: [{ href: "/vendor/customers", label: "Customers", icon: Users }],
  },
  {
    label: "Inventory",
    items: [
      { href: "/vendor/products", label: "Products", icon: Package },
      { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Your Store Appearance",
    items: [
      {
        href: "/vendor/store-appearance",
        label: "Choose your store appearance",
        description: "Template, Happy Banner, and storefront preview",
        icon: Palette,
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        href: "/vendor/tasks",
        label: "Contact & chat with BDO",
        description:
          "Create tasks and offline messages for your Business Development Officer",
        icon: MessageCircle,
      },
    ],
  },
  {
    label: "AI",
    items: [{ href: "/vendor/analytics", label: "Analytics", icon: BarChart3 }],
  },
  {
    label: "Account",
    items: [
      { href: "/vendor/payouts", label: "Payouts", icon: CreditCard },
      { href: "/vendor/notifications", label: "Notifications", icon: Bell },
      { href: "/vendor/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function VendorSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

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
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <div className="flex flex-col">
          <span>{item.label}</span>
          {item.description && (
            <span className="text-[11px] text-muted-foreground">
              {item.description}
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Logo/Brand Section */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/vendor/dashboard" className="flex items-center gap-2">
          <Store className="h-6 w-6 text-sidebar-foreground" />
          <span className="font-semibold text-sidebar-foreground">Vendor Portal</span>
        </Link>
      </div>

      {/* Prominent Go Shopping Button */}
      <div className="p-4 border-b border-sidebar-border">
        <GoShoppingButton className="w-full" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">{renderItem(standaloneItem)}</div>

        {navGroups.map((group) => {
          const isCollapsed = collapsed[group.label];
          return (
            <div key={group.label} className="mt-4">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                aria-expanded={!isCollapsed}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                <Folder className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronUp
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isCollapsed && "rotate-180"
                  )}
                />
              </button>
              {!isCollapsed && (
                <div className="mt-1 space-y-1 pl-3">
                  {group.items.map(renderItem)}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
