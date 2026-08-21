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
import { Button } from "@/components/ui/button";
import { Palette, ShoppingCart } from "lucide-react";

function useSetupComplete() {
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

  const complete = hasLogo && hasProduct && stripeConnected && hasMarketingSetup;

  return { isLoading, complete };
}

/**
 * Secondary shortcuts — only after setup so they don’t compete with the checklist.
 */
export function QuickActionsCard() {
  const { isLoading, complete } = useSetupComplete();

  if (isLoading || !complete) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shortcuts</CardTitle>
        <CardDescription>Useful links while you run your store</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button
          variant="outline"
          className="h-auto w-full justify-start gap-3 px-3 py-3"
          asChild
        >
          <Link href="/vendor/orders">
            <ShoppingCart className="h-5 w-5 shrink-0 text-primary" />
            <span className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">View orders</span>
              <span className="text-xs font-normal text-muted-foreground">
                Fulfill customer purchases
              </span>
            </span>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-auto w-full justify-start gap-3 px-3 py-3"
          asChild
        >
          <Link href="/vendor/store-appearance?started=1&tab=logo">
            <Palette className="h-5 w-5 shrink-0 text-primary" />
            <span className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">Customize store look</span>
              <span className="text-xs font-normal text-muted-foreground">
                Theme, banner, and preview
              </span>
            </span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
