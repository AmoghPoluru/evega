import { SkeletonShell } from "./SkeletonShell";
import type { VendorLayoutProps } from "@/components/vendor/layouts/types";

/** Editorial skeleton: generous whitespace and media-led vertical flow. */
export function EditorialSkeleton(props: VendorLayoutProps) {
  return <SkeletonShell {...props} className="skeleton-editorial" />;
}
