import { StaffHappyBannerForm } from "../components/StaffHappyBannerForm";

export default function StaffNewHappyBannerPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create banner design</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set up the visual design and fixed copy. Vendors will pick this banner and enter their own
          Word 1 and Word 2.
        </p>
      </div>
      <StaffHappyBannerForm />
    </div>
  );
}
