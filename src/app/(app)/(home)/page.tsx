import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserRole, hasVendor, isAppStaff } from "@/lib/access";
import { getCachedPayload } from "@/lib/payload-client";
import { resolveUserVendor } from "@/lib/middleware/vendor-auth";
import { VendorSelection, VendorSelectionSkeleton } from "@/components/vendor-selection";
import { HydrateQueries } from "@/trpc/hydrate";
import { getQueryClient, trpc } from "@/trpc/server";

const VENDOR_LIST_INPUT = { limit: 50 } as const;

async function VendorSelectionSection() {
  const queryClient = getQueryClient();
  const vendorList = trpc.vendor.list.queryOptions(VENDOR_LIST_INPUT);
  const session = trpc.auth.session.queryOptions();

  await Promise.all([
    queryClient.prefetchQuery(vendorList),
    queryClient.prefetchQuery(session),
  ]);

  return (
    <HydrateQueries keys={[vendorList.queryKey, session.queryKey]}>
      <VendorSelection />
    </HydrateQueries>
  );
}

export default async function Home() {
  const headersList = await headers();
  const payload = await getCachedPayload();
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
      <Suspense fallback={<VendorSelectionSkeleton />}>
        <VendorSelectionSection />
      </Suspense>
    </div>
  );
}
