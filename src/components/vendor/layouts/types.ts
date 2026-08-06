import type { ResolvedTemplate } from "@/types/template-customization";
import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";

/**
 * Shared props for every structural vendor storefront layout.
 */
export interface VendorLayoutProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vendor: any;
  template: ResolvedTemplate;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  happyBanner?: ResolvedHappyBanner;
}
