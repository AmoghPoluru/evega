import { getVendorStatus } from "@/lib/middleware/vendor-auth";
import { redirect } from "next/navigation";
import { StatsCards } from "./components/StatsCards";
import { DashboardGreeting } from "./components/DashboardGreeting";
import { RecentOrdersWidget } from "./components/RecentOrdersWidget";
import { QuickActionsCard } from "./components/QuickActionsCard";
import { OnboardingChecklist } from "./components/OnboardingChecklist";

export default async function VendorDashboardPage() {
  const vendorStatus = await getVendorStatus();

  if (!vendorStatus.hasVendor || vendorStatus.status !== "approved" || !vendorStatus.isActive) {
    redirect("/vendor/pending-approval");
  }

  const vendorName = vendorStatus.vendor?.name || "Vendor";

  return (
    <div className="p-6 space-y-6">
      <DashboardGreeting vendorName={vendorName} />

      <StatsCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentOrdersWidget />
        </div>
        <div className="space-y-6">
          <QuickActionsCard />
          <OnboardingChecklist />
        </div>
      </div>
    </div>
  );
}
