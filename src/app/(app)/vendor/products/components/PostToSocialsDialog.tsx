"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Instagram, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublicSocialConnection } from "@/lib/vendor-social-connections";

const CAPTION_LIMIT = 2200;

interface PostToSocialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string; price: number; imageUrl?: string | null };
}

function buildDefaultCaption(product: { id: string; name: string; price: number }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);
  const url = `${appUrl}/products/${product.id}`;
  return `${product.name} — ${price}\n${url}`;
}

export function PostToSocialsDialog({
  open,
  onOpenChange,
  product,
}: PostToSocialsDialogProps) {
  const defaultCaption = useMemo(() => buildDefaultCaption(product), [product]);
  const [caption, setCaption] = useState(defaultCaption);
  const [createAnother, setCreateAnother] = useState(false);
  const [instagram, setInstagram] = useState<PublicSocialConnection | null>(null);
  const [statusLoaded, setStatusLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCaption(buildDefaultCaption(product));
  }, [open, product]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatusLoaded(false);
    fetch("/api/socials/status")
      .then(async (res) => {
        if (!res.ok) return [] as PublicSocialConnection[];
        return (await res.json()) as PublicSocialConnection[];
      })
      .then((connections) => {
        if (cancelled) return;
        const ig = Array.isArray(connections)
          ? connections.find((c) => c.platform === "instagram" && c.connected) ?? null
          : null;
        setInstagram(ig);
      })
      .catch(() => {
        if (!cancelled) setInstagram(null);
      })
      .finally(() => {
        if (!cancelled) setStatusLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const postProduct = trpc.social.postProduct.useMutation({
    onSuccess: (data) => {
      const ig = data.results.find((r) => r.channel === "instagram");
      if (ig?.status === "posted") {
        toast.success("Posted to Instagram");
        if (createAnother) {
          setCaption(buildDefaultCaption(product));
          return;
        }
        onOpenChange(false);
        return;
      }
      toast.error(ig?.error || "Instagram post failed. Connect Instagram in Connected Channels.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post to Instagram");
    },
  });

  const canPost = Boolean(caption.trim()) && Boolean(instagram);

  const handleSubmit = () => {
    if (!instagram) {
      toast.error("Connect Instagram in Connected Channels first");
      return;
    }
    if (!caption.trim()) {
      toast.error("Write a caption before posting");
      return;
    }
    postProduct.mutate({
      productId: product.id,
      channels: ["instagram"],
      caption,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(960px,calc(100vw-1.5rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
        <div className="border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold">Post to Instagram</DialogTitle>
          <DialogDescription className="sr-only">
            Create an Instagram post for {product.name}.
          </DialogDescription>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
          <div className="min-h-0 space-y-4 overflow-y-auto p-4">
            <div className="text-sm">
              {statusLoaded && instagram ? (
                <p className="flex items-center gap-2 font-medium">
                  <Instagram className="h-4 w-4" />
                  @{instagram.username}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  <Link href="/vendor/connected-channels" className="underline underline-offset-2">
                    Connect Instagram
                  </Link>{" "}
                  to post this product.
                </p>
              )}
            </div>

            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_LIMIT))}
              placeholder="Write a caption"
              className="min-h-32"
            />
            <p className="text-right text-xs text-muted-foreground">
              {CAPTION_LIMIT - caption.length} characters left
            </p>

            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-56 w-full rounded-md object-contain bg-muted"
              />
            ) : (
              <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                This product needs a public image (Vercel Blob) before Instagram can publish it.
              </p>
            )}
          </div>

          <div className="hidden border-l bg-muted/20 p-4 lg:block">
            <p className="mb-3 text-sm font-medium">Preview</p>
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="border-b px-3 py-2 text-sm font-semibold">
                {instagram?.username ? `@${instagram.username}` : "yourshop"}
              </div>
              <div className="flex aspect-square items-center justify-center bg-muted">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <p className="px-6 text-center text-sm text-muted-foreground">No image</p>
                )}
              </div>
              <p className="whitespace-pre-wrap wrap-break-word p-3 text-sm">
                <span className="font-semibold">{instagram?.username || "yourshop"} </span>
                {caption || "Caption preview"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={createAnother}
              onCheckedChange={(checked) => setCreateAnother(Boolean(checked))}
            />
            Create another
          </label>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={postProduct.isPending || !canPost}
          >
            {postProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post to Instagram
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
