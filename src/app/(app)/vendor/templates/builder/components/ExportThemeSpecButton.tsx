"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  exportThemeSpecFromBuilder,
  formatThemeSpecForClipboard,
} from "@/lib/templates/export-theme-spec";
import type { TemplateCategory } from "@/lib/templates/category-presets";
import type { StorefrontSkeleton } from "@/lib/templates/manifests/types";
import type { TemplateConfig } from "@/types/template-customization";
import type { StorefrontSection } from "@/types/template-sections";

interface ExportThemeSpecButtonProps {
  name: string;
  description: string;
  category: TemplateCategory;
  skeleton: StorefrontSkeleton;
  config: TemplateConfig;
  sections: StorefrontSection[];
}

export function ExportThemeSpecButton({
  name,
  description,
  category,
  skeleton,
  config,
  sections,
}: ExportThemeSpecButtonProps) {
  const handleExport = async () => {
    const spec = exportThemeSpecFromBuilder({
      name: name.trim() || "New Theme",
      description,
      category,
      skeleton,
      config,
      sections,
    });

    const text = formatThemeSpecForClipboard(spec);

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Theme spec copied — paste into manifests/themes/your-theme.theme.ts");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <Copy className="h-4 w-4 mr-2" />
      Export theme spec
    </Button>
  );
}
