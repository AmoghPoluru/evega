import { SkeletonShell } from "./SkeletonShell";
import type { VendorLayoutProps } from "@/components/vendor/layouts/types";

/** Showcase skeleton: catalog-forward with wider containers. */
export function ShowcaseSkeleton(props: VendorLayoutProps) {
  return <SkeletonShell {...props} className="skeleton-showcase" />;
}
