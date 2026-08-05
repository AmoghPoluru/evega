import { getSkeleton } from "@/components/vendor/skeletons/skeleton-registry";
import type { VendorLayoutProps } from "./types";

/**
 * ModularLayout
 * Renders modular storefronts via a structural skeleton + ordered sections.
 * Legacy layout components (Runway, Default, etc.) remain in layoutRegistry.
 */
export function ModularLayout({ vendor, template, products }: VendorLayoutProps) {
  const Skeleton = getSkeleton(template.skeleton ?? "classic");
  return <Skeleton vendor={vendor} template={template} products={products} />;
}
