"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";

function buildDefaultCaption(product: {
  id: string;
  name: string;
  price: number;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);
  const url = `${appUrl}/products/${product.id}`;
  return `${product.name} — ${price}\n${url}`;
}

function absoluteMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
  if (!base) return url;
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

type PostToWhatsAppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string; price: number; imageUrl: string };
};

export function PostToWhatsAppDialog({
  open,
  onOpenChange,
  product,
}: PostToWhatsAppDialogProps) {
  const defaultCaption = useMemo(() => buildDefaultCaption(product), [product]);
  const [caption, setCaption] = useState(defaultCaption);

  const { data: marketingProfile } =
    trpc.vendor.dashboard.getMarketingProfile.useQuery(undefined, {
      enabled: open,
    });
  const status = trpc.whatsappChannels.sessionStatus.useQuery(undefined, {
    enabled: open,
    refetchInterval: open ? 5000 : false,
  });

  const groupJid =
    marketingProfile?.socialChannels.socialWhatsAppGroupJid?.trim() ?? "";
  const connected = Boolean(status.data?.connected);
  const canPost = Boolean(connected && groupJid && caption.trim());

  useEffect(() => {
    if (!open) return;
    setCaption(buildDefaultCaption(product));
  }, [open, product]);

  const post = trpc.whatsappChannels.postToChannel.useMutation({
    onSuccess: () => {
      toast.success("Posted to WhatsApp");
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message || "Failed to post"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-4">
        <div className="space-y-1">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Post to WhatsApp
          </DialogTitle>
          <DialogDescription>
            Uses the product photo and posts to your Settings WhatsApp group /
            channel.
          </DialogDescription>
        </div>

        <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-md bg-muted">
          <Image
            src={product.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>

        {!connected || !groupJid ? (
          <p className="text-sm text-amber-700">
            Link WhatsApp and resolve the JID on{" "}
            <Link
              href="/vendor/connected-channels"
              className="font-medium underline underline-offset-2"
              onClick={() => onOpenChange(false)}
            >
              Post to social media
            </Link>{" "}
            first
            {!groupJid ? " (Settings invite → JID)" : ""}.
          </p>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Caption to post
          </label>
          <Textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={4}
            placeholder="Caption to post"
          />
        </div>

        <Button
          disabled={post.isPending || !canPost}
          onClick={() =>
            post.mutate({
              channelJid: groupJid,
              caption: caption.trim(),
              imageUrl: absoluteMediaUrl(product.imageUrl),
              productId: product.id,
            })
          }
        >
          {post.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post to WhatsApp
        </Button>
      </DialogContent>
    </Dialog>
  );
}
