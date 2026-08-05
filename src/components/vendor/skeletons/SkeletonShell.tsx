import { SectionRenderer } from "@/components/vendor/sections/SectionRenderer";
import { cssVariablesToString } from "@/lib/templates/css-variables";
import { buildTemplateGlobalStyles } from "@/components/vendor/layouts/global-styles";
import type { VendorLayoutProps } from "@/components/vendor/layouts/types";
import type { StorefrontSection } from "@/types/template-sections";

interface SkeletonShellProps extends VendorLayoutProps {
  className?: string;
}

/** Shared shell: injects tokens and renders ordered sections. */
export function SkeletonShell({ vendor, template, products, className }: SkeletonShellProps) {
  const cssVariables = cssVariablesToString(template.cssVariables);
  const sections = template.templateConfig.sections as StorefrontSection[] | undefined;

  return (
    <div
      className={`flex min-h-screen flex-col vendor-page-template ${className ?? ""}`}
      style={{ ...(template.cssVariables as React.CSSProperties) }}
    >
      <style>{buildTemplateGlobalStyles(cssVariables)}</style>
      <SectionRenderer sections={sections} vendor={vendor} products={products} template={template} />
    </div>
  );
}
