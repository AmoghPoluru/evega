"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

type ChecklistItem = {
  id: string;
  label: string;
  href: string;
  completed: boolean;
};

export function OnboardingChecklist() {
  const { data: stats, isLoading: statsLoading } = trpc.vendor.dashboard.stats.useQuery();
  const { data: profile, isLoading: profileLoading } =
    trpc.vendor.dashboard.getMarketingProfile.useQuery();
  const { data: logoData, isLoading: logoLoading } = trpc.vendor.logoTemplate.get.useQuery();
  const { data: stripeStatus, isLoading: stripeLoading } =
    trpc.vendor.getStripeAccountStatus.useQuery(undefined, { retry: false });

  const isLoading = statsLoading || profileLoading || stripeLoading || logoLoading;

  const hasLogo = Boolean(
    profile?.logoId ||
      (logoData?.logoSource === "template" && logoData?.selectedTemplateId),
  );
  const hasProduct = (stats?.totalProducts ?? 0) > 0;
  const stripeConnected = Boolean(
    stripeStatus?.isReady || stripeStatus?.payoutsEnabled || stripeStatus?.onboardingCompleted
  );

  const hasMarketingSetup = Boolean(
    profile &&
      (profile.socialChannels.socialInstagram.trim() ||
        profile.socialChannels.socialFacebook.trim() ||
        profile.socialChannels.socialWhatsAppGroup.trim() ||
        profile.marketingChannels.length > 0 ||
        profile.whatsappConfig.businessNumber.trim() ||
        profile.metaConfig.hasPageAccessToken ||
        profile.metaConfig.hasInstagramAccessToken)
  );

  const items: ChecklistItem[] = [
    {
      id: "logo",
      label: "Add your store logo",
      href: "/vendor/store-appearance?started=1&tab=logo",
      completed: hasLogo,
    },
    {
      id: "product",
      label: "Add your first product",
      href: "/vendor/products/new",
      completed: hasProduct,
    },
    {
      id: "stripe",
      label: "Connect Stripe for payouts",
      href: "/vendor/stripe-onboarding",
      completed: stripeConnected,
    },
    {
      id: "marketing",
      label: "Set up marketing channels",
      href: "/vendor/connected-channels",
      completed: hasMarketingSetup,
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const allComplete = completedCount === items.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (allComplete) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </div>
        <CardDescription>
          {completedCount} of {items.length} setup steps complete — finish these to launch strong.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
              item.completed
                ? "border-border/60 bg-muted/30 text-muted-foreground"
                : "border-border bg-background hover:border-primary/30 hover:bg-accent/50"
            )}
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
            <span className={cn("font-medium", item.completed && "line-through")}>
              {item.label}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
