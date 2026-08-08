"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, RefreshCw } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Space for vendor header, tabs, toolbar, and padding (page title hidden on preview tab). */
const PREVIEW_FRAME_HEIGHT = "calc(100dvh - 11rem)";

export function StoreAppearancePreview() {
  const utils = trpc.useUtils();
  const [iframeKey, setIframeKey] = useState(0);
  const { data: templates, isLoading } = trpc.vendor.templates.list.useQuery({});

  const storefrontUrl = templates?.vendorSlug ? `/vendors/${templates.vendorSlug}` : null;

  const refreshPreview = () => {
    setIframeKey((key) => key + 1);
    void utils.vendor.templates.list.invalidate();
    void utils.vendor.storefrontLayout.list.invalidate();
    void utils.vendor.happyBanner.get.invalidate();
  };

  if (isLoading) {
    return (
      <Skeleton
        className="w-full"
        style={{ height: PREVIEW_FRAME_HEIGHT, minHeight: "70dvh" }}
      />
    );
  }

  if (!storefrontUrl) {
    return (
      <p className="text-sm text-muted-foreground">
        Storefront preview is unavailable until your vendor slug is configured.
      </p>
    );
  }

  return (
    <div
      className="flex w-full flex-col"
      style={{ height: PREVIEW_FRAME_HEIGHT, minHeight: "70dvh" }}
    >
      <div className="mb-3 flex shrink-0 justify-end gap-2">
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

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-muted">
        <iframe
          key={iframeKey}
          title="Storefront preview"
          src={storefrontUrl}
          className="block h-full w-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
