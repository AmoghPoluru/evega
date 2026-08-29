import { requireAppAdmin } from "@/lib/middleware/admin-auth";
import { StaffPostToSocialPageClient } from "./components/StaffPostToSocialPageClient";

export default async function StaffPostToSocialPage() {
  await requireAppAdmin("/staff/post-to-social");

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Post to social</h1>
        <p className="mt-1 text-sm text-gray-600">
          Select a vendor, connect Instagram / WhatsApp for them, then post product
          photos the same way as vendor Post to social media.
        </p>
      </div>

      <StaffPostToSocialPageClient />
    </div>
  );
}
