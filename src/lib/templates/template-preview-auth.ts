import { headers } from "next/headers";
import type { Payload } from "payload";
import { getVendorId, isAppStaff } from "@/lib/access";
import type { User } from "@/payload-types";

/** Whether the current user may preview another template on their vendor storefront. */
export async function canPreviewVendorTemplate(
  payload: Payload,
  vendorId: string,
): Promise<boolean> {
  const headersList = await headers();
  const session = await payload.auth({ headers: headersList });
  const user = session.user as User | undefined;
  if (!user) return false;
  if (isAppStaff(user)) return true;
  const sessionVendorId = getVendorId(user);
  return sessionVendorId === vendorId;
}
