"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Eye, Loader2 } from "lucide-react";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { toast } from "sonner";
import type { VendorTemplate } from "@/payload-types";

type TemplateListItem = VendorTemplate & { isSelected?: boolean };

type VendorTemplatesPickerProps = {
  embedded?: boolean;
  onTemplateSelected?: () => void;
};

export function VendorTemplatesPicker({
  embedded = false,
  onTemplateSelected,
}: VendorTemplatesPickerProps) {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateListItem | null>(null);

  const { data, isLoading } = trpc.vendor.templates.list.useQuery({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
  });

  const selectTemplate = trpc.vendor.templates.select.useMutation({
    onSuccess: () => {
      toast.success("Template selected successfully!");
      void utils.vendor.templates.list.invalidate();
      onTemplateSelected?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to select template");
    },
  });

  const handleSelectTemplate = (templateId: string) => {
    selectTemplate.mutate({ templateId });
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "minimal", label: "Minimal" },
    { value: "elegant", label: "Elegant" },
    { value: "bold", label: "Bold" },
    { value: "colorful", label: "Colorful" },
    { value: "classic", label: "Classic" },
  ];

  return (
    <div className={embedded ? "space-y-4" : "p-6"}>
      {!embedded ? (
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Choose Your Template</h1>
            <p className="mt-1 text-sm text-gray-600">
              Select a template that matches your brand identity. You can customize it later.
            </p>
          </div>
          {!isLoading && data ? (
            <p className="text-sm text-muted-foreground">
              Showing {data.docs.length} template{data.docs.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pick the layout and style for your storefront. You can customize colors and fonts later.
        </p>
      )}

      <div className="mb-2 flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : data?.docs ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.docs.map((template: TemplateListItem) => (
            <Card key={template.id} className="overflow-hidden">
              <div className="relative">
                {template.thumbnailImage &&
                typeof template.thumbnailImage === "object" &&
                template.thumbnailImage.url ? (
                  <img
                    src={template.thumbnailImage.url}
                    alt={template.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No preview</span>
                  </div>
                )}
                {template.isSelected ? (
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Current
                    </Badge>
                  </div>
                ) : null}
                <div className="absolute left-2 top-2">
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="font-mono text-xs text-muted-foreground">{template.slug}</p>
                <CardDescription className="line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSelectTemplate(template.id)}
                    disabled={template.isSelected || selectTemplate.isPending}
                    className="flex-1"
                  >
                    {selectTemplate.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Selecting...
                      </>
                    ) : template.isSelected ? (
                      "Selected"
                    ) : (
                      "Select"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {data?.docs?.length === 0 && !isLoading ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">No templates found</p>
        </div>
      ) : null}

      <TemplatePreviewModal
        template={previewTemplate}
        vendorSlug={data?.vendorSlug}
        open={!!previewTemplate}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
        onSelect={() => {
          if (previewTemplate) {
            handleSelectTemplate(previewTemplate.id);
            setPreviewTemplate(null);
          }
        }}
      />
    </div>
  );
}
