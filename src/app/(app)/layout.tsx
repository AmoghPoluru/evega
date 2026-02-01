import { TRPCReactProvider } from "@/trpc/client";

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
}
