import { TRPCReactProvider } from "@/trpc/client";
import { Navbar } from "./(home)/navbar/Navbar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ImpersonationBanner } from "@/components/impersonation-banner";

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <Navbar />
        {children}
        <ImpersonationBanner />
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
