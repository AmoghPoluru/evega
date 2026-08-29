"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
 * Link WhatsApp (QR) and resolve the Settings invite → JID.
 * Product posting lives beside Instagram on the product list.
 */
export function WhatsAppChannelCard() {
  const [qr, setQr] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const autoSyncedJid = useRef<string | null>(null);

  const utils = trpc.useUtils();
  const { data: marketingProfile } =
    trpc.vendor.dashboard.getMarketingProfile.useQuery();

  const groupLink =
    marketingProfile?.socialChannels.socialWhatsAppGroup?.trim() ?? "";
  const groupJid =
    marketingProfile?.socialChannels.socialWhatsAppGroupJid?.trim() ?? "";
  const hasWhatsAppGroup = Boolean(groupLink);

  const status = trpc.whatsappChannels.sessionStatus.useQuery(undefined, {
    refetchInterval: pollingEnabled ? 3000 : 10_000,
  });
  const connected = Boolean(status.data?.connected);

  useEffect(() => {
    if (status.data?.qr) setQr(status.data.qr);
    if (status.data?.connected) {
      setQr(null);
      setPollingEnabled(true);
    }
  }, [status.data?.qr, status.data?.connected]);

  const syncGroupJid = trpc.whatsappChannels.syncGroupJidFromSettings.useMutation({
    onSuccess: (data) => {
      autoSyncedJid.current = data.jid;
      void utils.vendor.dashboard.getMarketingProfile.invalidate();
      toast.success(`WhatsApp JID ready — ${data.jid}`);
    },
    onError: (error) => {
      autoSyncedJid.current = null;
      toast.error(readableError(error.message));
    },
  });

  useEffect(() => {
    if (!connected || !hasWhatsAppGroup) return;

    if (groupJid) {
      autoSyncedJid.current = groupJid;
      return;
    }

    const resolveKey = `resolve:${groupLink}`;
    if (syncGroupJid.isPending) return;
    if (autoSyncedJid.current === resolveKey) return;
    autoSyncedJid.current = resolveKey;
    syncGroupJid.mutate({ groupLink });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, hasWhatsAppGroup, groupJid, groupLink, syncGroupJid.isPending]);

  const startSession = trpc.whatsappChannels.startSession.useMutation({
    onSuccess: (data) => {
      setQr(data.qr);
      setPollingEnabled(true);
      if (data.connected) {
        toast.success("WhatsApp is linked (saved device). Resolving JID…");
        if (hasWhatsAppGroup) {
          syncGroupJid.mutate({ groupLink });
        }
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
      autoSyncedJid.current = null;
      toast.success("WhatsApp disconnected");
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
              ? "Linked. Post products from the list below to your Settings group / channel."
              : status.data?.hasSavedAuth
                ? "Saved device found — reconnecting…"
                : "Link your phone once; we keep the device linked across restarts."}
          </CardDescription>
          <p className="text-xs text-muted-foreground">
            Uses an unofficial WhatsApp Web session — WhatsApp may restrict or ban
            the account, and it only works while the app runs in a persistent
            Node process (not Vercel serverless).
          </p>
          {!hasWhatsAppGroup ? (
            <p className="text-xs text-amber-700">
              Add a WhatsApp group or channel invite in{" "}
              <Link
                href="/vendor/settings"
                className="font-medium underline underline-offset-2"
              >
                Settings
              </Link>{" "}
              first, then link WhatsApp here.
            </p>
          ) : null}
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
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => startSession.mutate({})}
              disabled={startSession.isPending || !hasWhatsAppGroup}
              title={
                hasWhatsAppGroup
                  ? undefined
                  : "Add a WhatsApp group or channel invite in Settings first"
              }
            >
              {startSession.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {status.data?.hasSavedAuth ? "Reconnect" : "Link WhatsApp"}
            </Button>
            {pendingQr || status.data?.hasSavedAuth ? (
              <Button
                variant="outline"
                onClick={() => startSession.mutate({ forceRelink: true })}
                disabled={startSession.isPending || !hasWhatsAppGroup}
              >
                New QR
              </Button>
            ) : null}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {hasWhatsAppGroup ? (
          <div className="space-y-2 rounded-md border bg-muted/40 px-3 py-2">
            <p className="text-xs font-medium text-foreground">From Settings</p>
            <p className="font-mono text-[11px] text-muted-foreground break-all">
              {groupLink}
            </p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                WhatsApp JID
              </label>
              <Input
                readOnly
                className="bg-background font-mono text-xs"
                value={groupJid}
                placeholder={
                  connected
                    ? "Resolving from invite…"
                    : "Fills after you link WhatsApp (scan QR)"
                }
              />
            </div>
            {connected && !groupJid ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={syncGroupJid.isPending}
                onClick={() => syncGroupJid.mutate({ groupLink })}
              >
                {syncGroupJid.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Resolve JID
              </Button>
            ) : null}
          </div>
        ) : null}

        {!connected && startSession.isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Waiting for WhatsApp QR code…
          </div>
        ) : null}

        {pendingQr ? (
          <div className="space-y-2">
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

        {connected && syncGroupJid.isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Resolving WhatsApp JID from Settings invite…
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
