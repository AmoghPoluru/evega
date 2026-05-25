import { getVendorStatus } from "@/lib/middleware/vendor-auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { StatsCards } from "./components/StatsCards";
import { VendorLogoCard } from "./components/VendorLogoCard";
import { DigitalMarketingForm } from "./components/DigitalMarketingForm";

export default async function VendorDashboardPage() {
  const vendorStatus = await getVendorStatus();

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

      <div className="mt-6 max-w-2xl space-y-6">
        <VendorLogoCard />
        <DigitalMarketingForm />
      </div>

      <Card className="mt-6 max-w-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
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
