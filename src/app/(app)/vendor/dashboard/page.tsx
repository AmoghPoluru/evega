import { getVendorStatus } from "@/lib/middleware/vendor-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, AlertCircle, ShoppingBag } from "lucide-react";
import { StatsCards } from "./components/StatsCards";

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

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Prominent Go Shopping Card */}
      <Card className="mt-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <a
            href="https://evegasupplier-ind.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <ShoppingBag className="h-6 w-6" />
            <span>Go Shopping</span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
