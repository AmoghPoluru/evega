"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Eye, Maximize2, Minimize2 } from "lucide-react";

import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PreviewVendor =
  inferRouterOutputs<AppRouter>["admin"]["templates"]["previewVendors"][number];

type PreviewTemplate = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

interface Props {
  template: PreviewTemplate | null;
  vendorSlug: string | null;
  onVendorSlugChange: (slug: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffTemplatePreviewModal({
  template,
  vendorSlug,
  onVendorSlugChange,
  open,
  onOpenChange,
}: Props) {
  const [maximized, setMaximized] = useState(false);

  const { data: vendors, isLoading: vendorsLoading } = trpc.admin.templates.previewVendors.useQuery(
    undefined,
    { enabled: open },
  );

  const selectedVendor = useMemo(
    () => vendors?.find((vendor: PreviewVendor) => vendor.slug === vendorSlug) ?? null,
    [vendors, vendorSlug],
  );

  useEffect(() => {
    if (!open) setMaximized(false);
  }, [open]);

  useEffect(() => {
    if (!open || !vendors?.length || vendorSlug) return;
    onVendorSlugChange(vendors[0]?.slug ?? "");
  }, [open, vendors, vendorSlug, onVendorSlugChange]);

  if (!template) return null;

  const previewSrc =
    vendorSlug && template.id
      ? `/vendors/${vendorSlug}?previewTemplate=${template.id}`
      : null;

  const iframeHeight = maximized ? "flex-1 min-h-0 w-full" : "h-[min(70vh,720px)] w-full";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          maximized
            ? "fixed inset-0 top-0 left-0 h-screen w-screen max-h-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0"
            : "max-h-[95vh] max-w-6xl",
        )}
      >
        <DialogHeader className="relative shrink-0 space-y-3 border-b px-6 py-4 pr-24">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                Live preview on a vendor storefront
                {template.slug ? (
                  <span className="ml-1 font-mono text-xs">({template.slug})</span>
                ) : null}
              </DialogDescription>
            </div>
            <Badge variant="secondary">{template.category}</Badge>
          </div>

          <div className="max-w-sm space-y-2">
            <Label htmlFor="preview-vendor">Preview with vendor</Label>
            <Select
              value={vendorSlug ?? undefined}
              onValueChange={onVendorSlugChange}
              disabled={vendorsLoading || !vendors?.length}
            >
              <SelectTrigger id="preview-vendor" className="bg-white">
                <SelectValue placeholder={vendorsLoading ? "Loading vendors…" : "Select vendor"} />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {(vendors ?? []).map((vendor: PreviewVendor) => (
                  <SelectItem key={vendor.id} value={vendor.slug}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedVendor ? (
              <p className="text-xs text-muted-foreground">
                Using products and branding from{" "}
                <span className="font-medium">{selectedVendor.name}</span>
              </p>
            ) : null}
          </div>

          <div className="absolute right-12 top-4 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={maximized ? "Restore preview size" : "Maximize preview"}
              onClick={() => setMaximized((value) => !value)}
            >
              {maximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </DialogHeader>

        <div className={cn("flex min-h-0 flex-1 flex-col bg-muted/30", maximized && "flex-1")}>
          {previewSrc ? (
            <iframe
              title={`Preview ${template.name}`}
              src={previewSrc}
              className={cn("border-0 bg-white", iframeHeight)}
            />
          ) : (
            <div
              className={cn(
                "flex items-center justify-center px-6 text-center text-sm text-muted-foreground",
                iframeHeight,
              )}
            >
              {vendorsLoading
                ? "Loading vendors…"
                : vendors?.length
                  ? "Select a vendor to preview this template."
                  : "No approved active vendors available for preview."}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-between">
          <div className="flex gap-2">
            {previewSrc ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={previewSrc} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Open full page
                </Link>
              </Button>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
