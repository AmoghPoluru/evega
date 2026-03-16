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
import { TemplatePreviewModal } from "./components/TemplatePreviewModal";
import { toast } from "sonner";

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const { data, isLoading } = trpc.vendor.templates.list.useQuery({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Choose Your Template</h1>
        <p className="text-sm text-gray-600 mt-1">
          Select a template that matches your brand identity. You can customize it later.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
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
          {data?.docs?.map((template: any) => (
            <Card key={template.id} className="overflow-hidden">
              <div className="relative">
                {template.thumbnailImage?.url ? (
                  <img
                    src={template.thumbnailImage.url}
                    alt={template.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No preview</span>
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
              </CardHeader>
              <CardContent>
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
                    size="sm"
                    onClick={() => handleSelectTemplate(template.id)}
                    disabled={template.isSelected || selectTemplate.isPending}
                    className="flex-1"
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
          ))}
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
