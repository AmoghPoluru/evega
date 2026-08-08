"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, Pencil } from "lucide-react";

import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StaffTemplateEditDialog } from "./StaffTemplateEditDialog";
import { StaffTemplatePreviewModal } from "./StaffTemplatePreviewModal";
import { getThemeIndustryLabel } from "@/lib/templates/theme-catalog";

const PREVIEW_VENDOR_STORAGE_KEY = "staff-templates-preview-vendor-slug";

type PreviewVendor =
  inferRouterOutputs<AppRouter>["admin"]["templates"]["previewVendors"][number];

type TemplateListItem =
  inferRouterOutputs<AppRouter>["admin"]["templates"]["list"][number];

const CATEGORY_LABELS: Record<string, string> = {
  minimal: "Minimal",
  elegant: "Elegant",
  bold: "Bold",
  colorful: "Colorful",
  classic: "Classic",
};

export function StaffTemplatesTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<
    "all" | "minimal" | "elegant" | "bold" | "colorful" | "classic"
  >("all");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateListItem | null>(null);
  const [previewVendorSlug, setPreviewVendorSlug] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(PREVIEW_VENDOR_STORAGE_KEY);
  });

  useEffect(() => {
    if (!previewVendorSlug) return;
    window.localStorage.setItem(PREVIEW_VENDOR_STORAGE_KEY, previewVendorSlug);
  }, [previewVendorSlug]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const utils = trpc.useUtils();
  const { data: previewVendors } = trpc.admin.templates.previewVendors.useQuery();
  const { data, isLoading, error } = trpc.admin.templates.list.useQuery({
    search: debouncedSearch.trim() || undefined,
    category,
    includeInactive: true,
  });

  useEffect(() => {
    if (previewVendorSlug || !previewVendors?.length) return;
    setPreviewVendorSlug(previewVendors[0]?.slug ?? null);
  }, [previewVendorSlug, previewVendors]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load templates: {error.message}
      </div>
    );
  }

  return (
    <>
      {!isLoading && data ? (
        <p className="mb-3 text-sm text-muted-foreground">
          Showing {data.length} template{data.length === 1 ? "" : "s"}
        </p>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-white"
        />
        <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
          <SelectTrigger className="w-full max-w-[180px] bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="elegant">Elegant</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
            <SelectItem value="colorful">Colorful</SelectItem>
            <SelectItem value="classic">Classic</SelectItem>
          </SelectContent>
        </Select>
        {previewVendors?.length ? (
          <div className="flex flex-col gap-1 sm:min-w-[220px]">
            <span className="text-xs font-medium text-gray-600">Default preview vendor</span>
            <Select
              value={previewVendorSlug ?? undefined}
              onValueChange={setPreviewVendorSlug}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {previewVendors.map((vendor: PreviewVendor) => (
                  <SelectItem key={vendor.id} value={vendor.slug}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="rounded-lg border bg-white px-4 py-10 text-center text-sm text-muted-foreground">
          No templates found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Template</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Industry</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Status</th>
                <th className="hidden px-4 py-3 font-medium xl:table-cell">Version</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((template: TemplateListItem) => (
                <tr key={template.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded border bg-muted">
                        {template.thumbnailUrl ? (
                          <Image
                            src={template.thumbnailUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="font-mono text-xs text-gray-500">{template.slug}</div>
                        {template.description ? (
                          <div className="line-clamp-1 text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-700 md:table-cell">
                    {CATEGORY_LABELS[template.category] ?? template.category}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-700 lg:table-cell">
                    {getThemeIndustryLabel(template.industry) ?? template.industry}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {template.isFeatured ? (
                        <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                      ) : null}
                      {template.isDefault ? (
                        <Badge className="bg-indigo-100 text-indigo-800">Default</Badge>
                      ) : null}
                      {template.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 xl:table-cell">
                    {template.version}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setEditingTemplateId(template.id)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StaffTemplateEditDialog
        key={editingTemplateId ?? "closed"}
        templateId={editingTemplateId}
        open={editingTemplateId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTemplateId(null);
        }}
        onSaved={() => {
          void utils.admin.templates.list.invalidate();
          void utils.admin.vendors.listTemplateOptions.invalidate();
        }}
      />

      <StaffTemplatePreviewModal
        template={previewTemplate}
        vendorSlug={previewVendorSlug}
        onVendorSlugChange={setPreviewVendorSlug}
        open={previewTemplate !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
      />
    </>
  );
}
