import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { HydrateQueries } from "@/trpc/hydrate";
import { getQueryClient, trpc } from "@/trpc/server";

import { STAFF_ORDERS_DEFAULT_INPUT, StaffOrdersClient } from "./staff-orders-client";

export default async function StaffOrdersPage() {
  const queryClient = getQueryClient();
  const vendorOptions = trpc.admin.vendors.listOptions.queryOptions();
  const orders = trpc.admin.orders.list.queryOptions(STAFF_ORDERS_DEFAULT_INPUT);

  await Promise.all([
    queryClient.prefetchQuery(vendorOptions),
    queryClient.prefetchQuery(orders),
  ]);

  return (
    <HydrateQueries keys={[vendorOptions.queryKey, orders.queryKey]}>
      <Suspense fallback={<Skeleton className="m-6 h-64" />}>
        <StaffOrdersClient />
      </Suspense>
    </HydrateQueries>
  );
}
