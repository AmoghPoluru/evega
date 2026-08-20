"use client";

import { useSyncExternalStore } from "react";
import type { VendorStorefrontBranding } from "@/lib/vendor-logo/storefront-branding";

let branding: VendorStorefrontBranding | null = null;
const listeners = new Set<() => void>();

export function setStorefrontNavBranding(next: VendorStorefrontBranding | null) {
  branding = next;
  listeners.forEach((listener) => listener());
}

export function useStorefrontNavBranding() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => branding,
    () => null,
  );
}
