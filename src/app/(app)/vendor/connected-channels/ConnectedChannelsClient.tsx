"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Instagram, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import type { PublicSocialConnection } from "@/lib/vendor-social-connections";

export function ConnectedChannelsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<PublicSocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "instagram") {
      toast.success("Instagram connected. It stays linked after logout.");
      router.replace("/vendor/connected-channels");
    } else if (error) {
      toast.error(error);
      router.replace("/vendor/connected-channels");
    }
  }, [router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/socials/status")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load connected channels");
        return (await res.json()) as PublicSocialConnection[];
      })
      .then((data) => {
        if (!cancelled) setConnections(Array.isArray(data) ? data : []);
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not load channels");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const instagram = connections.find((c) => c.platform === "instagram" && c.connected);

  const disconnectInstagram = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/socials/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "instagram" }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to disconnect");
      }
      setConnections((prev) => prev.filter((c) => c.platform !== "instagram"));
      toast.success("Instagram disconnected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading connected channels…
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {vendorPageTitles.connectedChannels}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect a Professional Instagram account (Business or Creator). Instagram
          Login does not require a Facebook Page. Tokens are stored on the vendor
          and refreshed before they expire (~60 days).
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Instagram className="h-5 w-5" />
              Instagram
            </CardTitle>
            <CardDescription>
              {instagram
                ? `Connected as @${instagram.username}`
                : "Post products to Instagram from My Products."}
            </CardDescription>
            {instagram?.tokenExpiresAt && (
              <p className="text-xs text-muted-foreground">
                Token expires {new Date(instagram.tokenExpiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
          {instagram ? (
            <Button
              variant="outline"
              onClick={disconnectInstagram}
              disabled={disconnecting}
            >
              {disconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          ) : (
            <Button asChild>
              <a href="/api/auth/instagram/connect">Connect Instagram</a>
            </Button>
          )}
        </CardHeader>
      </Card>

      <Card className="opacity-70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Facebook Page</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </div>
          <Button variant="outline" disabled>
            Connect
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}
