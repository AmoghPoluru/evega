import { z } from "zod";

export const happyBannerPresetSchema = z.enum([
  "marquee-max",
  "kinetic-wall",
  "crossfire",
  "gravity-well",
  "confetti",
  "liquid-ribbon",
]);

export const motionIntensitySchema = z.enum(["calm", "lively", "showcase"]);
export const productSourceSchema = z.enum(["all-active", "newest", "best-sellers", "manual"]);
export const bannerDirectionSchema = z.enum(["ltr", "rtl"]);
export const backgroundModeSchema = z.enum(["auto-palette", "image", "gradient", "theme-token"]);

export const vendorOverrideSchema = z.object({
  vendor: z.string().optional(),
  enabled: z.boolean().optional(),
  preset: happyBannerPresetSchema.optional(),
  intensity: motionIntensitySchema.optional(),
  productSource: productSourceSchema.optional(),
  manualProducts: z.array(z.string()).optional(),
  backgroundImage: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const heroBannerConfigSchema = z.object({
  enabled: z.boolean().optional(),
  productSource: productSourceSchema.optional(),
  maxTiles: z.number().min(4).max(60).optional(),
  shuffleWindow: z.boolean().optional(),
  preset: happyBannerPresetSchema.optional(),
  height: z.number().min(220).max(640).optional(),
  tileSize: z.number().min(56).max(200).optional(),
  intensity: motionIntensitySchema.optional(),
  speed: z.number().min(0.25).max(3).optional(),
  direction: bannerDirectionSchema.optional(),
  pauseOnHover: z.boolean().optional(),
  spotlightEnabled: z.boolean().optional(),
  spotlightIntervalMs: z.number().min(3000).max(30000).optional(),
  particles: z.boolean().optional(),
  backgroundMode: backgroundModeSchema.optional(),
  backgroundImage: z.string().optional().nullable(),
  gradientFrom: z.string().optional(),
  gradientTo: z.string().optional(),
  scrimOpacity: z.number().min(0).max(1).optional(),
  vendorEditableFields: z.array(z.enum(["header", "tagline"])).optional(),
  vendorOverrides: z.array(vendorOverrideSchema).optional(),
});

export const vendorBannerTextSchema = z.object({
  header: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(90).optional().nullable(),
});

export type HeroBannerConfigInput = z.infer<typeof heroBannerConfigSchema>;
export type VendorBannerTextInput = z.infer<typeof vendorBannerTextSchema>;
