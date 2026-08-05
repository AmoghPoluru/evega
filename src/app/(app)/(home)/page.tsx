import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { getUserRole, hasVendor, isAppStaff } from "@/lib/access";
import { resolveUserVendor } from "@/lib/middleware/vendor-auth";
import { VendorSelection } from "@/components/vendor-selection";

export default async function Home() {
  const headersList = await headers();
  const payload = await getPayload({ config });
  const session = await payload.auth({ headers: headersList });
  const user = session.user;

  if (user) {
    if (isAppStaff(user)) {
      redirect("/staff/digital-marketing");
    }

    const vendor = await resolveUserVendor(payload, user, 0);

    if (vendor) {
      redirect("/vendor/dashboard");
    }

    if (hasVendor(user) || getUserRole(user) === "vendor") {
      redirect("/become-vendor");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <VendorSelection />
    </div>
  );
}
