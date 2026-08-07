import { z } from "zod";
import { getMonogramLetter } from "./vendor-words";

export const vendorLogoTextSchema = z.object({
  word1: z
    .string()
    .trim()
    .min(1, "Your brand initial is required")
    .transform(getMonogramLetter),
  word2: z.string().trim().optional(),
});

export const vendorLogoSelectSchema = z.object({
  templateId: z.string().min(1, "Please select a logo design"),
});

export const vendorLogoSourceSchema = z.object({
  source: z.enum(["upload", "template"]),
});
