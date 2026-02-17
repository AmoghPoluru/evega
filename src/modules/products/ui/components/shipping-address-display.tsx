"use client";

import Link from "next/link";
import { MapPin, Edit } from "lucide-react";
import { trpc } from "@/trpc/client";

export function ShippingAddressDisplay() {
  const { data: user } = trpc.addresses.getUserAddresses.useQuery();

  const defaultAddress = user?.shippingAddresses?.find(
    (addr: any) => addr.isDefault
  ) || user?.shippingAddresses?.[0];

  if (!defaultAddress) {
    return (
      <div className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer hover:text-orange-600">
        <MapPin className="w-4 h-4" />
        <Link href="/account?tab=addresses" className="hover:underline">
          Add shipping address
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 text-sm">
      <MapPin className="w-4 h-4 mt-0.5 text-gray-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-600">Delivering to</span>
          <Link
            href="/account?tab=addresses"
            className="text-blue-600 hover:text-orange-600 hover:underline flex items-center gap-1"
          >
            <span className="font-medium">
              {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipcode}
            </span>
            <Edit className="w-3 h-3" />
          </Link>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">
          {defaultAddress.street}
        </p>
      </div>
    </div>
  );
}
