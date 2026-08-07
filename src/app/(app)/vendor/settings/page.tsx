import { getVendorStatus } from "@/lib/middleware/vendor-auth";
import { redirect } from "next/navigation";
import { VendorLogoTemplateClient } from "./components/VendorLogoTemplateClient";
import { DigitalMarketingForm } from "../dashboard/components/DigitalMarketingForm";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";

export default async function VendorSettingsPage() {
  const vendorStatus = await getVendorStatus();

  if (!vendorStatus.hasVendor || vendorStatus.status !== "approved" || !vendorStatus.isActive) {
    redirect("/vendor/pending-approval");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{vendorPageTitles.settings}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your store logo, social channels, and marketing integrations.
        </p>
      </div>

      <div className="space-y-6">
        <VendorLogoTemplateClient />
        <DigitalMarketingForm />
      </div>
    </div>
  );
}
