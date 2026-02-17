"use client";

import { trpc } from "@/trpc/client";
import { AddressCard } from "./address-card";
import { toast } from "sonner";
import { InboxIcon } from "lucide-react";

interface AddressListProps {
  addresses: any[];
  onEdit: (addressId: string) => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export function AddressList({
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressListProps) {
  const deleteAddress = trpc.addresses.deleteAddress.useMutation();
  const setDefaultAddress = trpc.addresses.setDefaultAddress.useMutation();

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await deleteAddress.mutateAsync({ addressId });
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress.mutateAsync({ addressId });
      onSetDefault();
    } catch (error: any) {
      toast.error(error.message || "Failed to set default address");
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <InboxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No addresses saved</p>
        <p className="text-sm text-gray-500">
          Add your first shipping address to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={onEdit}
          onDelete={() => handleDelete(address.id)}
          onSetDefault={() => handleSetDefault(address.id)}
        />
      ))}
    </div>
  );
}
