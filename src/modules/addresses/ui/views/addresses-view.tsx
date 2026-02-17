"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { AddressList } from "../components/address-list";
import { AddressForm } from "../components/address-form";
import { toast } from "sonner";

export function AddressesView({ userId }: { userId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const { data: user, refetch } = trpc.addresses.getUserAddresses.useQuery();
  const addresses = user?.shippingAddresses || [];

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingAddressId(null);
  };

  const handleEditClick = (addressId: string) => {
    setEditingAddressId(addressId);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingAddressId(null);
  };

  const handleSuccess = () => {
    setIsAdding(false);
    setEditingAddressId(null);
    refetch();
    toast.success("Address saved successfully");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Shipping Addresses</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your shipping addresses for faster checkout
          </p>
        </div>
        {!isAdding && !editingAddressId && (
          <Button
            onClick={handleAddClick}
            className="bg-orange-400 hover:bg-orange-500 text-gray-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingAddressId) && (
        <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <AddressForm
            address={editingAddressId ? addresses.find(a => a.id === editingAddressId) : undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Address List */}
      <AddressList
        addresses={addresses}
        onEdit={handleEditClick}
        onDelete={() => {
          refetch();
          toast.success("Address deleted");
        }}
        onSetDefault={() => {
          refetch();
          toast.success("Default address updated");
        }}
      />
    </div>
  );
}
