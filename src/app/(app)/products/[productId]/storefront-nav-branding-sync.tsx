"use client";

import { useLayoutEffect } from "react";
import { setStorefrontNavBranding } from "@/lib/storefront-nav-branding";
import type { VendorStorefrontBranding } from "@/lib/vendor-logo/storefront-branding";

export function StorefrontNavBrandingSync({
  branding,
}: {
  branding: VendorStorefrontBranding | null;
}) {
  useLayoutEffect(() => {
    setStorefrontNavBranding(branding);
    return () => setStorefrontNavBranding(null);
  }, [branding]);

  return null;
}
