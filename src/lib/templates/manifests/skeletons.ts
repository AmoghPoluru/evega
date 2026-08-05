import type { StorefrontSkeleton } from "./types";

/** Maps legacy layout registry keys to their structural skeleton. */
export const LEGACY_LAYOUT_TO_SKELETON: Record<string, StorefrontSkeleton> = {
  default: "classic",
  reloop: "classic",
  emporium: "showcase",
  runway: "editorial",
  modular: "classic",
};

export const SKELETON_LABELS: Record<StorefrontSkeleton, string> = {
  classic: "Classic",
  editorial: "Editorial",
  showcase: "Showcase",
  dense: "Dense",
};

export const SKELETON_DESCRIPTIONS: Record<StorefrontSkeleton, string> = {
  classic: "Sticky top nav, full-width hero, contained product grid",
  editorial: "Oversized type, asymmetric bands, media-led presentation",
  showcase: "Catalog-forward layout with filter emphasis and large imagery",
  dense: "Compact nav, tight multi-column grid, minimal chrome",
};

export function resolveSkeletonFromLayout(layout: string): StorefrontSkeleton {
  return LEGACY_LAYOUT_TO_SKELETON[layout] ?? "classic";
}
