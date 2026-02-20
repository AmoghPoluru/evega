"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorRegistrationForm } from "@/modules/vendor/ui/components/vendor-registration-form";
import { trpc } from "@/trpc/client";

export default function BecomeVendorPage() {
  const router = useRouter();
  const { data: session } = trpc.auth.session.useQuery();
  const { data: status, isLoading } = trpc.vendor.getStatus.useQuery(undefined, {
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (session !== undefined && !session?.user) {
      router.replace("/sign-in?redirect=/become-vendor");
    }
  }, [session, router]);

  if (!session?.user || isLoading) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Approved and active vendor - redirect or show message
  if (status?.hasVendor && status?.status === "approved" && status?.isActive) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              You&apos;re a Vendor
            </CardTitle>
            <CardDescription>
              You are already an approved vendor. Visit the vendor dashboard to manage your products and orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/vendor/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Go to Vendor Dashboard
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending approval
  if (status?.hasVendor && status?.status === "pending") {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Request Pending
            </CardTitle>
            <CardDescription>
              Your vendor application is under review. We&apos;ll notify you once it&apos;s approved. This usually takes 1-2 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              In the meantime, you can continue shopping. You&apos;ll receive an email when your vendor account is ready.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No vendor or rejected - show registration form
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-6 w-6" />
            Become a Vendor
          </CardTitle>
          <CardDescription>
            Sell your products on our marketplace. Fill out the form below to apply. We&apos;ll review your application and get back to you within 1-2 business days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VendorRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
