import { z } from "zod";

/** Loose client input — preset-specific rules applied in normalizeVendorHappyBannerWords. */
export const vendorHappyBannerTextSchema = z.object({
  word1: z.string().trim().min(1, "Word 1 is required").max(40),
  word2: z.string().trim().min(1, "Word 2 is required").max(40),
});

export const vendorHappyBannerSelectSchema = z.object({
  bannerId: z.string().min(1, "Please select a banner"),
});

export const happyBannerPlatformSettingsSchema = z.object({
  enabled: z.boolean(),
});

const vendorWordSlotSchema = z.object({
  label: z.string().trim().min(1).max(24),
  hint: z.string().trim().min(1).max(120),
  defaultValue: z.string().trim().min(1).max(40),
});

const vendorWordsSchema = z.object({
  word1: vendorWordSlotSchema,
  word2: vendorWordSlotSchema,
});

const happyBannerFieldsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().trim().max(500).optional(),
  preset: z.enum(["mega-sale", "summer-sale", "hue-editorial", "tropical-hot-sale"]).default("mega-sale"),
  vendorWords: vendorWordsSchema.optional(),
  defaultWord1: z.string().trim().min(1).max(40).optional(),
  defaultWord2: z.string().trim().min(1).max(40).optional(),
  eyebrowText: z.string().trim().max(40).optional(),
  secondaryWord: z.string().trim().max(24).optional(),
  ctaLabel: z.string().trim().max(24).optional(),
  discountPrefix: z.string().trim().max(24).optional(),
  discountSuffix: z.string().trim().max(16).optional(),
  theme: z
    .object({
      backgroundColor: z.string().trim().min(4).max(16).optional(),
      accentYellow: z.string().trim().min(4).max(16).optional(),
      accentPink: z.string().trim().min(4).max(16).optional(),
    })
    .optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  previewImage: z.string().nullable().optional(),
});

export const happyBannerCreateSchema = happyBannerFieldsSchema;

export const happyBannerUpdateSchema = happyBannerFieldsSchema.partial().extend({
  id: z.string().min(1),
});
