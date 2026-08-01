"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  guestEmailSchema,
  guestShippingAddressSchema,
  type GuestShippingAddress,
} from "@/modules/checkout/guest-checkout-schema";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

const guestCheckoutFormSchema = z.object({
  guestEmail: guestEmailSchema,
  fullName: z.string().min(1, "Full name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State is required"),
  zipcode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format (e.g., 12345 or 12345-6789)"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string(),
});

type GuestCheckoutFormData = z.infer<typeof guestCheckoutFormSchema>;

export type GuestCheckoutData = {
  guestEmail: string;
  guestShippingAddress: GuestShippingAddress;
};

export type GuestCheckoutFormRef = {
  validate: () => Promise<GuestCheckoutData | null>;
};

export const GuestCheckoutForm = forwardRef<GuestCheckoutFormRef>(function GuestCheckoutForm(
  _props,
  ref
) {
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<GuestCheckoutFormData>({
    resolver: zodResolver(guestCheckoutFormSchema),
    defaultValues: {
      guestEmail: "",
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: "United States",
    },
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const valid = await trigger();
      if (!valid) return null;

      const values = getValues();
      return {
        guestEmail: values.guestEmail,
        guestShippingAddress: {
          fullName: values.fullName,
          street: values.street,
          city: values.city,
          state: values.state,
          zipcode: values.zipcode,
          phone: values.phone,
          country: values.country || "United States",
        },
      };
    },
  }));

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Contact &amp; delivery</h2>
      <p className="text-sm text-gray-600 mb-4">
        Checkout as a guest — no account required.{" "}
        <a href="/sign-in?redirect=/checkout" className="text-blue-600 hover:text-orange-600 hover:underline">
          Sign in
        </a>{" "}
        to use saved addresses.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register("guestEmail")}
            type="email"
            autoComplete="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.guestEmail && (
            <p className="text-xs text-red-600 mt-1">{errors.guestEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("fullName")}
            type="text"
            autoComplete="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.fullName && (
            <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="+1-555-123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street address <span className="text-red-500">*</span>
          </label>
          <input
            {...register("street")}
            type="text"
            autoComplete="street-address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.street && (
            <p className="text-xs text-red-600 mt-1">{errors.street.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            {...register("city")}
            type="text"
            autoComplete="address-level2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.city && (
            <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select
            {...register("state")}
            autoComplete="address-level1"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP code <span className="text-red-500">*</span>
          </label>
          <input
            {...register("zipcode")}
            type="text"
            autoComplete="postal-code"
            placeholder="12345 or 12345-6789"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.zipcode && (
            <p className="text-xs text-red-600 mt-1">{errors.zipcode.message}</p>
          )}
        </div>
      </div>
    </div>
  );
});
