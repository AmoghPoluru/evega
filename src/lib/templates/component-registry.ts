/**
 * Template Component Registry
 * Maps template component names to actual React components
 */

import type { ComponentType } from "react";

import { DefaultLayout } from "@/components/vendor/layouts/DefaultLayout";
import { ReloopLayout } from "@/components/vendor/layouts/ReloopLayout";
import { EmporiumLayout } from "@/components/vendor/layouts/EmporiumLayout";
import { RunwayLayout } from "@/components/vendor/layouts/RunwayLayout";
import { CollectionLayout } from "@/components/vendor/layouts/CollectionLayout";
import type { VendorLayoutProps } from "@/components/vendor/layouts/types";

/**
 * Structural layout registry
 * Maps a template's `layout` identifier to a full storefront layout component.
 */
const layoutRegistry: Record<string, ComponentType<VendorLayoutProps>> = {
  default: DefaultLayout,
  reloop: ReloopLayout,
  emporium: EmporiumLayout,
  runway: RunwayLayout,
  collection: CollectionLayout,
};

/**
 * Get a storefront layout component by its `layout` identifier.
 * Falls back to DefaultLayout for unknown or missing identifiers.
 */
export function getLayout(name?: string | null): ComponentType<VendorLayoutProps> {
  if (name && layoutRegistry[name]) {
    return layoutRegistry[name];
  }
  return DefaultLayout;
}

/**
 * Register a new layout at runtime.
 */
export function registerLayout(
  name: string,
  component: ComponentType<VendorLayoutProps>
): void {
  layoutRegistry[name] = component;
}

/**
 * List all registered layout identifiers.
 */
export function getLayoutNames(): string[] {
  return Object.keys(layoutRegistry);
}

// Placeholder component types - these will be implemented in Phase 5
export interface HeroBannerProps {
  vendor: any;
  banner?: any;
  template?: any;
}

export interface ProductCardProps {
  product: any;
  template?: any;
  customization?: any;
}

// Component registry structure
// Components will be implemented in Phase 5
const componentRegistry: {
  "hero-banner": Record<string, ComponentType<HeroBannerProps>>;
  "product-card": Record<string, ComponentType<ProductCardProps>>;
  "navigation": Record<string, ComponentType<any>>;
  "footer": Record<string, ComponentType<any>>;
} = {
  "hero-banner": {},
  "product-card": {},
  "navigation": {},
  "footer": {},
};

/**
 * Get component by name and variant
 */
export function getComponent(
  componentName: keyof typeof componentRegistry,
  variant: string
): ComponentType<any> | null {
  return componentRegistry[componentName]?.[variant] || null;
}

/**
 * Register a component variant
 */
export function registerComponent(
  componentName: keyof typeof componentRegistry,
  variant: string,
  component: ComponentType<any>
): void {
  if (!componentRegistry[componentName]) {
    componentRegistry[componentName] = {};
  }
  componentRegistry[componentName][variant] = component;
}

/**
 * Get all variants for a component
 */
export function getComponentVariants(componentName: keyof typeof componentRegistry): string[] {
  return Object.keys(componentRegistry[componentName] || {});
}
