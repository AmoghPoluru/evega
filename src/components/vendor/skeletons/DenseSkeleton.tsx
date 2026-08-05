import { SkeletonShell } from "./SkeletonShell";
import type { VendorLayoutProps } from "@/components/vendor/layouts/types";

/** Dense skeleton: compact rhythm for long catalogs. */
export function DenseSkeleton(props: VendorLayoutProps) {
  return <SkeletonShell {...props} className="skeleton-dense" />;
}
