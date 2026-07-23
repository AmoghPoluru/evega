import { z } from "zod";
import type { BasePayload } from "payload";
import type { Vendor } from "@/payload-types";
import {
  buildMarketingChannelsUpdate,
  buildMetaConfigUpdate,
  buildSocialChannelsUpdate,
  buildWhatsAppConfigUpdate,
} from "@/lib/vendor-marketing-profile";

export const whatsappConfigInputSchema = z.object({
  businessNumber: z.string().optional(),
  phoneNumberId: z.string().optional(),
  wabaId: z.string().optional(),
  accessToken: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
});

export const metaConfigInputSchema = z.object({
  facebookPageId: z.string().optional(),
  instagramBusinessId: z.string().optional(),
  pageAccessToken: z.string().optional(),
});

export const marketingProfileUpdateBodySchema = z.object({
  socialChannels: z
    .object({
      socialInstagram: z.string().optional(),
      socialFacebook: z.string().optional(),
      socialWhatsAppGroup: z.string().optional(),
      socialNotes: z.string().optional(),
      socialInstagramLastPostedAt: z.string().nullable().optional(),
      socialFacebookLastPostedAt: z.string().nullable().optional(),
      socialWhatsAppGroupLastPostedAt: z.string().nullable().optional(),
    })
    .optional(),
  marketingChannels: z
    .array(
      z.object({
        platform: z.enum([
          "facebook-group",
          "instagram-page",
          "whatsapp-group",
          "other",
        ]),
        name: z.string().min(1, "Channel name is required"),
        url: z.string().min(1, "URL is required"),
        region: z.string().optional(),
        audienceNotes: z.string().optional(),
        isActive: z.boolean().optional(),
        lastPostedAt: z.string().nullable().optional(),
      })
    )
    .optional(),
  whatsappConfig: whatsappConfigInputSchema.optional(),
  metaConfig: metaConfigInputSchema.optional(),
  logo: z.string().nullable().optional(),
});

export type MarketingProfileUpdateBody = z.infer<typeof marketingProfileUpdateBodySchema>;

export function toMarketingProfileResponse(vendor: Vendor) {
  const logo = vendor.logo;
  const logoId = typeof logo === "string" ? logo : logo?.id ?? null;
  const logoUrl =
    typeof logo === "object" && logo !== null && "url" in logo && logo.url ? logo.url : null;

  return {
    logoId,
    logoUrl,
    socialChannels: {
      socialInstagram: vendor.socialChannels?.socialInstagram ?? "",
      socialFacebook: vendor.socialChannels?.socialFacebook ?? "",
      socialWhatsAppGroup: vendor.socialChannels?.socialWhatsAppGroup ?? "",
      socialNotes: vendor.socialChannels?.socialNotes ?? "",
      socialInstagramLastPostedAt:
        vendor.socialChannels?.socialInstagramLastPostedAt ?? null,
      socialFacebookLastPostedAt: vendor.socialChannels?.socialFacebookLastPostedAt ?? null,
      socialWhatsAppGroupLastPostedAt:
        vendor.socialChannels?.socialWhatsAppGroupLastPostedAt ?? null,
    },
    marketingChannels: (vendor.marketingChannels ?? []).map((ch) => ({
      platform: ch.platform,
      name: ch.name,
      url: ch.url,
      region: ch.region ?? "",
      audienceNotes: ch.audienceNotes ?? "",
      isActive: ch.isActive ?? true,
      lastPostedAt: ch.lastPostedAt ?? null,
    })),
    // Secret tokens are intentionally never returned to clients; only a flag
    // indicating whether one is already stored.
    whatsappConfig: {
      businessNumber: vendor.whatsappConfig?.businessNumber ?? "",
      phoneNumberId: vendor.whatsappConfig?.phoneNumberId ?? "",
      wabaId: vendor.whatsappConfig?.wabaId ?? "",
      notificationsEnabled: vendor.whatsappConfig?.notificationsEnabled ?? true,
      hasAccessToken: Boolean(vendor.whatsappConfig?.accessToken),
    },
    metaConfig: {
      facebookPageId: vendor.metaConfig?.facebookPageId ?? "",
      instagramBusinessId: vendor.metaConfig?.instagramBusinessId ?? "",
      hasPageAccessToken: Boolean(vendor.metaConfig?.pageAccessToken),
    },
  };
}

export async function updateVendorMarketingProfile(
  db: BasePayload,
  vendorId: string,
  input: MarketingProfileUpdateBody,
  options?: { overrideAccess?: boolean }
) {
  const existing = await db.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 0,
    overrideAccess: options?.overrideAccess,
  });

  const marketingChannels =
    input.marketingChannels !== undefined
      ? buildMarketingChannelsUpdate(existing.marketingChannels ?? [], input.marketingChannels)
      : undefined;

  return db.update({
    collection: "vendors",
    id: vendorId,
    data: {
      ...(input.logo !== undefined && { logo: input.logo }),
      ...(input.socialChannels !== undefined && {
        socialChannels: buildSocialChannelsUpdate(existing.socialChannels, input.socialChannels),
      }),
      ...(marketingChannels !== undefined && { marketingChannels }),
      ...(input.whatsappConfig !== undefined && {
        whatsappConfig: buildWhatsAppConfigUpdate(existing.whatsappConfig, input.whatsappConfig),
      }),
      ...(input.metaConfig !== undefined && {
        metaConfig: buildMetaConfigUpdate(existing.metaConfig, input.metaConfig),
      }),
    },
    overrideAccess: options?.overrideAccess,
  });
}
