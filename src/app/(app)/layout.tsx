import { TRPCReactProvider } from "@/trpc/client";
import { Navbar } from "./(home)/navbar/Navbar";
import { NuqsAdapter } from "nuqs/adapters/next/app";

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <Navbar />
        {children}
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
