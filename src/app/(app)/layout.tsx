import { TRPCReactProvider } from "@/trpc/client";
import { Navbar } from "./(home)/navbar/Navbar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { HydrateQueries } from "@/trpc/hydrate";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: Props) {
  const queryClient = getQueryClient();
  const sessionQuery = trpc.auth.session.queryOptions();

  await queryClient.prefetchQuery(sessionQuery);

  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <HydrateQueries keys={[sessionQuery.queryKey]}>
          <Navbar />
          {children}
          <ImpersonationBanner />
        </HydrateQueries>
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
