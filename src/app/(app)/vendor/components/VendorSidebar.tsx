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
} from "lucide-react";

const navItems = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
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
    <aside className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col h-screen">
      {/* Logo/Brand Section */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/vendor/dashboard" className="flex items-center gap-2">
          <Store className="h-6 w-6 text-gray-700" />
          <span className="font-semibold text-gray-900">Vendor Portal</span>
        </Link>
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
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  {"description" in item && item.description && (
                    <span className="text-[11px] text-gray-500">
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
