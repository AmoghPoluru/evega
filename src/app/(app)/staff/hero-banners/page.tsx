import { StaffHappyBannersTable } from "./components/StaffHappyBannersTable";

export default function StaffHappyBannerPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Happy Banners</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage banner designs in the catalog. Vendors pick a design, then enter Word 1 and Word 2
          on their own.
        </p>
      </div>

      <StaffHappyBannersTable />
    </div>
  );
}
