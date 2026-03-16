/**
 * Template Component Registry
 * Maps template component names to actual React components
 */

import type { ComponentType } from "react";

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
