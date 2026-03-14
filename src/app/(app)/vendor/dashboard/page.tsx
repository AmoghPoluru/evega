import { getVendorStatus } from "@/lib/middleware/vendor-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export default async function VendorDashboardPage() {
  const vendorStatus = await getVendorStatus();

  // If no vendor or not approved, redirect (shouldn't happen due to layout, but safety check)
  if (!vendorStatus.hasVendor || vendorStatus.status !== "approved" || !vendorStatus.isActive) {
    redirect("/vendor/pending-approval");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back, {vendorStatus.vendor?.name || "Vendor"}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            <CardDescription className="text-xs">Active products in your store</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0</p>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <CardDescription className="text-xs">Orders received</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0</p>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
            <CardDescription className="text-xs">Total earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">$0</p>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            <CardDescription className="text-xs">Orders awaiting fulfillment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0</p>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Manage your vendor account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/vendor/products/new"
                className="block text-sm text-blue-600 hover:underline"
              >
                • Add New Product
              </a>
              <a
                href="/vendor/hero-banner"
                className="block text-sm text-blue-600 hover:underline"
              >
                • Customize Hero Banner
              </a>
              <a
                href="/vendor/orders"
                className="block text-sm text-blue-600 hover:underline"
              >
                • View Orders
              </a>
              <a
                href="/vendor/stripe-onboarding"
                className="block text-sm text-blue-600 hover:underline"
              >
                • Connect Stripe Account
              </a>
              <a
                href="/vendor/tasks"
                className="block text-sm text-blue-600 hover:underline"
              >
                • Support & Tasks (Ask BDO/Admin)
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Account</CardTitle>
            <CardDescription>Stripe Connect status</CardDescription>
          </CardHeader>
          <CardContent>
            {vendorStatus.vendor?.stripeAccountId ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="flex items-center gap-2">
                    {vendorStatus.vendor.stripeAccountStatus === "active" && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {vendorStatus.vendor.stripeAccountStatus === "pending" && (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    {(vendorStatus.vendor.stripeAccountStatus === "restricted" || 
                      vendorStatus.vendor.stripeAccountStatus === "rejected") && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium capitalize ${
                      vendorStatus.vendor.stripeAccountStatus === "active" 
                        ? "text-green-600" 
                        : vendorStatus.vendor.stripeAccountStatus === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}>
                      {vendorStatus.vendor.stripeAccountStatus || "not_connected"}
                    </span>
                  </div>
                </div>
                {vendorStatus.vendor.stripeAccountStatus !== "active" && (
                  <Link
                    href="/vendor/stripe-onboarding"
                    className="block text-sm text-blue-600 hover:underline mt-2"
                  >
                    Complete Setup →
                  </Link>
                )}
                {vendorStatus.vendor.stripeAccountStatus === "active" && (
                  <p className="text-xs text-green-600">
                    ✓ Your account is ready to receive payments
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">
                    Connect your Stripe account to receive payments directly.
                  </p>
                </div>
                <Link
                  href="/vendor/stripe-onboarding"
                  className="block text-sm text-blue-600 hover:underline mt-2"
                >
                  Connect Stripe Account →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
