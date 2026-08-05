"use client";

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
import Link from "next/link";
import { CheckCircle2, Pencil } from "lucide-react";
import { TemplateLivePreview } from "@/components/vendor/TemplateLivePreview";
import type { VendorTemplate } from "@/payload-types";

type TemplateListItem = VendorTemplate & { isSelected?: boolean; isOwned?: boolean };

interface TemplatePreviewModalProps {
  template: TemplateListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: () => void;
  builderHref?: string;
}

function getMediaUrl(media: VendorTemplate["previewImage"]): string | undefined {
  if (!media || typeof media === "string") return undefined;
  return media.url ?? undefined;
}

export function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
  onSelect,
  builderHref,
}: TemplatePreviewModalProps) {
  const previewImageUrl = template ? getMediaUrl(template.previewImage) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        {template ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl">{template.name}</DialogTitle>
                  <DialogDescription className="mt-2">
                    {template.description}
                  </DialogDescription>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-4">
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt={template.name}
                  className="mb-4 w-full rounded-lg border"
                />
              ) : null}
              <TemplateLivePreview template={template} vendorName={template.name} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Version:</span> {template.version}
              </div>
              <div>
                <span className="font-medium">Author:</span> {template.author}
              </div>
              <div>
                <span className="font-medium">Category:</span> {template.category}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                {template.isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {builderHref ? (
                <Button variant="outline" asChild>
                  <Link href={builderHref}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Update
                  </Link>
                </Button>
              ) : null}
              {!template.isSelected && (
                <Button onClick={onSelect}>Use This Template</Button>
              )}
              {template.isSelected ? (
                <Badge className="bg-green-600 px-3 py-1.5">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Current Template
                </Badge>
              ) : null}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
