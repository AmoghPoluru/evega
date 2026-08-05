"use client";

import { useState } from "react";
import Link from "next/link";
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
import { CheckCircle2, Eye, Loader2, Pencil, Plus, Sparkles } from "lucide-react";
import { TemplatePreviewModal } from "./components/TemplatePreviewModal";
import { toast } from "sonner";
import type { VendorTemplate } from "@/payload-types";
import { getAllMoods, getAllNiches } from "@/lib/templates/manifests/registry";

type TemplateListItem = VendorTemplate & {
  isSelected?: boolean;
  isOwned?: boolean;
  niche?: string | null;
  mood?: string | null;
  skeleton?: string | null;
};

function getBuilderHref(template: TemplateListItem): string {
  if (template.isOwned) {
    return `/vendor/templates/builder?edit=${template.id}`;
  }
  return `/vendor/templates/builder?source=${template.id}`;
}

function getThumbnailUrl(template: TemplateListItem): string | undefined {
  const media = template.thumbnailImage;
  if (!media || typeof media === "string") return undefined;
  return media.url ?? undefined;
}

function getTemplateColors(template: TemplateListItem): { primary: string; secondary: string } {
  const config = template.templateConfig as
    | { colors?: { primary?: string; secondary?: string } }
    | undefined;
  return {
    primary: config?.colors?.primary ?? "#6366f1",
    secondary: config?.colors?.secondary ?? "#8b5cf6",
  };
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [niche, setNiche] = useState<string>("all");
  const [mood, setMood] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateListItem | null>(null);

  const niches = getAllNiches();
  const moods = getAllMoods();

  const { data, isLoading } = trpc.vendor.templates.list.useQuery({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    niche: niche !== "all" ? niche : undefined,
    mood: mood !== "all" ? mood : undefined,
  });

  const selectTemplate = trpc.vendor.templates.select.useMutation({
    onSuccess: () => {
      toast.success("Template selected successfully!");
      // Refetch templates to update selected state
      window.location.reload();
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
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Choose Your Template</h1>
          <p className="text-sm text-gray-600 mt-1">
            Select a template that matches your brand identity. You can customize it later.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/vendor/templates/builder?preset=kirana">
            <Sparkles className="h-4 w-4 mr-2" />
            Triumph-style builder
          </Link>
        </Button>
        <Button asChild>
          <Link href="/vendor/templates/builder">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
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
        <Select value={niche} onValueChange={setNiche}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Niche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All niches</SelectItem>
            {niches.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={mood} onValueChange={setMood}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All moods</SelectItem>
            {moods.map((item) => (
              <SelectItem key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.docs?.map((template: TemplateListItem) => {
            const thumbnailUrl = getThumbnailUrl(template);
            const colors = getTemplateColors(template);

            return (
            <Card key={template.id} className="overflow-hidden">
              <div className="relative">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={template.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div
                    className="flex h-48 w-full flex-col items-center justify-center p-4 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    }}
                  >
                    <span className="text-lg font-semibold text-white drop-shadow-sm">
                      {template.name}
                    </span>
                    <span className="mt-1 text-sm text-white/85">Tap Preview to see storefront</span>
                  </div>
                )}
                {template.isSelected && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
                {template.niche ? (
                  <p className="text-xs text-muted-foreground mt-1">{template.niche}</p>
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link href={getBuilderHref(template)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Update
                      </Link>
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelectTemplate(template.id)}
                    disabled={template.isSelected || selectTemplate.isPending}
                    className="w-full"
                  >
                    {selectTemplate.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            );
          })}
        </div>
      )}

      {data?.docs?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found</p>
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        builderHref={previewTemplate ? getBuilderHref(previewTemplate) : undefined}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTemplate(null);
          }
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
