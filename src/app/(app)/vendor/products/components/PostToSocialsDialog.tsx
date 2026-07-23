"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SocialChannel = "instagram" | "facebook" | "whatsapp";

const CHANNELS: { value: SocialChannel; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "Business WhatsApp" },
];

interface PostToSocialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string; price: number };
}

function buildDefaultCaption(product: { id: string; name: string; price: number }) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
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
  const [selected, setSelected] = useState<Set<SocialChannel>>(new Set());

  const postProduct = trpc.social.postProduct.useMutation({
    onSuccess: (data) => {
      if (data.failed === 0) {
        toast.success(`Posted to ${data.posted} channel${data.posted === 1 ? "" : "s"}`);
      } else {
        const failedChannels = data.results
          .filter((r) => r.status === "failed")
          .map((r) => r.channel)
          .join(", ");
        toast.warning(
          `Posted to ${data.posted}, failed on ${failedChannels}. Check social credentials.`
        );
      }
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post product");
    },
  });

  const toggleChannel = (channel: SocialChannel, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(channel);
      else next.delete(channel);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 0) {
      toast.error("Select at least one channel");
      return;
    }
    if (!caption.trim()) {
      toast.error("Caption is required");
      return;
    }
    postProduct.mutate({
      productId: product.id,
      channels: Array.from(selected),
      caption,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Post to socials</DialogTitle>
          <DialogDescription>
            Share “{product.name}” to your connected social channels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Channels</Label>
            <div className="flex flex-col gap-2">
              {CHANNELS.map((channel) => (
                <label
                  key={channel.value}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selected.has(channel.value)}
                    onCheckedChange={(checked) =>
                      toggleChannel(channel.value, checked as boolean)
                    }
                  />
                  {channel.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-caption">Caption</Label>
            <Textarea
              id="social-caption"
              rows={5}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={postProduct.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={postProduct.isPending}>
            {postProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
