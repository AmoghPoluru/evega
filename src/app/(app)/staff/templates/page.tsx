import { requireAppAdmin } from "@/lib/middleware/admin-auth";
import { StaffTemplatesPanel } from "./components/StaffTemplatesPanel";

export default async function StaffTemplatesPage() {
  await requireAppAdmin("/staff/templates");

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Template Approvals</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vendor-built storefront templates awaiting review. Approving a template makes it global
          and selectable by every vendor.
        </p>
      </div>

      <StaffTemplatesPanel />
    </div>
  );
}
