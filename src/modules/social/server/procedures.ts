import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, vendorProcedure } from "@/trpc/init";
import { postToFacebookPage, publishVendorInstagram } from "@/lib/social";
import { sendWhatsAppText } from "@/lib/whatsapp";
import {
  extractProductPublicImageUrls,
  isPublicHttpUrl,
} from "@/lib/product-public-media";
import { buildSocialChannelsUpdate } from "@/lib/vendor-marketing-profile";
import { resolveInstagramPublishCreds } from "@/lib/vendor-social-connections";
import { generateInstagramBanner } from "@/lib/openai-instagram-banner";
import { getVendorOpenAiApiKey } from "@/lib/vendor-openai-config";
import type { Product, Vendor } from "@/payload-types";

function productSourceImageUrl(product: Product): string | null {
  const publicUrl = extractProductPublicImageUrls(product)[0];
  if (publicUrl) return publicUrl;
  const image = product.image;
  if (image && typeof image === "object" && typeof image.url === "string" && image.url) {
    const raw = image.url;
    if (raw.startsWith("http")) return raw;
    const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
      /\/$/,
      ""
    );
    return `${base}${raw.startsWith("/") ? "" : "/"}${raw}`;
  }
  return null;
}

const channelEnum = z.enum(["instagram", "facebook", "whatsapp"]);

const CHANNEL_TO_LAST_POSTED: Record<
  z.infer<typeof channelEnum>,
  "socialInstagramLastPostedAt" | "socialFacebookLastPostedAt" | "socialWhatsAppGroupLastPostedAt"
> = {
  instagram: "socialInstagramLastPostedAt",
  facebook: "socialFacebookLastPostedAt",
  whatsapp: "socialWhatsAppGroupLastPostedAt",
};

export const socialRouter = createTRPCRouter({
  generateBanner: vendorProcedure
    .input(
      z.object({
        productId: z.string(),
        instruction: z.string().trim().min(8, "Add generation instructions").max(2000),
        brief: z.string().trim().min(8, "Add a creative brief").max(1200),
        useSourceImage: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendorId =
        typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
        depth: 1,
      });
      const productVendorId =
        typeof product.vendor === "string" ? product.vendor : product.vendor?.id;
      if (productVendorId !== vendorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this product",
        });
      }

      const sourceImageUrl = productSourceImageUrl(product as Product);
      if (input.useSourceImage && !sourceImageUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This product needs an image, or turn off “Use product photo”.",
        });
      }

      const vendor = (await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 0,
        overrideAccess: true,
      })) as Vendor;
      const apiKey = getVendorOpenAiApiKey(vendor);
      if (!apiKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Add your OpenAI API key on the vendor dashboard first.",
        });
      }

      const priceLabel = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(product.price ?? 0);

      try {
        return await generateInstagramBanner({
          apiKey,
          sourceImageUrl,
          useSourceImage: input.useSourceImage,
          instruction: input.instruction,
          brief: input.brief,
          productName: product.name,
          priceLabel,
          vendorId,
          productId: product.id,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate banner";
        throw new TRPCError({ code: "BAD_REQUEST", message });
      }
    }),

  postProduct: vendorProcedure
    .input(
      z.object({
        productId: z.string(),
        channels: z.array(channelEnum).min(1, "Select at least one channel"),
        caption: z.string().min(1, "Caption is required"),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendorId =
        typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

      // Load product (with media populated) and verify ownership.
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
        depth: 1,
      });

      const productVendorId =
        typeof product.vendor === "string" ? product.vendor : product.vendor?.id;

      if (productVendorId !== vendorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this product",
        });
      }

      // Load full vendor (overrideAccess in local API exposes secret tokens).
      const vendor = (await ctx.db.findByID({
        collection: "vendors",
        id: vendorId,
        depth: 0,
        overrideAccess: true,
      })) as Vendor;

      const meta = vendor.metaConfig;
      const whatsapp = vendor.whatsappConfig;
      const overrideUrl = input.imageUrl?.trim();
      if (overrideUrl && !isPublicHttpUrl(overrideUrl)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Custom Instagram images must be a public URL (Vercel Blob). Localhost URLs cannot be published.",
        });
      }
      const publicImageUrls = overrideUrl
        ? [overrideUrl]
        : extractProductPublicImageUrls(product);
      const imageUrl = publicImageUrls[0];

      const results: Array<{
        channel: z.infer<typeof channelEnum>;
        status: "posted" | "failed";
        externalPostId?: string;
        error?: string;
      }> = [];

      for (const channel of input.channels) {
        try {
          let externalPostId: string | undefined;

          if (channel === "facebook") {
            if (!meta?.facebookPageId || !meta?.pageAccessToken) {
              throw new Error("Facebook is not connected for this vendor.");
            }
            const res = await postToFacebookPage({
              pageId: meta.facebookPageId,
              pageAccessToken: meta.pageAccessToken,
              message: input.caption,
              imageUrl,
            });
            externalPostId = res.id;
          } else if (channel === "instagram") {
            if (publicImageUrls.length === 0) {
              throw new Error(
                "Instagram requires a public image URL (Vercel Blob). Localhost URLs cannot be published."
              );
            }

            const igCreds = await resolveInstagramPublishCreds(ctx.db, vendorId);
            if (igCreds) {
              const res = await publishVendorInstagram({
                igUserId: igCreds.igUserId,
                accessToken: igCreds.accessToken,
                caption: input.caption,
                imageUrls: publicImageUrls,
              });
              externalPostId = res.id;
            } else {
              throw new Error(
                "Instagram is not connected. Connect it in Connected Channels."
              );
            }
          } else {
            // whatsapp — broadcast to the vendor's business number.
            if (!whatsapp?.businessNumber) {
              throw new Error("WhatsApp business number is not configured.");
            }
            const res = await sendWhatsAppText({
              to: whatsapp.businessNumber,
              body: input.caption,
              phoneNumberId: whatsapp.phoneNumberId,
              accessToken: whatsapp.accessToken,
            });
            if (!res) {
              throw new Error("WhatsApp is not configured.");
            }
            externalPostId = res.id;
          }

          results.push({ channel, status: "posted", externalPostId });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(`[social.postProduct] ${channel} failed:`, message);
          results.push({ channel, status: "failed", error: message });
        }

        // Log each attempt as a social-posts row.
        const last = results[results.length - 1];
        try {
          await ctx.db.create({
            collection: "social-posts",
            data: {
              vendor: vendorId,
              product: input.productId,
              channels: [channel],
              caption: input.caption,
              status: last.status,
              externalPostId: last.externalPostId,
              error: last.error,
              postedBy: ctx.session.user.id,
            },
            overrideAccess: true,
          });
        } catch (logError) {
          console.error("[social.postProduct] failed to log social-post:", logError);
        }
      }

      // Stamp socialChannels.*LastPostedAt for channels that posted successfully.
      const postedChannels = results.filter((r) => r.status === "posted");
      if (postedChannels.length > 0) {
        try {
          const now = new Date().toISOString();
          const stamps: Record<string, string> = {};
          for (const r of postedChannels) {
            stamps[CHANNEL_TO_LAST_POSTED[r.channel]] = now;
          }
          await ctx.db.update({
            collection: "vendors",
            id: vendorId,
            data: {
              socialChannels: buildSocialChannelsUpdate(vendor.socialChannels, {
                socialInstagram: vendor.socialChannels?.socialInstagram ?? undefined,
                socialFacebook: vendor.socialChannels?.socialFacebook ?? undefined,
                socialWhatsAppGroup: vendor.socialChannels?.socialWhatsAppGroup ?? undefined,
                socialNotes: vendor.socialChannels?.socialNotes ?? undefined,
                ...stamps,
              }),
            },
            overrideAccess: true,
          });
        } catch (stampError) {
          console.error("[social.postProduct] failed to stamp lastPostedAt:", stampError);
        }
      }

      return {
        results,
        posted: postedChannels.length,
        failed: results.length - postedChannels.length,
      };
    }),
});
