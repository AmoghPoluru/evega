// @ts-expect-error - Next.js navigation module works at runtime with NodeNext resolution
import { redirect } from "next/navigation";

import { caller } from "@/trpc/server";

import { SignInView } from "@/modules/auth/ui/views/sign-in-view";

export const dynamic = "force-dynamic";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) => {
  const session = await caller.auth.session();
  const params = await searchParams;
  const redirectTo = params.redirect || "/";

  if (session.user) {
    // If already logged in, redirect to the intended page
    redirect(redirectTo);
  }

  return <SignInView />
}
 
export default Page;
