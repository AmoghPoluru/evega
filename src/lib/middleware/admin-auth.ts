import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAppStaff } from "@/lib/access";
import { getCachedSession } from "@/lib/auth-server";

/**
 * Require app admin (super admin / BDO)
 * - Redirects to sign-in if not authenticated
 * - Redirects to home if not admin
 */
export async function requireAppAdmin(fallbackPath: string = "/staff/products") {
  const headersList = await headers();
  const session = await getCachedSession();

  if (!session.user) {
    const returnTo =
      headersList.get("x-pathname")?.trim() || fallbackPath;
    redirect(`/sign-in?redirect=${encodeURIComponent(returnTo)}`);
  }

  if (!isAppStaff(session.user)) {
    redirect("/");
  }

  return {
    user: session.user,
  };
}

