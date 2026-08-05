"use client";

import { useMemo } from "react";

import { VendorStorefront } from "@/components/vendor/VendorStorefront";
import { TemplateFontLinksClient } from "@/components/vendor/TemplateFontLinksClient";
import { buildTemplateGlobalStyles } from "@/components/vendor/layouts/global-styles";
import {
  buildPreviewResolvedTemplate,
  type VendorTemplatePreviewDoc,
} from "@/lib/templates/build-preview-template";
import { cssVariablesToString } from "@/lib/templates/css-variables";

const PREVIEW_PRODUCTS = [
  { id: "preview-1", name: "Sample product one", price: 1299 },
  { id: "preview-2", name: "Sample product two", price: 899 },
  { id: "preview-3", name: "Sample product three", price: 2499 },
];

interface TemplateLivePreviewProps {
  template: VendorTemplatePreviewDoc;
  vendorName?: string;
  className?: string;
  maxHeight?: string;
}

/** Interactive storefront preview driven by a vendor-template document. */
export function TemplateLivePreview({
  template,
  vendorName = "Sample Store",
  className,
  maxHeight = "70vh",
}: TemplateLivePreviewProps) {
  const resolved = useMemo(() => buildPreviewResolvedTemplate(template), [template]);

  const vendor = useMemo(
    () => ({
      id: "template-preview",
      name: vendorName,
      slug: "template-preview",
      description: "This is how your storefront will look to customers.",
    }),
    [vendorName],
  );

  const cssVariablesString = useMemo(
    () => cssVariablesToString(resolved.cssVariables),
    [resolved.cssVariables],
  );

  return (
    <div className={className}>
      <TemplateFontLinksClient
        headingFont={resolved.templateConfig.fonts?.heading}
        bodyFont={resolved.templateConfig.fonts?.body}
      />
      <div
        className="vendor-page-template overflow-y-auto rounded-lg border bg-background"
        style={{
          ...(resolved.cssVariables as React.CSSProperties),
          maxHeight,
        }}
      >
        <style>
          {buildTemplateGlobalStyles(
            cssVariablesString,
            resolved.layout === "modular" ? resolved.templateConfig : undefined,
          )}
        </style>
        <VendorStorefront vendor={vendor} template={resolved} products={PREVIEW_PRODUCTS} />
      </div>
    </div>
  );
}
