import { SkeletonShell } from "./SkeletonShell";
import type { VendorLayoutProps } from "@/components/vendor/layouts/types";

/** Classic skeleton: sticky top nav rhythm, contained sections. */
export function ClassicSkeleton(props: VendorLayoutProps) {
  return <SkeletonShell {...props} className="skeleton-classic" />;
}
