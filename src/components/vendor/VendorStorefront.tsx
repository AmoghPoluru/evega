"use client";

import type { ResolvedTemplate } from "@/types/template-customization";
import { getComponent } from "@/lib/templates/component-registry";

interface VendorStorefrontProps {
  vendor: any;
  template: ResolvedTemplate | null;
  products: any[];
}

export function VendorStorefront({ vendor, template, products }: VendorStorefrontProps) {
  if (!template) {
    // Fallback: render without template
    return null;
  }

  // Get components from registry (will be implemented in Phase 5)
  // For now, we'll use default rendering
  // const HeroComponent = getComponent("hero-banner", template.componentMapping.heroBanner);
  // const ProductCardComponent = getComponent("product-card", template.componentMapping.productCard);

  return (
    <div className="vendor-storefront">
      {/* Template-specific rendering will be implemented in Phase 5 */}
      {/* For now, the template CSS variables are applied via the parent div */}
    </div>
  );
}
