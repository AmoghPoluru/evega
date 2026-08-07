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

  await queryClient.prefetchQuery(vendorList);

  return (
    <HydrateQueries keys={[vendorList.queryKey]}>
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

  const queryClient = getQueryClient();
  // The navbar and impersonation banner live in the parent layout, so their
  // queries have to be hydrated in the first flush — anything dehydrated inside
  // the streamed Suspense boundary below arrives after they have already
  // mounted and fetched.
  const authSession = trpc.auth.session.queryOptions();
  const impersonationStatus = trpc.admin.users.impersonationStatus.queryOptions();

  await Promise.all([
    queryClient.prefetchQuery(authSession),
    queryClient.prefetchQuery(impersonationStatus),
  ]);

  return (
    <HydrateQueries keys={[authSession.queryKey, impersonationStatus.queryKey]}>
      <div className="flex flex-col min-h-screen bg-background">
        <Suspense fallback={<VendorSelectionSkeleton />}>
          <VendorSelectionSection />
        </Suspense>
      </div>
    </HydrateQueries>
  );
}
