import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { AccountView } from "@/modules/addresses/ui/views/account-view";

function AccountViewSkeleton() {
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-8 bg-gray-300 rounded w-48 mb-8 animate-pulse" />
        <div className="h-12 bg-gray-300 rounded mb-6 animate-pulse" />
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <div className="h-6 bg-gray-300 rounded w-32 mb-4 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AccountPage() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const user = await payload.auth({ headers });

  if (!user?.user) {
    redirect("/sign-in?redirect=/account");
  }

  return (
    <Suspense fallback={<AccountViewSkeleton />}>
      <AccountView userId={user.user.id} />
    </Suspense>
  );
}
