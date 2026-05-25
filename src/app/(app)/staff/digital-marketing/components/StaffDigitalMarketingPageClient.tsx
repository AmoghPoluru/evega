"use client";

import { useState } from "react";

import { DigitalMarketingForm } from "@/app/(app)/vendor/dashboard/components/DigitalMarketingForm";
import { trpc } from "@/trpc/client";

import { StaffVendorSelect } from "./StaffVendorSelect";

export function StaffDigitalMarketingPageClient() {
  const [vendorId, setVendorId] = useState<string | undefined>();
  const { data: vendors } = trpc.admin.vendors.listOptions.useQuery();

  const vendorName = vendors?.find(
    (v: { id: string; name: string }) => v.id === vendorId
  )?.name;

  return (
    <div className="space-y-6">
      <StaffVendorSelect value={vendorId} onValueChange={(id) => setVendorId(id)} />

      {vendorId ? (
        <DigitalMarketingForm
          key={vendorId}
          mode="staff"
          vendorId={vendorId}
          vendorName={vendorName}
        />
      ) : (
        <p className="text-sm text-gray-500">Select a vendor to view and edit digital marketing.</p>
      )}
    </div>
  );
}
