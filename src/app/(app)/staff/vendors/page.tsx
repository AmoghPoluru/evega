import { StaffVendorsTable } from "./components/StaffVendorsTable";

export default function StaffVendorsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage vendor profiles, approval status, storefront templates, payments, and WhatsApp
          settings from the admin dashboard.
        </p>
      </div>

      <StaffVendorsTable />
    </div>
  );
}
