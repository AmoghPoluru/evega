import { buildVendorPageBackgroundStyles } from "@/lib/templates/template-background-styles";
import { buildVendorSectionStyles } from "@/lib/templates/template-section-styles";
import type { ResolvedTemplate } from "@/types/template-customization";

type VendorTemplateBackgroundStylesProps = {
  scopeClass: string;
  template: ResolvedTemplate;
};

/**
 * Injects theme background (solid, gradient, mesh, etc.) for a layout root class.
 */
export function VendorTemplateBackgroundStyles({
  scopeClass,
  template,
}: VendorTemplateBackgroundStylesProps) {
  const css = [
    buildVendorPageBackgroundStyles(
      scopeClass,
      template.templateConfig,
      template.cssVariables,
    ),
    buildVendorSectionStyles(scopeClass),
  ]
    .filter(Boolean)
    .join("\n");

  if (!css.trim()) {
    return null;
  }

  return <style>{css}</style>;
}
