import { createElement } from "react";
import type { ResolvedTemplate } from "@/types/template-customization";
import { getLayout } from "@/lib/templates/component-registry";
import { buildFallbackResolvedTemplate } from "@/lib/templates/default-template";

interface VendorStorefrontProps {
  vendor: any;
  template: ResolvedTemplate | null;
  products: any[];
}

/**
 * VendorStorefront
 * Reads the resolved template's structural `layout` identifier, looks up the
 * matching layout component in the registry (falling back to DefaultLayout) and
 * renders the chosen storefront with the vendor and product data.
 */
export function VendorStorefront({ vendor, template, products }: VendorStorefrontProps) {
  const resolvedTemplate = template ?? buildFallbackResolvedTemplate();

  const layout = getLayout(resolvedTemplate.layout);

  return createElement(layout, { vendor, template: resolvedTemplate, products });
}
