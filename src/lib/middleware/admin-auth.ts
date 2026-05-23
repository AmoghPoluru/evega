import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { isAppStaff } from "@/lib/access";

/**
 * Require app admin (super admin / BDO)
 * - Redirects to sign-in if not authenticated
 * - Redirects to home if not admin
 */
export async function requireAppAdmin(redirectTo: string = "/staff/tasks") {
  const headersList = await headers();
  const payload = await getPayload({ config });
  const session = await payload.auth({ headers: headersList });

  if (!session.user) {
    redirect(`/sign-in?redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (!isAppStaff(session.user)) {
    redirect("/");
  }

  return {
    user: session.user,
  };
}

