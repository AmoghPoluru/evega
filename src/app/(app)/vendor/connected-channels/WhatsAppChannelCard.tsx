"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { trpc } from "@/trpc/client";

/** tRPC serialises input validation failures as a JSON array of zod issues. */
function readableError(message: string): string {
  if (!message.trimStart().startsWith("[")) return message;

  try {
    const issues: unknown = JSON.parse(message);
    if (!Array.isArray(issues)) return message;

    const text = issues
      .map((issue) => (issue as { message?: unknown }).message)
      .filter((issueMessage): issueMessage is string =>
        typeof issueMessage === "string"
      )
      .join(" ");

    return text || message;
  } catch {
    return message;
  }
}

/**
 * Unofficial WhatsApp Channels (Baileys) card. Requires the app to run in a
 * persistent Node process — see README. Beta / ToS risk is surfaced in the UI.
 */
export function WhatsAppChannelCard() {
  const [qr, setQr] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [channelJid, setChannelJid] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [invite, setInvite] = useState("");

  const status = trpc.whatsappChannels.sessionStatus.useQuery(undefined, {
    enabled: pollingEnabled,
    refetchInterval: 3000,
  });
  const connected = Boolean(status.data?.connected);

  useEffect(() => {
    if (status.data?.qr) setQr(status.data.qr);
    if (status.data?.connected) setQr(null);
  }, [status.data?.qr, status.data?.connected]);

  const channels = trpc.whatsappChannels.listChannels.useQuery(undefined, {
    enabled: connected,
    retry: false,
  });

  const startSession = trpc.whatsappChannels.startSession.useMutation({
    onSuccess: (data) => {
      setQr(data.qr);
      setPollingEnabled(true);
      if (data.connected) {
        toast.success("WhatsApp channel session is already linked.");
      } else if (data.qr) {
        toast.success("Scan the QR code in WhatsApp → Linked devices.");
      } else {
        toast.error("No QR code yet. Try Link WhatsApp again.");
      }
    },
    onError: (error) => toast.error(readableError(error.message)),
  });

  const logout = trpc.whatsappChannels.logout.useMutation({
    onSuccess: () => {
      setQr(null);
      setPollingEnabled(false);
      toast.success("WhatsApp channel session disconnected");
    },
    onError: (error) => toast.error(readableError(error.message)),
  });

  const resolveInvite = trpc.whatsappChannels.resolveInvite.useMutation({
    onSuccess: (channel) => {
      setChannelJid(channel.jid);
      toast.success(`Found "${channel.name}" — ${channel.jid}`);
    },
    onError: (error) => toast.error(readableError(error.message)),
  });

  const post = trpc.whatsappChannels.postToChannel.useMutation({
    onSuccess: () => {
      setCaption("");
      setImageUrl("");
      toast.success("Posted to the WhatsApp channel");
    },
    onError: (error) => toast.error(readableError(error.message)),
  });

  const pendingQr = connected ? null : (status.data?.qr ?? qr);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Channel (beta)
          </CardTitle>
          <CardDescription>
            {connected
              ? "Linked. Posts go out from your own WhatsApp account."
              : "Link your phone (WhatsApp → Linked devices) to post to a WhatsApp Channel."}
          </CardDescription>
          <p className="text-xs text-muted-foreground">
            Uses an unofficial WhatsApp Web session — WhatsApp may restrict or ban
            the account, and it only works while the app runs in a persistent
            Node process (not Vercel serverless).
          </p>
        </div>
        {connected ? (
          <Button
            variant="outline"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={() => startSession.mutate()}
            disabled={startSession.isPending}
          >
            {startSession.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Link WhatsApp
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {!connected && startSession.isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Waiting for WhatsApp QR code…
          </div>
        ) : null}

        {pendingQr ? (
          <div className="space-y-2">
            {/* Data-URL QR from the server; next/image adds nothing here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingQr}
              alt="WhatsApp linking QR code"
              className="h-48 w-48 rounded-md border bg-white p-2"
            />
            <p className="text-xs text-muted-foreground">
              WhatsApp → Settings → Linked devices → Link a device.
            </p>
          </div>
        ) : null}

        {connected ? (
          <div className="space-y-3">
            {channels.error ? (
              <p className="text-xs text-muted-foreground">
                {channels.error.message} Paste the channel JID below instead.
              </p>
            ) : null}

            {channels.data && channels.data.length > 0 ? (
              <NativeSelect
                className="w-full"
                value={channelJid}
                onChange={(event) => setChannelJid(event.target.value)}
              >
                <NativeSelectOption value="">
                  Select a channel…
                </NativeSelectOption>
                {channels.data.map((channel) => (
                  <NativeSelectOption key={channel.jid} value={channel.jid}>
                    {channel.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            ) : (
              <Input
                placeholder="123456789@newsletter"
                value={channelJid}
                onChange={(event) => setChannelJid(event.target.value)}
              />
            )}

            {/* A channel share link carries an invite code, not the JID, so it
                has to be resolved through the linked account. */}
            <div className="flex gap-2">
              <Input
                placeholder="Or paste a channel link: https://whatsapp.com/channel/…"
                value={invite}
                onChange={(event) => setInvite(event.target.value)}
              />
              <Button
                variant="outline"
                disabled={!invite.trim() || resolveInvite.isPending}
                onClick={() => resolveInvite.mutate({ invite })}
              >
                {resolveInvite.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Find id
              </Button>
            </div>

            <Textarea
              placeholder="Caption to post to the channel"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
            <Input
              placeholder="Image URL (optional, must be public)"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />

            <Button
              disabled={post.isPending || !channelJid || !caption.trim()}
              onClick={() =>
                post.mutate({
                  channelJid,
                  caption,
                  imageUrl: imageUrl.trim() || undefined,
                })
              }
            >
              {post.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post to channel
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
