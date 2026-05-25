import { requireAppAdmin } from "@/lib/middleware/admin-auth";
import { StaffDigitalMarketingPageClient } from "./components/StaffDigitalMarketingPageClient";

export default async function StaffDigitalMarketingPage() {
  await requireAppAdmin("/staff/digital-marketing");

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Digital Marketing</h1>
        <p className="mt-1 text-sm text-gray-600">
          Select a vendor to manage their social accounts and community marketing channels.
        </p>
      </div>

      <StaffDigitalMarketingPageClient />
    </div>
  );
}
