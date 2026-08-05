"use client";

import { useMemo } from "react";

import { SectionRenderer } from "@/components/vendor/sections/SectionRenderer";
import { TemplateFontLinksClient } from "@/components/vendor/TemplateFontLinksClient";
import { buildTemplateGlobalStyles } from "@/components/vendor/layouts/global-styles";
import { generateCSSVariables } from "@/lib/templates/css-variables";
import {
  getCategoryComponentMapping,
  type TemplateCategory,
} from "@/lib/templates/category-presets";
import type { ResolvedTemplate, TemplateConfig } from "@/types/template-customization";
import type { StorefrontSection } from "@/types/template-sections";

interface BuilderPreviewProps {
  config: TemplateConfig;
  sections: StorefrontSection[];
  vendorName: string;
  category: TemplateCategory;
}

const PREVIEW_PRODUCTS = [
  { id: "preview-1", name: "Sample product one", price: 1299 },
  { id: "preview-2", name: "Sample product two", price: 899 },
  { id: "preview-3", name: "Sample product three", price: 2499 },
];

/**
 * Renders the in-progress template with the real section components so the
 * vendor sees the actual storefront structure while editing.
 */
export function BuilderPreview({
  config,
  sections,
  vendorName,
  category,
}: BuilderPreviewProps) {
  const cssVariables = useMemo(() => generateCSSVariables(config), [config]);
  const componentMapping = useMemo(
    () => getCategoryComponentMapping(category),
    [category],
  );

  const template = useMemo<ResolvedTemplate>(
    () => ({
      templateId: "builder-preview",
      templateSlug: "builder-preview",
      templateConfig: { ...config, sections },
      customization: {},
      cssVariables,
      layout: "modular",
      skeleton: "classic",
      componentMapping: { ...componentMapping, layout: "modular" },
    }),
    [config, sections, cssVariables, componentMapping],
  );

  const vendor = useMemo(
    () => ({
      id: "builder-preview",
      name: vendorName || "Your store",
      slug: "builder-preview",
      description: "This is how your storefront will look to customers.",
    }),
    [vendorName],
  );

  return (
    <div className="overflow-hidden rounded-lg border">
      <TemplateFontLinksClient
        headingFont={config.fonts?.heading}
        bodyFont={config.fonts?.body}
      />
      <div
        key={category}
        className="vendor-page-template max-h-[70vh] overflow-y-auto"
        style={cssVariables as React.CSSProperties}
      >
        <style>{buildTemplateGlobalStyles("")}</style>
        <SectionRenderer
          sections={sections}
          vendor={vendor}
          products={PREVIEW_PRODUCTS}
          template={template}
          preview
        />
      </div>
    </div>
  );
}
