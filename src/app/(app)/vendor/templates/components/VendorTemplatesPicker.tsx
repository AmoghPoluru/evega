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
import { TemplateCardPreview } from "./TemplateCardPreview";
import { toast } from "sonner";
import type { VendorTemplate } from "@/payload-types";
import { getThemeIndustryLabel } from "@/lib/templates/theme-catalog";

type TemplateListItem = VendorTemplate & {
  isSelected?: boolean;
  isLegacySelection?: boolean;
  isFeatured?: boolean;
  industry?: string;
};

type VendorTemplatesPickerProps = {
  embedded?: boolean;
  onTemplateSelected?: () => void;
};

const MOOD_CATEGORIES = [
  { value: "all", label: "All moods" },
  { value: "minimal", label: "Minimal" },
  { value: "elegant", label: "Elegant" },
  { value: "bold", label: "Bold" },
  { value: "colorful", label: "Colorful" },
  { value: "classic", label: "Classic" },
] as const;

export function VendorTemplatesPicker({
  embedded = false,
  onTemplateSelected,
}: VendorTemplatesPickerProps) {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [industry, setIndustry] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateListItem | null>(null);

  const { data, isLoading } = trpc.vendor.templates.list.useQuery({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    industry: industry !== "all" ? industry : undefined,
    featuredOnly: true,
  });

  const selectTemplate = trpc.vendor.templates.select.useMutation({
    onSuccess: () => {
      toast.success("Theme selected successfully!");
      void utils.vendor.templates.list.invalidate();
      onTemplateSelected?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to select theme");
    },
  });

  const handleSelectTemplate = (templateId: string) => {
    selectTemplate.mutate({ templateId });
  };

  const industryOptions = data?.industries ?? [];

  return (
    <div className={embedded ? "space-y-4" : "p-6"}>
      {!embedded ? (
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Choose Your Theme</h1>
            <p className="mt-1 text-sm text-gray-600">
              Curated themes for colors and fonts. Pick layout separately in the Layout tab.
            </p>
          </div>
          {!isLoading && data ? (
            <p className="text-sm text-muted-foreground">
              {data.docs.length} theme{data.docs.length === 1 ? "" : "s"} shown
              {data.featuredThemeCount
                ? ` · ${data.featuredThemeCount} recommended`
                : null}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pick colors and fonts for your storefront. Choose product layout separately in the Layout
          tab.
        </p>
      )}

      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="min-w-[200px] flex-1">
          <Input
            placeholder="Search themes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {industryOptions.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Mood" />
          </SelectTrigger>
          <SelectContent>
            {MOOD_CATEGORIES.map((cat) => (
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
          {data.docs.map((template: TemplateListItem) => {
            const industryLabel = getThemeIndustryLabel(template.industry ?? null);

            return (
              <Card key={template.id} className="overflow-hidden">
                <div className="relative">
                  <TemplateCardPreview template={template} />
                  {template.isSelected ? (
                    <div className="absolute right-2 top-2">
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Current
                      </Badge>
                    </div>
                  ) : null}
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    <Badge variant="secondary">{template.category}</Badge>
                    {industryLabel ? (
                      <Badge variant="outline" className="bg-background/90 text-[10px]">
                        {industryLabel}
                      </Badge>
                    ) : null}
                    {template.isLegacySelection ? (
                      <Badge variant="outline" className="bg-amber-50 text-[10px] text-amber-900">
                        Legacy theme
                      </Badge>
                    ) : null}
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
                      disabled={
                        template.isSelected ||
                        selectTemplate.isPending ||
                        template.isLegacySelection
                      }
                      className="flex-1"
                    >
                      {selectTemplate.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Selecting...
                        </>
                      ) : template.isSelected ? (
                        "Selected"
                      ) : template.isLegacySelection ? (
                        "Current (legacy)"
                      ) : (
                        "Select"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {data?.docs?.length === 0 && !isLoading ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">No themes match your filters</p>
        </div>
      ) : null}

      <TemplatePreviewModal
        template={previewTemplate}
        vendorSlug={data?.vendorSlug}
        useAuthenticatedPreview
        open={!!previewTemplate}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
        onSelect={() => {
          if (previewTemplate && !previewTemplate.isLegacySelection) {
            handleSelectTemplate(previewTemplate.id);
            setPreviewTemplate(null);
          }
        }}
      />
    </div>
  );
}
