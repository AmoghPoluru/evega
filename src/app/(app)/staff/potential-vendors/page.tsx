import { requireAppAdmin } from "@/lib/middleware/admin-auth";
import { StaffPotentialVendorsPanel } from "./components/StaffPotentialVendorsPanel";

export default async function StaffPotentialVendorsPage() {
  await requireAppAdmin("/staff/potential-vendors");

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Potential Vendors</h1>
        <p className="mt-1 text-sm text-gray-600">
          List of regions and potential vendor names. Use Add a row to build the list.
        </p>
      </div>

      <StaffPotentialVendorsPanel />
    </div>
  );
}
