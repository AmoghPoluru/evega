import { Suspense } from "react";

import { getCachedSession } from "@/lib/auth-server";
import { HydrateQueries } from "@/trpc/hydrate";
import { getQueryClient, trpc } from "@/trpc/server";

import { OrderDetailClient } from "./order-detail-client";
import { OrderDetailSkeleton } from "./order-detail-states";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getCachedSession();

  // Guests open the order through an emailed link and are resolved client-side
  // from the `email` search param, so there is nothing to prefetch for them.
  if (!session.user) {
    return (
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetailClient id={id} />
      </Suspense>
    );
  }

  const queryClient = getQueryClient();
  const orderQuery = trpc.orders.getOneForUser.queryOptions({ id });

  await queryClient.prefetchQuery(orderQuery);

  return (
    <HydrateQueries keys={[orderQuery.queryKey]}>
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetailClient id={id} />
      </Suspense>
    </HydrateQueries>
  );
}
