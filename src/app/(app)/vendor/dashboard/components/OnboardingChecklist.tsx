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
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Circle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

type ChecklistItem = {
  id: string;
  label: string;
  href: string;
  completed: boolean;
};

/**
 * Setup path only — shows progress + the next incomplete step (not every row).
 */
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
    stripeStatus?.isReady ||
      stripeStatus?.payoutsEnabled ||
      stripeStatus?.onboardingCompleted,
  );

  const hasMarketingSetup = Boolean(
    profile &&
      (profile.socialChannels.socialInstagram.trim() ||
        profile.socialChannels.socialFacebook.trim() ||
        profile.socialChannels.socialWhatsAppGroup.trim() ||
        profile.marketingChannels.length > 0 ||
        profile.whatsappConfig.businessNumber.trim() ||
        profile.metaConfig.hasPageAccessToken ||
        profile.metaConfig.hasInstagramAccessToken),
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
      label: "Connect payments",
      href: "/vendor/stripe-onboarding",
      completed: stripeConnected,
    },
    {
      id: "marketing",
      label: "Post to Instagram",
      href: "/vendor/connected-channels",
      completed: hasMarketingSetup,
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const allComplete = completedCount === items.length;
  const nextStep = items.find((item) => !item.completed);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (allComplete || !nextStep) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Next step</CardTitle>
        </div>
        <CardDescription>
          {completedCount} of {items.length} setup steps done
        </CardDescription>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link
          href={nextStep.href}
          className={cn(
            "flex items-center gap-3 rounded-md border border-border bg-background px-3 py-3 text-sm transition-colors",
            "hover:border-primary/30 hover:bg-accent/50",
          )}
        >
          <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="flex-1 font-medium">{nextStep.label}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <ul className="space-y-1.5 px-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              {item.completed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Circle className="h-3.5 w-3.5 opacity-40" />
              )}
              <span className={cn(item.completed && "line-through opacity-70")}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={nextStep.href}>Continue setup</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
