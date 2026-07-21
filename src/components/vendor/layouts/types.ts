import type { ResolvedTemplate } from "@/types/template-customization";

/**
 * Shared props for every structural vendor storefront layout.
 * Layouts receive the vendor document, the resolved template (colors, fonts,
 * css variables, layout identifier) and the vendor's public products.
 */
export interface VendorLayoutProps {
  vendor: any;
  template: ResolvedTemplate;
  products: any[];
}
