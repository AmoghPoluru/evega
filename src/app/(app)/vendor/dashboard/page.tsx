import { getVendorStatus } from "@/lib/middleware/vendor-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Manage your vendor account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              • Add Products (Coming soon)
            </p>
            <p className="text-sm text-gray-600">
              • View Orders (Coming soon)
            </p>
            <p className="text-sm text-gray-600">
              • Manage Settings (Coming soon)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
