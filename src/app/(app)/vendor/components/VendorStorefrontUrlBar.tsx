"use client";

import Link from "next/link";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  vendorPortalBrandLabel,
  vendorStorefrontDisplayUrl,
} from "@/lib/vendor-portal-labels";

type VendorStorefrontUrlBarProps = {
  vendorSlug?: string | null;
};

export function VendorStorefrontUrlBar({ vendorSlug }: VendorStorefrontUrlBarProps) {
  const storefrontDisplayUrl = vendorStorefrontDisplayUrl(vendorSlug);

  if (!storefrontDisplayUrl) {
    return null;
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(storefrontDisplayUrl);
      toast.success("Store URL copied");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  return (
    <div className="border-b border-primary/20 bg-primary/5 px-4 py-2.5 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary sm:flex">
          <Globe className="h-4 w-4" />
          <span>{vendorPortalBrandLabel}</span>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-primary/25 bg-background px-3 py-2 shadow-sm">
          <Globe className="h-4 w-4 shrink-0 text-primary sm:hidden" />
          <Link
            href={storefrontDisplayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-xs font-semibold text-primary hover:underline sm:text-sm"
            title={storefrontDisplayUrl}
          >
            {storefrontDisplayUrl}
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-primary/10"
              aria-label="Copy store URL"
              onClick={copyUrl}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-primary/10"
              aria-label="Open store in new tab"
              asChild
            >
              <Link href={storefrontDisplayUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
