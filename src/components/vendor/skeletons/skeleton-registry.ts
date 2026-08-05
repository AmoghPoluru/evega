import type { ComponentType } from "react";

import type { StorefrontSkeleton } from "@/lib/templates/manifests/types";
import type { VendorLayoutProps } from "@/components/vendor/layouts/types";
import { ClassicSkeleton } from "./ClassicSkeleton";
import { EditorialSkeleton } from "./EditorialSkeleton";
import { ShowcaseSkeleton } from "./ShowcaseSkeleton";
import { DenseSkeleton } from "./DenseSkeleton";

const skeletonRegistry: Record<StorefrontSkeleton, ComponentType<VendorLayoutProps>> = {
  classic: ClassicSkeleton,
  editorial: EditorialSkeleton,
  showcase: ShowcaseSkeleton,
  dense: DenseSkeleton,
};

export function getSkeleton(name?: string | null): ComponentType<VendorLayoutProps> {
  if (name && name in skeletonRegistry) {
    return skeletonRegistry[name as StorefrontSkeleton];
  }
  return ClassicSkeleton;
}

export function getSkeletonNames(): StorefrontSkeleton[] {
  return Object.keys(skeletonRegistry) as StorefrontSkeleton[];
}
