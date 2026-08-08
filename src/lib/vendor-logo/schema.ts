import { z } from "zod";

/** Client form values — server applies monogram vs wordmark rules from the selected preset. */
export const vendorLogoTextSchema = z.object({
  word1: z.string().trim().min(1, "Brand text is required").max(40),
  word2: z.string().trim().max(40).optional(),
});

export const vendorLogoSelectSchema = z.object({
  templateId: z.string().min(1, "Please select a logo design"),
});

export const vendorLogoSourceSchema = z.object({
  source: z.enum(["upload", "template"]),
});
