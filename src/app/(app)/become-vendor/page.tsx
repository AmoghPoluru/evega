import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/auth-server";
import { HydrateQueries } from "@/trpc/hydrate";
import { getQueryClient, trpc } from "@/trpc/server";

import { BecomeVendorClient, BecomeVendorSkeleton } from "./become-vendor-client";

export default async function BecomeVendorPage() {
  const session = await getCachedSession();

  if (!session.user) {
    redirect("/sign-in?redirect=/become-vendor");
  }

  const queryClient = getQueryClient();
  const statusQuery = trpc.vendor.getStatus.queryOptions();

  await queryClient.prefetchQuery(statusQuery);

  return (
    <HydrateQueries keys={[statusQuery.queryKey]}>
      <Suspense fallback={<BecomeVendorSkeleton />}>
        <BecomeVendorClient />
      </Suspense>
    </HydrateQueries>
  );
}
