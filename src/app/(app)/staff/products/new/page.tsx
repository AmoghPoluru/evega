import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { HydrateQueries } from "@/trpc/hydrate";
import { getQueryClient, trpc } from "@/trpc/server";

import { StaffNewProductClient } from "./staff-new-product-client";

export default async function StaffNewProductPage() {
  const queryClient = getQueryClient();
  const vendorOptions = trpc.admin.vendors.listOptions.queryOptions();

  await queryClient.prefetchQuery(vendorOptions);

  return (
    <HydrateQueries keys={[vendorOptions.queryKey]}>
      <Suspense fallback={<Skeleton className="m-6 h-96" />}>
        <StaffNewProductClient />
      </Suspense>
    </HydrateQueries>
  );
}
