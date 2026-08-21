import { getVendorStatus } from "@/lib/middleware/vendor-auth";
import { redirect } from "next/navigation";
import { CalmStatsCards } from "./components/CalmStatsCards";
import { DashboardHero } from "./components/DashboardHero";
import { RecentOrdersWidget } from "./components/RecentOrdersWidget";
import { QuickActionsCard } from "./components/QuickActionsCard";
import { OnboardingChecklist } from "./components/OnboardingChecklist";

export default async function VendorDashboardPage() {
  const vendorStatus = await getVendorStatus();

  if (!vendorStatus.hasVendor || vendorStatus.status !== "approved" || !vendorStatus.isActive) {
    redirect("/vendor/pending-approval");
  }

  const vendorName = vendorStatus.vendor?.name || "there";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <DashboardHero vendorName={vendorName} />
      <OnboardingChecklist />
      <CalmStatsCards />
      <RecentOrdersWidget />
      <QuickActionsCard />
    </div>
  );
}
