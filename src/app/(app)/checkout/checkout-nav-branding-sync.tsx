"use client";

import { useLayoutEffect } from "react";
import { trpc } from "@/trpc/client";
import { useCartStore } from "@/modules/checkout/store/use-cart-store";
import { setStorefrontNavBranding } from "@/lib/storefront-nav-branding";

/** Show the cart vendor's logo in the top navbar on checkout. */
export function CheckoutNavBrandingSync() {
  const productId = useCartStore((state) => state.items[0]?.productId);

  const { data: branding } = trpc.storefront.getVendorBrandingByProductId.useQuery(
    { productId: productId ?? "" },
    { enabled: Boolean(productId) },
  );

  useLayoutEffect(() => {
    setStorefrontNavBranding(branding ?? null);
    return () => setStorefrontNavBranding(null);
  }, [branding]);

  return null;
}
