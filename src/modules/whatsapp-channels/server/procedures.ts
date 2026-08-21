import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";

import { createTRPCRouter, vendorProcedure } from "@/trpc/init";
import {
  listChannels,
  postToChannel,
  resolveChannelInvite,
} from "@/lib/whatsapp-channels/channels";
import {
  getOrCreateSession,
  getSessionStatus,
  logoutSession,
} from "@/lib/whatsapp-channels/session-manager";

/**
 * Unofficial WhatsApp Channels (Baileys) procedures.
 *
 * These only work when the app runs in a persistent Node process — the socket
 * lives in module memory, so on Vercel serverless every call would land on a
 * fresh, unlinked instance. See README → "WhatsApp Channels (unofficial…)".
 */

function trpcError(error: unknown): TRPCError {
  const message = error instanceof Error ? error.message : "WhatsApp channel error";
  return new TRPCError({ code: "BAD_REQUEST", message });
}

export const whatsappChannelsRouter = createTRPCRouter({
  /** Creates or refreshes the vendor's session and returns a QR to scan. */
  startSession: vendorProcedure.mutation(async ({ ctx }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    try {
      const session = await getOrCreateSession(vendorId);
      await upsertSessionRow(ctx.db, vendorId, session.connected ? "connected" : "pending");
      return { qr: session.qr, connected: session.connected };
    } catch (error) {
      console.error("[whatsappChannels.startSession] failed:", error);
      throw trpcError(error);
    }
  }),

  sessionStatus: vendorProcedure.query(({ ctx }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;
    return getSessionStatus(vendorId);
  }),

  logout: vendorProcedure.mutation(async ({ ctx }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;
    await logoutSession(vendorId);
    await upsertSessionRow(ctx.db, vendorId, "disconnected");
    return { ok: true };
  }),

  listChannels: vendorProcedure.query(async ({ ctx }) => {
    const vendorId =
      typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

    try {
      return await listChannels(vendorId);
    } catch (error) {
      throw trpcError(error);
    }
  }),

  /** Turns a channel share link / invite code into its `@newsletter` JID. */
  resolveInvite: vendorProcedure
    .input(z.object({ invite: z.string().min(1, "Paste a channel link") }))
    .mutation(async ({ ctx, input }) => {
      const vendorId =
        typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;

      try {
        return await resolveChannelInvite(vendorId, input.invite);
      } catch (error) {
        throw trpcError(error);
      }
    }),

  postToChannel: vendorProcedure
    .input(
      z.object({
        channelJid: z.string().min(1, "Channel id is required"),
        caption: z.string().min(1, "Caption is required"),
        imageUrl: z
          .string()
          .url("Image URL must be a full public URL, e.g. https://example.com/a.jpg")
          .optional(),
        // Optional: `social-posts` rows require a product, so a post is only
        // logged when the vendor picked one.
        productId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendorId =
        typeof ctx.session.vendor === "string"
          ? ctx.session.vendor
          : ctx.session.vendor.id;

      let messageId: string | null = null;
      let failure: string | undefined;

      try {
        const result = await postToChannel(vendorId, input.channelJid, {
          caption: input.caption,
          mediaUrl: input.imageUrl,
        });
        messageId = result.messageId;
      } catch (error) {
        failure = error instanceof Error ? error.message : "Unknown error";
        console.error("[whatsappChannels.postToChannel] failed:", failure);
      }

      if (input.productId) {
        try {
          await ctx.db.create({
            collection: "social-posts",
            data: {
              vendor: vendorId,
              product: input.productId,
              channels: ["whatsapp-channel"],
              caption: input.caption,
              status: failure ? "failed" : "posted",
              externalPostId: messageId ?? undefined,
              error: failure,
              postedBy: ctx.session.user.id,
            },
            overrideAccess: true,
          });
        } catch (logError) {
          console.error(
            "[whatsappChannels.postToChannel] failed to log social-post:",
            logError
          );
        }
      }

      if (failure) {
        throw new TRPCError({ code: "BAD_REQUEST", message: failure });
      }

      return { messageId };
    }),
});

/** Mirrors the in-memory link state into `whatsapp-channel-sessions`. */
async function upsertSessionRow(
  db: Payload,
  vendorId: string,
  status: "pending" | "connected" | "disconnected"
): Promise<void> {
  const data = {
    vendor: vendorId,
    status,
    lastConnectedAt: status === "connected" ? new Date().toISOString() : undefined,
  };

  try {
    const existing = await db.find({
      collection: "whatsapp-channel-sessions",
      where: { vendor: { equals: vendorId } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      await db.update({
        collection: "whatsapp-channel-sessions",
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      });
      return;
    }

    await db.create({
      collection: "whatsapp-channel-sessions",
      data,
      overrideAccess: true,
    });
  } catch (error) {
    console.error("[whatsappChannels] failed to persist session row:", error);
  }
}
