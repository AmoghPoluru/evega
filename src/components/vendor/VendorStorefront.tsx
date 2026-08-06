import { createElement } from "react";
import type { ResolvedTemplate } from "@/types/template-customization";
import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import { getLayout } from "@/lib/templates/component-registry";
import { buildFallbackResolvedTemplate } from "@/lib/templates/default-template";

interface VendorStorefrontProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vendor: any;
  template: ResolvedTemplate | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  happyBanner?: ResolvedHappyBanner;
}

/**
 * VendorStorefront
 * Reads the resolved template's structural `layout` identifier, looks up the
 * matching layout component in the registry (falling back to DefaultLayout) and
 * renders the chosen storefront with the vendor and product data.
 */
export function VendorStorefront({ vendor, template, products, happyBanner }: VendorStorefrontProps) {
  const resolvedTemplate = template ?? buildFallbackResolvedTemplate();

  const layout = getLayout(resolvedTemplate.layout);

  return createElement(layout, { vendor, template: resolvedTemplate, products, happyBanner });
}
