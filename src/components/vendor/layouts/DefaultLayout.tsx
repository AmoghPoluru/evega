import { SectionRenderer } from "@/components/vendor/sections/SectionRenderer";
import { StorefrontChromeBar } from "@/components/vendor/chrome/StorefrontChrome";
import { resolveStorefrontChrome } from "@/lib/templates/storefront-chrome";
import { cssVariablesToString } from "@/lib/templates/css-variables";
import { buildTemplateGlobalStyles } from "@/components/vendor/layouts/global-styles";
import type { VendorLayoutProps } from "./types";

/**
 * DefaultLayout
 * Renders the standard three-section vendor storefront:
 * hero banner → vendor info bar → filterable product list.
 */
export function DefaultLayout({ vendor, template, products, happyBanner }: VendorLayoutProps) {
  const cssVariables = cssVariablesToString(template.cssVariables);
  const chrome = resolveStorefrontChrome(template.templateConfig);
  const useChrome = chrome.enabled === true;
  const sections = useChrome
    ? template.templateConfig.sections?.map((section) =>
        section.type === "vendor-info" ? { ...section, enabled: false } : section,
      )
    : template.templateConfig.sections;

  return (
    <div
      className="flex min-h-screen flex-col vendor-page-template"
      style={{
        ...(template.cssVariables as React.CSSProperties),
      }}
    >
      <style>{buildTemplateGlobalStyles(cssVariables, template.templateConfig)}</style>
      {useChrome ? <StorefrontChromeBar template={template} vendorName={vendor.name} /> : null}
      <SectionRenderer
        sections={sections}
        vendor={vendor}
        products={products}
        template={template}
        happyBanner={happyBanner}
      />
    </div>
  );
}
