import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreAppearancePageClient } from "./components/StoreAppearancePageClient";

export default function StoreAppearancePage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-96 w-full max-w-2xl" />}>
      <StoreAppearancePageClient />
    </Suspense>
  );
}
