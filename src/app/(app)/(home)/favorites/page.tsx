import { Suspense } from "react";

import { getCachedSession } from "@/lib/auth-server";
import { HydrateQueries } from "@/trpc/hydrate";
import { getQueryClient, trpc } from "@/trpc/server";

import { FavoritesClient } from "./favorites-client";
import { FavoritesSkeleton } from "./favorites-states";

export default async function FavoritesPage() {
  const session = await getCachedSession();

  if (!session.user) {
    return <FavoritesClient />;
  }

  const queryClient = getQueryClient();
  const favoritesQuery = trpc.productInteractions.favorites.list.queryOptions();

  await queryClient.prefetchQuery(favoritesQuery);

  return (
    <HydrateQueries keys={[favoritesQuery.queryKey]}>
      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesClient />
      </Suspense>
    </HydrateQueries>
  );
}
