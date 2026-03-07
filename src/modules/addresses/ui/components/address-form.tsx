"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

const addressFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  isDefault: z.boolean(),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State is required"),
  zipcode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format (e.g., 12345 or 12345-6789)"),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  address?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const isEditing = !!address;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: address || {
      label: "",
      isDefault: false,
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipcode: "",
    },
  });

  const addAddress = trpc.addresses.addAddress.useMutation();
  const updateAddress = trpc.addresses.updateAddress.useMutation();

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateAddress.mutateAsync({
          addressId: address.id,
          address: data,
        });
      } else {
        await addAddress.mutateAsync(data);
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? "Edit Address" : "Add New Address"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Label <span className="text-red-500">*</span>
          </label>
          <input
            {...register("label")}
            type="text"
            placeholder="e.g., Home, Work"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.label && (
            <p className="text-xs text-red-600 mt-1">{errors.label.message}</p>
          )}
        </div>

        {/* Default Checkbox */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register("isDefault")}
              type="checkbox"
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("fullName")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.fullName && (
            <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+1-555-123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Street */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            {...register("street")}
            type="text"
            placeholder="123 Main Street, Apt 4B"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.street && (
            <p className="text-xs text-red-600 mt-1">{errors.street.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            {...register("city")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.city && (
            <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select
            {...register("state")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Select state</option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>
          )}
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            {...register("zipcode")}
            type="text"
            placeholder="12345 or 12345-6789"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.zipcode && (
            <p className="text-xs text-red-600 mt-1">{errors.zipcode.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-orange-400 hover:bg-orange-500 text-gray-900"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Address" : "Add Address"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
