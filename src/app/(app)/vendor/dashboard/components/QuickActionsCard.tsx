"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackagePlus, ShoppingCart, Palette, MessageCircle } from "lucide-react";

const actions = [
  {
    label: "Add Product",
    description: "List a new item in your catalog",
    href: "/vendor/products/new",
    icon: PackagePlus,
  },
  {
    label: "View Orders",
    description: "Manage and fulfill customer orders",
    href: "/vendor/orders",
    icon: ShoppingCart,
  },
  {
    label: "Customize my website",
    description: "Theme, banner, and preview",
    href: "/vendor/store-appearance?started=1&tab=template",
    icon: Palette,
  },
  {
    label: "Contact BDO",
    description: "Get help from your business officer",
    href: "/vendor/tasks",
    icon: MessageCircle,
  },
] as const;

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Common tasks to grow and manage your store</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.href}
              variant="outline"
              className="h-auto w-full justify-start gap-3 px-3 py-3"
              asChild
            >
              <Link href={action.href}>
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{action.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
