import type { ResolvedTemplate } from "@/types/template-customization";
import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import type { ResolvedVendorLogoTemplate } from "@/lib/vendor-logo/types";

/**
 * Shared props for every structural vendor storefront layout.
 */
export interface VendorLayoutProps {
  vendor: any;
  template: ResolvedTemplate;
  products: any[];
  happyBanner?: ResolvedHappyBanner | null;
  resolvedLogoTemplate?: ResolvedVendorLogoTemplate | null;
}
