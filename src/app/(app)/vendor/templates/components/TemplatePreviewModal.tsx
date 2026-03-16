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
import { CheckCircle2 } from "lucide-react";

interface TemplatePreviewModalProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: () => void;
}

export function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
  onSelect,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {template.description}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{template.category}</Badge>
              {template.isSelected && (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Current Template
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {template.previewImage?.url ? (
            <img
              src={template.previewImage.url}
              alt={template.name}
              className="w-full rounded-lg border"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No preview image available</span>
            </div>
          )}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!template.isSelected && (
            <Button onClick={onSelect}>Use This Template</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
