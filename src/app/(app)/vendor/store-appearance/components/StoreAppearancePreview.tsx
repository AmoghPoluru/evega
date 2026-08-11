"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Monitor, RefreshCw, Smartphone } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PreviewViewport = "desktop" | "mobile";

type StoreAppearancePreviewProps = {
  compact?: boolean;
};

const MOBILE_PREVIEW_WIDTH = 390;

/** Reload iframe when storefront-related vendor queries update after initial load. */
function useAutoRefreshPreview(
  ready: boolean,
  onRefresh: () => void,
  signatures: number[],
): void {
  const baselineRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    const nextSignature = signatures.join("-");

    if (baselineRef.current === null) {
      baselineRef.current = nextSignature;
      return;
    }

    if (baselineRef.current !== nextSignature) {
      baselineRef.current = nextSignature;
      onRefresh();
    }
  }, [ready, onRefresh, signatures]);
}

export function StoreAppearancePreview({ compact = false }: StoreAppearancePreviewProps) {
  const utils = trpc.useUtils();
  const [iframeKey, setIframeKey] = useState(0);
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const { data: templates, isLoading: templatesLoading } = trpc.vendor.templates.list.useQuery({});

  const customizationQuery = trpc.vendor.templates.getCustomization.useQuery();
  const layoutQuery = trpc.vendor.storefrontLayout.list.useQuery();
  const happyBannerQuery = trpc.vendor.happyBanner.get.useQuery();
  const logoQuery = trpc.vendor.logoTemplate.get.useQuery();
  const heroBannersQuery = trpc.vendor.heroBanners.list.useQuery();

  const storefrontUrl = templates?.vendorSlug ? `/vendors/${templates.vendorSlug}` : null;

  const bumpPreview = useCallback(() => {
    setIframeKey((key) => key + 1);
  }, []);

  const refreshPreview = () => {
    bumpPreview();
    void utils.vendor.templates.list.invalidate();
    void utils.vendor.templates.getCustomization.invalidate();
    void utils.vendor.storefrontLayout.list.invalidate();
    void utils.vendor.happyBanner.get.invalidate();
    void utils.vendor.logoTemplate.get.invalidate();
    void utils.vendor.heroBanners.list.invalidate();
  };

  const queriesReady =
    customizationQuery.isFetched &&
    layoutQuery.isFetched &&
    happyBannerQuery.isFetched &&
    logoQuery.isFetched &&
    heroBannersQuery.isFetched;

  useAutoRefreshPreview(
    queriesReady && Boolean(storefrontUrl),
    bumpPreview,
    [
      customizationQuery.dataUpdatedAt,
      layoutQuery.dataUpdatedAt,
      happyBannerQuery.dataUpdatedAt,
      logoQuery.dataUpdatedAt,
      heroBannersQuery.dataUpdatedAt,
    ],
  );

  const frameHeight = compact ? "min(720px, calc(100dvh - 14rem))" : "calc(100dvh - 14rem)";

  if (templatesLoading) {
    return <Skeleton className="w-full" style={{ height: frameHeight, minHeight: "480px" }} />;
  }

  if (!storefrontUrl) {
    return (
      <p className="text-sm text-muted-foreground">
        Storefront preview is unavailable until your vendor slug is configured.
      </p>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          <Button
            type="button"
            variant={viewport === "desktop" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setViewport("desktop")}
          >
            <Monitor className="mr-1.5 h-4 w-4" />
            Desktop
          </Button>
          <Button
            type="button"
            variant={viewport === "mobile" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setViewport("mobile")}
          >
            <Smartphone className="mr-1.5 h-4 w-4" />
            Mobile
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshPreview}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={storefrontUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open store
            </Link>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 justify-center overflow-hidden rounded-lg border bg-muted p-2",
          viewport === "mobile" && "items-start",
        )}
        style={{ height: frameHeight, minHeight: "480px" }}
      >
        <div
          className={cn(
            "h-full overflow-hidden rounded-md border bg-white shadow-sm transition-all",
            viewport === "mobile" ? "w-full max-w-[390px]" : "w-full",
          )}
          style={viewport === "mobile" ? { maxWidth: MOBILE_PREVIEW_WIDTH } : undefined}
        >
          <iframe
            key={iframeKey}
            title="Storefront preview"
            src={`${storefrontUrl}?_sa=${iframeKey}`}
            className="block h-full w-full border-0 bg-white"
          />
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Live preview — refreshes automatically when you save changes
      </p>
    </div>
  );
}
