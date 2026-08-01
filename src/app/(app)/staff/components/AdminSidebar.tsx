"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  Users,
  Shield,
  ExternalLink,
  Megaphone,
  UserPlus,
  UserCog,
  Store,
} from "lucide-react";

function isNavItemActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navItems = [
  { href: "/staff/vendors", label: "Vendors", icon: Store },
  { href: "/staff/digital-marketing", label: "Digital Marketing", icon: Megaphone },
  { href: "/staff/potential-vendors", label: "Potential Vendors", icon: UserPlus },
  { href: "/staff/products", label: "Products", icon: Package },
  { href: "/staff/orders", label: "Orders", icon: ShoppingCart },
  { href: "/staff/customers", label: "Customers", icon: Users },
  { href: "/staff/users", label: "Users", icon: UserCog },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-700 bg-gray-900 text-gray-100">
      <div className="border-b border-gray-700 p-4">
        <Link href="/staff/digital-marketing" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-400" />
          <span className="font-semibold text-white">Admin Console</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname ? isNavItemActive(item.href, pathname) : false;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-700 p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          View storefront
        </Link>
      </div>
    </aside>
  );
}
