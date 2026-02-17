"use client";

import { Edit, Trash2, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddressCardProps {
  address: {
    id: string;
    label: string;
    isDefault?: boolean;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipcode: string;
  };
  onEdit: (addressId: string) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <div
      className={`border-2 rounded-lg p-4 ${
        address.isDefault
          ? "border-orange-500 bg-orange-50"
          : "border-gray-300 bg-white"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{address.label}</h3>
          {address.isDefault && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded">
              <Check className="w-3 h-3" />
              Default
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(address.id)}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(address.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1 text-sm text-gray-700">
        <p className="font-medium">{address.fullName}</p>
        <p>{address.street}</p>
        <p>
          {address.city}, {address.state} {address.zipcode}
        </p>
        <p className="text-gray-600">{address.phone}</p>
      </div>

      {!address.isDefault && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address.id)}
            className="text-xs"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Set as Default
          </Button>
        </div>
      )}
    </div>
  );
}
