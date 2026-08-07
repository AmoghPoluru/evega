import { z } from "zod";

export const vendorLogoTextSchema = z.object({
  word1: z.string().trim().min(1, "Word 1 is required").max(24),
  word2: z.string().trim().min(1, "Word 2 is required").max(24),
});

export const vendorLogoSelectSchema = z.object({
  templateId: z.string().min(1, "Please select a logo design"),
});

export const vendorLogoSourceSchema = z.object({
  source: z.enum(["upload", "template"]),
});
