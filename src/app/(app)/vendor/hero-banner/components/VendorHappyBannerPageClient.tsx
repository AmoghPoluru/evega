"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import { vendorHappyBannerTextSchema } from "@/lib/happy-banner/schema";
import type { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HappyBannerDisplay } from "@/components/happy-banner/HappyBannerDisplay";
import { HappyBannerThumbnail } from "@/components/happy-banner/HappyBannerThumbnail";
import { getVendorWord2InputMode } from "@/lib/happy-banner/validate-vendor-words";
import { toast } from "sonner";

type FormValues = z.infer<typeof vendorHappyBannerTextSchema>;

type VendorHappyBannerPageClientProps = {
  embedded?: boolean;
};

type HappyBannerListItem =
  inferRouterOutputs<AppRouter>["vendor"]["happyBanner"]["list"]["docs"][number];

export function VendorHappyBannerPageClient({ embedded = false }: VendorHappyBannerPageClientProps) {
  const utils = trpc.useUtils();
  const [wordsDialogOpen, setWordsDialogOpen] = useState(false);

  const { data: listData, isLoading: listLoading } = trpc.vendor.happyBanner.list.useQuery();
  const { data, isLoading } = trpc.vendor.happyBanner.get.useQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(vendorHappyBannerTextSchema),
    defaultValues: { word1: "MEGA", word2: "50" },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({ word1: data.word1, word2: data.word2 });
  }, [data, form]);

  const openWordsDialog = (word1: string, word2: string) => {
    form.reset({ word1, word2 });
    setWordsDialogOpen(true);
  };

  const selectMutation = trpc.vendor.happyBanner.select.useMutation({
    onSuccess: (result) => {
      toast.success("Banner selected — customize your words");
      utils.vendor.happyBanner.list.invalidate();
      utils.vendor.happyBanner.get.invalidate();
      openWordsDialog(result.word1, result.word2);
    },
    onError: (error) => toast.error(error.message || "Failed to select banner"),
  });

  const updateMutation = trpc.vendor.happyBanner.update.useMutation({
    onSuccess: (result) => {
      toast.success("Banner text saved");
      utils.vendor.happyBanner.get.invalidate();
      utils.vendor.happyBanner.list.invalidate();
      form.reset({ word1: result.word1, word2: result.word2 });
      setWordsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message || "Failed to save banner text"),
  });

  const clearMutation = trpc.vendor.happyBanner.clear.useMutation({
    onSuccess: () => {
      toast.success("Happy Banner removed from your storefront");
      utils.vendor.happyBanner.list.invalidate();
      utils.vendor.happyBanner.get.invalidate();
      setWordsDialogOpen(false);
      form.reset({ word1: "MEGA", word2: "50" });
    },
    onError: (error) => toast.error(error.message || "Failed to remove banner"),
  });

  const watchedWord1 = form.watch("word1");
  const watchedWord2 = form.watch("word2");
  const selectedBannerId = data?.selectedBannerId ?? null;
  const word2InputMode = data?.selectedPreset
    ? getVendorWord2InputMode(data.selectedPreset)
    : "numeric";
  const isNumericWord2 = word2InputMode === "numeric";
  const savedWord1 = data?.word1 ?? listData?.word1 ?? null;
  const savedWord2 = data?.word2 ?? listData?.word2 ?? null;

  const { data: livePreview } = trpc.vendor.happyBanner.previewBanner.useQuery(
    {
      bannerId: selectedBannerId ?? "",
      word1: watchedWord1,
      word2: watchedWord2,
    },
    { enabled: Boolean(selectedBannerId) && wordsDialogOpen },
  );

  const selectedBanner = useMemo(
    () => listData?.docs.find((banner: HappyBannerListItem) => banner.id === selectedBannerId) ?? null,
    [listData, selectedBannerId],
  );

  if (isLoading || listLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!data?.platformEnabled) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Happy Banners are currently disabled by your platform admin.
        </CardContent>
      </Card>
    );
  }

  const word1Slot = data.vendorWordSlots?.[0];
  const word2Slot = data.vendorWordSlots?.[1];

  const wordsDialog = (
    <Dialog
      open={wordsDialogOpen}
      onOpenChange={(open) => {
        setWordsDialogOpen(open);
        if (open && savedWord1 && savedWord2) {
          form.reset({ word1: savedWord1, word2: savedWord2 });
        }
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl" showCloseButton>
        <DialogHeader className="space-y-1 border-b px-6 py-4 text-left">
          <DialogTitle>Edit your banner words</DialogTitle>
          <DialogDescription>
            {selectedBanner
              ? `${selectedBanner.name} — your words appear on your storefront banner.`
              : "Enter your words for the selected banner design."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(70vh,640px)] overflow-y-auto px-6 py-4">
          <form
            id="banner-words-form"
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="banner-word1">{word1Slot?.label ?? "Word 1"}</Label>
              <Input
                id="banner-word1"
                {...form.register("word1")}
                className="uppercase"
                autoComplete="off"
              />
              {form.formState.errors.word1 ? (
                <p className="text-sm text-destructive">{form.formState.errors.word1.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{word1Slot?.hint}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-word2">{word2Slot?.label ?? "Word 2"}</Label>
              <Input
                id="banner-word2"
                {...form.register("word2")}
                inputMode={isNumericWord2 ? "numeric" : "text"}
                className={isNumericWord2 ? undefined : "uppercase"}
                autoComplete="off"
              />
              {form.formState.errors.word2 ? (
                <p className="text-sm text-destructive">{form.formState.errors.word2.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{word2Slot?.hint}</p>
              )}
            </div>
          </form>

          <div className="mt-5 space-y-2">
            <p className="text-sm font-medium text-foreground">Live preview</p>
            <div className="overflow-hidden rounded-lg border">
              {livePreview ? (
                <HappyBannerDisplay banner={livePreview} />
              ) : (
                <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">
                  Preview unavailable
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={clearMutation.isPending}
            onClick={() => clearMutation.mutate()}
          >
            {clearMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Remove banner
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setWordsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="banner-words-form" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save words"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const bannerList = (
    <>
      {selectedBannerId ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Current selection active on your storefront</Badge>
          {!embedded ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={clearMutation.isPending}
              onClick={() => clearMutation.mutate()}
            >
              Remove banner
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listData?.docs.map((banner: HappyBannerListItem) => {
          const isSelected = banner.id === selectedBannerId;
          return (
            <Card
              key={banner.id}
              className={`overflow-hidden ${isSelected ? "ring-2 ring-primary" : ""}`}
            >
              <HappyBannerThumbnail
                thumbnailUrl={banner.thumbnailUrl}
                banner={{
                  id: banner.id,
                  name: banner.name,
                  slug: banner.slug,
                  description: banner.description,
                  preset: banner.preset,
                  defaultWord1: banner.defaultWord1,
                  defaultWord2: banner.defaultWord2,
                  eyebrowText: banner.eyebrowText,
                  secondaryWord: banner.secondaryWord,
                  ctaLabel: banner.ctaLabel,
                  discountPrefix: banner.discountPrefix,
                  discountSuffix: banner.discountSuffix,
                  theme: banner.theme,
                }}
                word1={isSelected ? savedWord1 : null}
                word2={isSelected ? savedWord2 : null}
                alt={banner.name}
                className="h-36 w-full"
              />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{banner.name}</CardTitle>
                    {banner.description ? (
                      <CardDescription className="mt-1 line-clamp-2">{banner.description}</CardDescription>
                    ) : null}
                  </div>
                  {isSelected ? (
                    <Badge className="shrink-0 bg-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Current
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isSelected && savedWord1 && savedWord2 ? (
                  <p className="text-xs font-medium text-primary">
                    Your words: {savedWord1} / {savedWord2}
                    {isNumericWord2 ? "%" : ""}
                  </p>
                ) : banner.vendorWordSlots ? (
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll fill in: {banner.vendorWordSlots[0]?.label} /{" "}
                    {banner.vendorWordSlots[1]?.label}
                  </p>
                ) : null}
                <Button
                  className="w-full"
                  disabled={isSelected || selectMutation.isPending}
                  onClick={() => selectMutation.mutate({ bannerId: banner.id })}
                >
                  {selectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSelected ? (
                    "Selected"
                  ) : (
                    "Select & fill words"
                  )}
                </Button>
                {isSelected ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (savedWord1 && savedWord2) {
                        openWordsDialog(savedWord1, savedWord2);
                      }
                    }}
                  >
                    Edit your words
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!listData?.docs.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No banner designs available yet. Ask your admin to create Happy Banners.
          </CardContent>
        </Card>
      ) : null}
    </>
  );

  return (
    <section className="space-y-6">
      {!embedded ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Choose a banner design</h2>
          <p className="text-sm text-gray-600">
            Pick a design, then customize your words in the editor popup.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pick a banner design and enter your words. Each vendor&apos;s text is unique to their
          store.
        </p>
      )}
      {bannerList}
      {wordsDialog}
    </section>
  );
}
