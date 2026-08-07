"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import type { VendorTemplate } from "@/payload-types";

type TemplatePreviewItem = VendorTemplate & { isSelected?: boolean };

interface TemplatePreviewModalProps {
  template: TemplatePreviewItem | null;
  vendorSlug?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: () => void;
}

export function TemplatePreviewModal({
  template,
  vendorSlug: vendorSlugProp,
  open,
  onOpenChange,
  onSelect,
}: TemplatePreviewModalProps) {
  const [maximized, setMaximized] = useState(false);

  const { data: listMeta } = trpc.vendor.templates.list.useQuery(
    {},
    {
      enabled: open && !vendorSlugProp,
    },
  );

  useEffect(() => {
    if (!open) setMaximized(false);
  }, [open]);

  if (!template) return null;

  const vendorSlug = vendorSlugProp ?? listMeta?.vendorSlug ?? null;
  const previewSrc = vendorSlug
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
        <DialogHeader className="relative shrink-0 space-y-1 border-b px-6 py-4 pr-24">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                Live preview using your products and storefront data
                {template.slug ? (
                  <span className="ml-1 font-mono text-xs">({template.slug})</span>
                ) : null}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{template.category}</Badge>
              {template.isSelected ? (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Current Template
                </Badge>
              ) : null}
            </div>
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
              {maximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
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
                "flex items-center justify-center text-sm text-muted-foreground",
                iframeHeight,
              )}
            >
              Unable to load preview. Try again after your vendor profile loads.
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {!template.isSelected ? (
              <Button onClick={onSelect}>Use This Template</Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
