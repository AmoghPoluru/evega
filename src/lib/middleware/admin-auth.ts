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
export async function requireAppAdmin(fallbackPath: string = "/staff/products") {
  const headersList = await headers();
  const payload = await getPayload({ config });
  const session = await payload.auth({ headers: headersList });

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

