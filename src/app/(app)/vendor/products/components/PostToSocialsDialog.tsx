"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Instagram, Loader2, Sparkles } from "lucide-react";
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
import {
  DEFAULT_BANNER_BRIEF,
  DEFAULT_BANNER_INSTRUCTION_WITHOUT_PHOTO,
  DEFAULT_BANNER_INSTRUCTION_WITH_PHOTO,
} from "@/lib/instagram-banner-prompts";

const CAPTION_LIMIT = 2200;

interface PostToSocialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string; price: number; imageUrl?: string | null };
  /** Staff console: post as this vendor instead of the logged-in vendor. */
  mode?: "vendor" | "staff";
  vendorId?: string;
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

function downloadFileName(productName: string, productId: string) {
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${slug || "instagram-banner"}-${productId.slice(-6)}.png`;
}

export function PostToSocialsDialog({
  open,
  onOpenChange,
  product,
  mode = "vendor",
  vendorId,
}: PostToSocialsDialogProps) {
  const isStaff = mode === "staff";
  const staffVendorId = isStaff ? vendorId : undefined;

  const defaultCaption = useMemo(() => buildDefaultCaption(product), [product]);
  const [caption, setCaption] = useState(defaultCaption);
  const [instruction, setInstruction] = useState(DEFAULT_BANNER_INSTRUCTION_WITH_PHOTO);
  const [brief, setBrief] = useState(DEFAULT_BANNER_BRIEF);
  const [useSourceImage, setUseSourceImage] = useState(true);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [createAnother, setCreateAnother] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [instagram, setInstagram] = useState<PublicSocialConnection | null>(null);
  const [statusLoaded, setStatusLoaded] = useState(false);

  const vendorOpenAi = trpc.vendor.dashboard.getOpenAiConfig.useQuery(undefined, {
    enabled: open && !isStaff,
  });
  const staffOpenAi = trpc.admin.social.getOpenAiConfig.useQuery(
    { vendorId: staffVendorId! },
    { enabled: open && isStaff && Boolean(staffVendorId) },
  );
  const openAiConfig = isStaff ? staffOpenAi.data : vendorOpenAi.data;

  const staffIgStatus = trpc.admin.social.instagramStatus.useQuery(
    { vendorId: staffVendorId! },
    { enabled: open && isStaff && Boolean(staffVendorId) },
  );

  useEffect(() => {
    if (!open) return;
    setCaption(buildDefaultCaption(product));
    setInstruction(
      product.imageUrl
        ? DEFAULT_BANNER_INSTRUCTION_WITH_PHOTO
        : DEFAULT_BANNER_INSTRUCTION_WITHOUT_PHOTO
    );
    setBrief(DEFAULT_BANNER_BRIEF);
    setUseSourceImage(Boolean(product.imageUrl));
    setBannerUrl(null);
  }, [open, product]);

  useEffect(() => {
    if (!open) return;

    if (isStaff) {
      setStatusLoaded(!staffIgStatus.isLoading);
      const ig = Array.isArray(staffIgStatus.data)
        ? staffIgStatus.data.find((c) => c.platform === "instagram" && c.connected) ??
          null
        : null;
      setInstagram(ig);
      return;
    }

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
  }, [open, isStaff, staffIgStatus.data, staffIgStatus.isLoading]);

  const vendorGenerateBanner = trpc.social.generateBanner.useMutation({
    onSuccess: (data) => {
      setBannerUrl(data.imageUrl);
      toast.success("Banner ready. Preview it, then post.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate banner");
    },
  });

  const staffGenerateBanner = trpc.admin.social.generateBanner.useMutation({
    onSuccess: (data) => {
      setBannerUrl(data.imageUrl);
      toast.success("Banner ready. Preview it, then post.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate banner");
    },
  });

  const generateBanner = isStaff ? staffGenerateBanner : vendorGenerateBanner;

  const vendorPostProduct = trpc.social.postProduct.useMutation({
    onSuccess: (data) => {
      const ig = data.results.find((r) => r.channel === "instagram");
      if (ig?.status === "posted") {
        toast.success("Posted to Instagram");
        if (createAnother) {
          setCaption(buildDefaultCaption(product));
          setBannerUrl(null);
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

  const staffPostProduct = trpc.admin.social.postProduct.useMutation({
    onSuccess: (data) => {
      const ig = data.results.find((r) => r.channel === "instagram");
      if (ig?.status === "posted") {
        toast.success("Posted to Instagram");
        if (createAnother) {
          setCaption(buildDefaultCaption(product));
          setBannerUrl(null);
          return;
        }
        onOpenChange(false);
        return;
      }
      toast.error(
        ig?.error ||
          "Instagram post failed. Have the vendor connect Instagram under Post to social media.",
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post to Instagram");
    },
  });

  const postProduct = isStaff ? staffPostProduct : vendorPostProduct;

  const previewImageUrl = bannerUrl || product.imageUrl;
  const canPost = Boolean(caption.trim()) && Boolean(instagram) && Boolean(previewImageUrl);

  const handleDownload = async () => {
    if (!previewImageUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(previewImageUrl);
      if (!res.ok) throw new Error("Could not download the image");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = downloadFileName(product.name, product.id);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(previewImageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  const handleUsePhotoChange = (checked: boolean) => {
    setUseSourceImage(checked);
    setInstruction((current) => {
      const isDefault =
        current === DEFAULT_BANNER_INSTRUCTION_WITH_PHOTO ||
        current === DEFAULT_BANNER_INSTRUCTION_WITHOUT_PHOTO;
      if (!isDefault) return current;
      return checked
        ? DEFAULT_BANNER_INSTRUCTION_WITH_PHOTO
        : DEFAULT_BANNER_INSTRUCTION_WITHOUT_PHOTO;
    });
  };

  const handleGenerate = () => {
    if (useSourceImage && !product.imageUrl) {
      toast.error("This product needs an image, or turn off “Use product photo”");
      return;
    }
    if (!openAiConfig?.hasApiKey) {
      toast.error(
        isStaff
          ? "This vendor needs an OpenAI API key in Settings first"
          : "Add your OpenAI API key in Settings first",
      );
      return;
    }
    if (instruction.trim().length < 8 || brief.trim().length < 8) {
      toast.error("Add both the generation instructions and the creative brief");
      return;
    }
    if (isStaff) {
      if (!staffVendorId) return;
      staffGenerateBanner.mutate({
        vendorId: staffVendorId,
        productId: product.id,
        instruction: instruction.trim(),
        brief: brief.trim(),
        useSourceImage,
      });
      return;
    }
    vendorGenerateBanner.mutate({
      productId: product.id,
      instruction: instruction.trim(),
      brief: brief.trim(),
      useSourceImage,
    });
  };

  const handleSubmit = () => {
    if (!instagram) {
      toast.error(
        isStaff
          ? "This vendor has not connected Instagram yet"
          : "Connect Instagram in Connected Channels first",
      );
      return;
    }
    if (!caption.trim()) {
      toast.error("Write a caption before posting");
      return;
    }
    if (isStaff) {
      if (!staffVendorId) return;
      staffPostProduct.mutate({
        vendorId: staffVendorId,
        productId: product.id,
        channels: ["instagram"],
        caption,
        ...(bannerUrl ? { imageUrl: bannerUrl } : {}),
      });
      return;
    }
    vendorPostProduct.mutate({
      productId: product.id,
      channels: ["instagram"],
      caption,
      ...(bannerUrl ? { imageUrl: bannerUrl } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(960px,calc(100vw-1.5rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
        <div className="border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold">Post to Instagram</DialogTitle>
          <DialogDescription className="sr-only">
            Create an Instagram post or AI banner for {product.name}.
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
                  {isStaff ? (
                    <>
                      This vendor has not connected Instagram. They connect it under{" "}
                      <span className="font-medium">Post to social media</span>, or
                      impersonate them to connect.
                    </>
                  ) : (
                    <>
                      <Link
                        href="/vendor/connected-channels"
                        className="underline underline-offset-2"
                      >
                        Connect Instagram
                      </Link>{" "}
                      to post this product.
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={useSourceImage}
                  onCheckedChange={(checked) => handleUsePhotoChange(Boolean(checked))}
                  disabled={!product.imageUrl}
                />
                Use this product photo
              </label>
              <div className="space-y-1">
                <p className="text-sm font-medium">Generation instructions</p>
                <Textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value.slice(0, 2000))}
                  className="min-h-24 text-sm"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Creative brief</p>
                <Textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value.slice(0, 1200))}
                  className="min-h-20 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generateBanner.isPending || (useSourceImage && !product.imageUrl)}
                >
                  {generateBanner.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {generateBanner.isPending ? "Generating banner…" : "Generate banner"}
                </Button>
                {bannerUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setBannerUrl(null)}
                  >
                    Use original photo
                  </Button>
                )}
              </div>
              {!openAiConfig?.hasApiKey && (
                <p className="text-xs text-muted-foreground">
                  {isStaff ? (
                    <>This vendor needs an OpenAI API key in Settings to generate banners.</>
                  ) : (
                    <>
                      Add an{" "}
                      <Link href="/vendor/settings" className="underline underline-offset-2">
                        OpenAI API key
                      </Link>{" "}
                      in Settings to generate sale banners.
                    </>
                  )}
                </p>
              )}
            </div>

            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_LIMIT))}
              placeholder="Write a caption"
              className="min-h-28"
            />
            <p className="text-right text-xs text-muted-foreground">
              {CAPTION_LIMIT - caption.length} characters left
            </p>

            {previewImageUrl ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImageUrl}
                  alt={product.name}
                  className="max-h-56 w-full rounded-md object-contain bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-3.5 w-3.5" />
                  )}
                  Download
                </Button>
              </div>
            ) : (
              <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                This product needs a public image before Instagram can publish it.
              </p>
            )}
            {bannerUrl && (
              <p className="text-xs text-muted-foreground">
                Posting the generated banner, not the original product photo.
              </p>
            )}
          </div>

          <div className="hidden border-l bg-muted/20 p-4 lg:block">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Preview</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!previewImageUrl || downloading}
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-2 h-3.5 w-3.5" />
                )}
                Download
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="border-b px-3 py-2 text-sm font-semibold">
                {instagram?.username ? `@${instagram.username}` : "yourshop"}
              </div>
              <div className="flex aspect-4/5 items-center justify-center bg-muted">
                {previewImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImageUrl} alt="" className="h-full w-full object-cover" />
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
            disabled={postProduct.isPending || generateBanner.isPending || !canPost}
          >
            {postProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post to Instagram
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
