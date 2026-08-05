"use client";

import { useMemo } from "react";

import { SectionRenderer } from "@/components/vendor/sections/SectionRenderer";
import { StorefrontChromeBar } from "@/components/vendor/chrome/StorefrontChrome";
import { TemplateFontLinksClient } from "@/components/vendor/TemplateFontLinksClient";
import { buildTemplateGlobalStyles } from "@/components/vendor/layouts/global-styles";
import { generateCSSVariables } from "@/lib/templates/css-variables";
import { collectTemplateFontStacks } from "@/lib/templates/template-font-stacks";
import { resolveStorefrontChrome } from "@/lib/templates/storefront-chrome";
import {
  getCategoryComponentMapping,
  type TemplateCategory,
} from "@/lib/templates/category-presets";
import type { StorefrontSkeleton } from "@/lib/templates/manifests/types";
import type { ResolvedTemplate, TemplateConfig } from "@/types/template-customization";
import type { StorefrontSection } from "@/types/template-sections";
import { cn } from "@/lib/utils";

interface BuilderPreviewProps {
  config: TemplateConfig;
  sections: StorefrontSection[];
  vendorName: string;
  vendorSlug?: string | null;
  vendorEmail?: string | null;
  vendorPhone?: string | null;
  vendorWebsite?: string | null;
  category: TemplateCategory;
  skeleton?: StorefrontSkeleton;
  className?: string;
}

const PREVIEW_PRODUCTS = [
  { id: "preview-1", name: "Sample product one", price: 1299 },
  { id: "preview-2", name: "Sample product two", price: 899 },
];

/**
 * Renders the in-progress template with the real section components so the
 * vendor sees the actual storefront structure while editing.
 */
export function BuilderPreview({
  config,
  sections,
  vendorName,
  vendorSlug,
  vendorEmail,
  vendorPhone,
  vendorWebsite,
  category,
  skeleton = "classic",
  className,
}: BuilderPreviewProps) {
  const cssVariables = useMemo(() => generateCSSVariables(config), [config]);
  const previewFontStacks = useMemo(() => collectTemplateFontStacks(config), [config]);
  const chrome = useMemo(() => resolveStorefrontChrome(config), [config]);
  const useChrome = chrome.enabled === true;

  const previewSections = useMemo(() => sections, [sections]);
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
      skeleton,
      componentMapping: { ...componentMapping, layout: "modular" },
    }),
    [config, sections, cssVariables, componentMapping, skeleton],
  );

  const vendor = useMemo(
    () => ({
      id: "builder-preview",
      name: vendorName || "Your store",
      slug: vendorSlug || "builder-preview",
      description: "This is how your storefront will look to customers.",
      email: vendorEmail || "hello@yourstore.com",
      phone: vendorPhone || undefined,
      website: vendorWebsite || undefined,
    }),
    [vendorName, vendorSlug, vendorEmail, vendorPhone, vendorWebsite],
  );

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm", className)}>
      <TemplateFontLinksClient
        headingFont={config.fonts?.heading}
        bodyFont={config.fonts?.body}
        extraFonts={previewFontStacks}
      />
      <div
        key={`${category}-${skeleton}`}
        className="vendor-page-template min-h-0 flex-1 overflow-y-auto"
        style={cssVariables as React.CSSProperties}
      >
        <style>{buildTemplateGlobalStyles("", config)}</style>
        {useChrome ? <StorefrontChromeBar template={template} vendorName={vendor.name} /> : null}
        <SectionRenderer
          sections={previewSections}
          vendor={vendor}
          products={PREVIEW_PRODUCTS}
          template={template}
          preview
        />
      </div>
    </div>
  );
}
