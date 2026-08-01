import { z } from "zod";

/** Mirrors manual-order shipping fields for consistent validation. */
export const guestShippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State is required"),
  zipcode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format (e.g., 12345 or 12345-6789)"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().optional().default("United States"),
});

export type GuestShippingAddress = z.infer<typeof guestShippingAddressSchema>;

export const guestEmailSchema = z.string().email("Valid email is required");
