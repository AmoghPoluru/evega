"use client";

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
  Image,
  Palette,
} from "lucide-react";
import { GoShoppingButton } from "@/components/go-shopping-button";

const navItems = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/hero-banner", label: "Hero Banner", icon: Image },
  { href: "/vendor/templates", label: "Templates", icon: Palette },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { href: "/vendor/customers", label: "Customers", icon: Users },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  {
    href: "/vendor/tasks",
    label: "Contact & chat with BDO",
    description: "Create tasks and offline messages for your Business Development Officer",
    icon: MessageCircle,
  },
  { href: "/vendor/payouts", label: "Payouts", icon: CreditCard },
  { href: "/vendor/notifications", label: "Notifications", icon: Bell },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

export function VendorSidebar() {
  const pathname = usePathname();

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
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  {"description" in item && item.description && (
                    <span className="text-[11px] text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
