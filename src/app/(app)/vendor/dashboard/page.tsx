import { getVendorStatus } from "@/lib/middleware/vendor-auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { GoShoppingButton } from "@/components/go-shopping-button";
import { StatsCards } from "./components/StatsCards";
import { VendorLogoCard } from "./components/VendorLogoCard";
import { DigitalMarketingForm } from "./components/DigitalMarketingForm";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";

export default async function VendorDashboardPage() {
  const vendorStatus = await getVendorStatus();

  if (!vendorStatus.hasVendor || vendorStatus.status !== "approved" || !vendorStatus.isActive) {
    redirect("/vendor/pending-approval");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">{vendorPageTitles.dashboard}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {vendorStatus.vendor?.name || "Vendor"}!
        </p>
      </div>

      <StatsCards />

      <div className="mt-6 max-w-2xl space-y-6">
        <VendorLogoCard />
        <DigitalMarketingForm />
      </div>

      <Card className="mt-6 max-w-2xl bg-accent">
        <CardContent className="pt-6">
          <GoShoppingButton size="lg" className="w-full text-base" />
        </CardContent>
      </Card>
    </div>
  );
}
