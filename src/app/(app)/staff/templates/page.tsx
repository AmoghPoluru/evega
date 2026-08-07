import { StaffTemplatesTable } from "./components/StaffTemplatesTable";

export default function StaffTemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and update storefront templates available to vendors. Changes apply to new
          customizations and vendors using each template.
        </p>
      </div>

      <StaffTemplatesTable />
    </div>
  );
}
