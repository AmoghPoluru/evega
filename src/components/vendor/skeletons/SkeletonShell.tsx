import { SectionRenderer } from "@/components/vendor/sections/SectionRenderer";
import { StorefrontChromeBar } from "@/components/vendor/chrome/StorefrontChrome";
import { resolveStorefrontChrome } from "@/lib/templates/storefront-chrome";
import { cssVariablesToString } from "@/lib/templates/css-variables";
import { buildTemplateGlobalStyles } from "@/components/vendor/layouts/global-styles";
import type { VendorLayoutProps } from "@/components/vendor/layouts/types";
import type { StorefrontSection } from "@/types/template-sections";

interface SkeletonShellProps extends VendorLayoutProps {
  className?: string;
}

/** Shared shell: injects tokens and renders ordered sections. */
export function SkeletonShell({ vendor, template, products, happyBanner, className }: SkeletonShellProps) {
  const cssVariables = cssVariablesToString(template.cssVariables);
  const sections = template.templateConfig.sections as StorefrontSection[] | undefined;
  const chrome = resolveStorefrontChrome(template.templateConfig);
  const useChrome = chrome.enabled === true;

  const filteredSections = useChrome
    ? sections?.map((section) =>
        section.type === "vendor-info" ? { ...section, enabled: false } : section,
      )
    : sections;

  return (
    <div
      className={`flex min-h-screen flex-col vendor-page-template ${className ?? ""}`}
      style={{ ...(template.cssVariables as React.CSSProperties) }}
    >
      <style>{buildTemplateGlobalStyles(cssVariables, template.templateConfig)}</style>
      {useChrome ? <StorefrontChromeBar template={template} vendorName={vendor.name} /> : null}
      <SectionRenderer sections={filteredSections} vendor={vendor} products={products} template={template} happyBanner={happyBanner} />
    </div>
  );
}
