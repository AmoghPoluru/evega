import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { HydrateQueries } from "@/trpc/hydrate";
import { getQueryClient, trpc } from "@/trpc/server";

import { STAFF_PRODUCTS_DEFAULT_INPUT, StaffProductsClient } from "./staff-products-client";

export default async function StaffProductsPage() {
  const queryClient = getQueryClient();
  const vendorOptions = trpc.admin.vendors.listOptions.queryOptions();
  const products = trpc.admin.products.list.queryOptions(STAFF_PRODUCTS_DEFAULT_INPUT);

  await Promise.all([
    queryClient.prefetchQuery(vendorOptions),
    queryClient.prefetchQuery(products),
  ]);

  return (
    <HydrateQueries keys={[vendorOptions.queryKey, products.queryKey]}>
      <Suspense fallback={<Skeleton className="m-6 h-64" />}>
        <StaffProductsClient />
      </Suspense>
    </HydrateQueries>
  );
}
