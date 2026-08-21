import { beforeEach, describe, expect, it, vi } from "vitest";

const requireConnectedSession = vi.fn();

// The real session manager pulls in Baileys and opens a WebSocket; never in CI.
vi.mock("@/lib/whatsapp-channels/session-manager", () => ({
  requireConnectedSession: (vendorId: string) => requireConnectedSession(vendorId),
}));

import {
  assertNewsletterJid,
  assertNotThrottled,
  isNewsletterJid,
  listChannels,
  parseChannelInvite,
  postToChannel,
  resetPostThrottle,
  resolveChannelInvite,
} from "@/lib/whatsapp-channels/channels";

function mockSocket(overrides: Record<string, unknown> = {}) {
  const sendMessage = vi.fn().mockResolvedValue({ key: { id: "MSG-1" } });
  const sock = { sendMessage, ...overrides };
  requireConnectedSession.mockResolvedValue(sock);
  return { sock, sendMessage };
}

describe("whatsapp-channels/channels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPostThrottle();
    delete process.env.WHATSAPP_CHANNELS_POST_THROTTLE_SECONDS;
  });

  describe("JID validation", () => {
    it("accepts numeric newsletter JIDs", () => {
      expect(isNewsletterJid("123456789@newsletter")).toBe(true);
      expect(assertNewsletterJid("  123@newsletter  ")).toBe("123@newsletter");
    });

    it("rejects groups, users and malformed JIDs", () => {
      expect(isNewsletterJid("123@g.us")).toBe(false);
      expect(isNewsletterJid("15551234567@s.whatsapp.net")).toBe(false);
      expect(isNewsletterJid("abc@newsletter")).toBe(false);
      expect(isNewsletterJid("@newsletter")).toBe(false);
      expect(isNewsletterJid("123@newsletter.evil.com")).toBe(false);
      expect(() => assertNewsletterJid("123@g.us")).toThrow(/Invalid channel id/);
    });

    it("refuses to post to a non-newsletter JID", async () => {
      const { sendMessage } = mockSocket();
      await expect(
        postToChannel("vendor-1", "123@g.us", { caption: "hi" }),
      ).rejects.toThrow(/Invalid channel id/);
      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe("throttle", () => {
    it("allows the first post and rejects a immediate second one", () => {
      const now = 1_000_000;
      expect(() => assertNotThrottled("vendor-1", now)).not.toThrow();
      expect(() => assertNotThrottled("vendor-1", now + 1_000)).toThrow(
        /Wait 29s/,
      );
    });

    it("allows again once the window elapsed", () => {
      const now = 1_000_000;
      assertNotThrottled("vendor-1", now);
      expect(() => assertNotThrottled("vendor-1", now + 30_000)).not.toThrow();
    });

    it("throttles per vendor", () => {
      const now = 1_000_000;
      assertNotThrottled("vendor-1", now);
      expect(() => assertNotThrottled("vendor-2", now)).not.toThrow();
    });

    it("honours WHATSAPP_CHANNELS_POST_THROTTLE_SECONDS", () => {
      process.env.WHATSAPP_CHANNELS_POST_THROTTLE_SECONDS = "5";
      const now = 1_000_000;
      assertNotThrottled("vendor-1", now);
      expect(() => assertNotThrottled("vendor-1", now + 4_000)).toThrow();
      expect(() => assertNotThrottled("vendor-1", now + 5_000)).not.toThrow();
    });

    it("blocks a second postToChannel inside the window", async () => {
      const { sendMessage } = mockSocket();
      await postToChannel("vendor-1", "123@newsletter", { caption: "first" });
      await expect(
        postToChannel("vendor-1", "123@newsletter", { caption: "second" }),
      ).rejects.toThrow(/Too many channel posts/);
      expect(sendMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe("postToChannel", () => {
    it("sends text when no media is given", async () => {
      const { sendMessage } = mockSocket();
      const result = await postToChannel("vendor-1", "123@newsletter", {
        caption: "hello channel",
      });
      expect(sendMessage).toHaveBeenCalledWith("123@newsletter", {
        text: "hello channel",
      });
      expect(result).toEqual({ messageId: "MSG-1" });
    });

    it("sends an image with the caption when a media URL is given", async () => {
      const { sendMessage } = mockSocket();
      await postToChannel("vendor-1", "123@newsletter", {
        caption: "look",
        mediaUrl: "https://cdn.example.com/a.jpg",
      });
      expect(sendMessage).toHaveBeenCalledWith("123@newsletter", {
        image: { url: "https://cdn.example.com/a.jpg" },
        caption: "look",
      });
    });

    it("requires a caption, text or media", async () => {
      mockSocket();
      await expect(
        postToChannel("vendor-1", "123@newsletter", {}),
      ).rejects.toThrow(/Add a caption or an image/);
    });

    it("surfaces a missing session", async () => {
      requireConnectedSession.mockRejectedValue(new Error("not connected"));
      await expect(
        postToChannel("vendor-1", "123@newsletter", { caption: "hi" }),
      ).rejects.toThrow("not connected");
    });
  });

  describe("listChannels", () => {
    it("maps newsletters returned by the socket", async () => {
      mockSocket({
        newsletterFetchAll: vi.fn().mockResolvedValue([
          { id: "1@newsletter", name: "Deals", subscribers: 12 },
          { id: "2@newsletter" },
        ]),
      });

      await expect(listChannels("vendor-1")).resolves.toEqual([
        { jid: "1@newsletter", name: "Deals", subscribers: 12 },
        { jid: "2@newsletter", name: "2@newsletter", subscribers: null },
      ]);
    });

    it("explains when the Baileys build lacks newsletterFetchAll", async () => {
      mockSocket();
      await expect(listChannels("vendor-1")).rejects.toThrow(
        /newsletterFetchAll/,
      );
    });
  });

  describe("invite resolution", () => {
    it("pulls the invite code out of share links and bare codes", () => {
      expect(
        parseChannelInvite("https://whatsapp.com/channel/0029VbDh9jF6GcGJEguWYc2u"),
      ).toBe("0029VbDh9jF6GcGJEguWYc2u");
      expect(
        parseChannelInvite("https://www.whatsapp.com/channel/0029VbDh9jF6GcGJEguWYc2u/"),
      ).toBe("0029VbDh9jF6GcGJEguWYc2u");
      expect(parseChannelInvite(" 0029VbDh9jF6GcGJEguWYc2u ")).toBe(
        "0029VbDh9jF6GcGJEguWYc2u",
      );
    });

    it("rejects unrelated links and short junk", () => {
      expect(parseChannelInvite("")).toBeNull();
      expect(parseChannelInvite("abc")).toBeNull();
      expect(parseChannelInvite("https://example.com/channel/0029VbDh9jF6Gc")).toBeNull();
    });

    it("resolves a link to the newsletter JID via newsletterMetadata", async () => {
      const newsletterMetadata = vi.fn().mockResolvedValue({
        id: "120363123456789012@newsletter",
        name: "Testvastra",
        subscribers: 1,
      });
      mockSocket({ newsletterMetadata });

      await expect(
        resolveChannelInvite(
          "vendor-1",
          "https://whatsapp.com/channel/0029VbDh9jF6GcGJEguWYc2u",
        ),
      ).resolves.toEqual({
        jid: "120363123456789012@newsletter",
        name: "Testvastra",
        subscribers: 1,
      });
      expect(newsletterMetadata).toHaveBeenCalledWith(
        "invite",
        "0029VbDh9jF6GcGJEguWYc2u",
      );
    });

    it("never touches the socket for an unparseable link", async () => {
      const newsletterMetadata = vi.fn();
      mockSocket({ newsletterMetadata });

      await expect(resolveChannelInvite("vendor-1", "nope")).rejects.toThrow(
        /Paste a WhatsApp Channel link/,
      );
      expect(newsletterMetadata).not.toHaveBeenCalled();
    });

    it("explains an unknown channel", async () => {
      mockSocket({ newsletterMetadata: vi.fn().mockResolvedValue(null) });
      await expect(
        resolveChannelInvite(
          "vendor-1",
          "https://whatsapp.com/channel/0029VbDh9jF6GcGJEguWYc2u",
        ),
      ).rejects.toThrow(/did not return a channel/);
    });
  });
});
