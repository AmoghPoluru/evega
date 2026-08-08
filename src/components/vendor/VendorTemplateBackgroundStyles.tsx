import { buildVendorPageBackgroundStyles } from "@/lib/templates/template-background-styles";
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
  const css = buildVendorPageBackgroundStyles(
    scopeClass,
    template.templateConfig,
    template.cssVariables,
  );

  if (!css.trim()) {
    return null;
  }

  return <style>{css}</style>;
}
