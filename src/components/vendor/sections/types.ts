import type { VendorLayoutProps } from "@/components/vendor/layouts/types";

/**
 * Shared props for every modular storefront section.
 * Mirrors `VendorLayoutProps` plus the section's own settings bag.
 */
export interface SectionProps extends VendorLayoutProps {
  settings: Record<string, unknown>;
  /** Rendered inside the template builder: sections show a lightweight, static version. */
  preview?: boolean;
}
