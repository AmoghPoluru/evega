import { SectionRenderer } from "@/components/vendor/sections/SectionRenderer";
import { cssVariablesToString } from "@/lib/templates/css-variables";
import type { StorefrontSection } from "@/types/template-sections";
import { buildTemplateGlobalStyles } from "./global-styles";
import type { VendorLayoutProps } from "./types";

/**
 * ModularLayout
 * Storefront layout for templates built with the section builder. Injects the
 * same global CSS-variable driven styling as DefaultLayout, then renders the
 * template's ordered sections instead of a fixed structure.
 */
export function ModularLayout({ vendor, template, products }: VendorLayoutProps) {
  const cssVariables = cssVariablesToString(template.cssVariables);
  const sections = template.templateConfig.sections as StorefrontSection[] | undefined;

  return (
    <div
      className="flex flex-col min-h-screen vendor-page-template"
      style={{
        ...(template.cssVariables as React.CSSProperties),
      }}
    >
      <style>{buildTemplateGlobalStyles(cssVariables)}</style>
      <SectionRenderer
        sections={sections}
        vendor={vendor}
        products={products}
        template={template}
      />
    </div>
  );
}
