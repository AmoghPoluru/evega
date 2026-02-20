"use client";

import Link from "next/link";
import { MapPin, ChevronDown } from "lucide-react";
import { trpc } from "@/trpc/client";

export function DeliverySection() {
  const { data: user } = trpc.addresses.getUserAddresses.useQuery();
  const defaultAddress = user?.shippingAddresses?.find(
    (addr: any) => addr.isDefault
  ) || user?.shippingAddresses?.[0];

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Delivering to {defaultAddress?.fullName || "Guest"}
          </h2>
          {defaultAddress ? (
            <div className="space-y-1 text-sm text-gray-700">
              <p>{defaultAddress.street}</p>
              <p>
                {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipcode}
              </p>
              <p>{defaultAddress.phone}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No address on file</p>
          )}
        </div>
        <Link
          href="/account?tab=addresses"
          className="text-blue-600 hover:text-orange-600 hover:underline text-sm font-medium"
        >
          Change
        </Link>
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-200">
        <Link
          href="#"
          className="text-sm text-blue-600 hover:text-orange-600 hover:underline block"
        >
          Add delivery instructions
        </Link>
        <Link
          href="#"
          className="text-sm text-blue-600 hover:text-orange-600 hover:underline flex items-center gap-1"
        >
          FREE pickup available nearby
          <ChevronDown className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
