import 'server-only';
import { dehydrate, HydrationBoundary, type QueryKey } from '@tanstack/react-query';

import { getQueryClient } from './server';

interface Props {
  /** Query keys to ship to the client, e.g. `trpc.auth.session.queryOptions().queryKey`. */
  keys: QueryKey[];
  children: React.ReactNode;
}

/**
 * Hydrates only the given queries from the request-scoped server query client,
 * so a boundary does not re-serialize data another boundary already sent.
 */
export function HydrateQueries({ keys, children }: Props) {
  const serializedKeys = new Set(keys.map((key) => JSON.stringify(key)));

  const state = dehydrate(getQueryClient(), {
    shouldDehydrateQuery: (query) => serializedKeys.has(JSON.stringify(query.queryKey)),
  });

  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
