import { StaffHappyBannerForm } from "../../components/StaffHappyBannerForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StaffEditHappyBannerPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit banner design</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update the design catalog entry. Vendor word values are not edited here.
        </p>
      </div>
      <StaffHappyBannerForm bannerId={id} />
    </div>
  );
}
