"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, ArrowLeft, XCircle } from "lucide-react";
import { trpc } from "@/trpc/client";
import { vendorHappyBannerTextSchema } from "@/lib/happy-banner/schema";
import type { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HappyBannerDisplay } from "@/components/happy-banner/HappyBannerDisplay";
import { HappyBannerThumbnail } from "@/components/happy-banner/HappyBannerThumbnail";
import { toast } from "sonner";

type FormValues = z.infer<typeof vendorHappyBannerTextSchema>;
type ViewMode = "pick" | "customize";

type VendorHappyBannerPageClientProps = {
  embedded?: boolean;
};

export function VendorHappyBannerPageClient({ embedded = false }: VendorHappyBannerPageClientProps) {
  const utils = trpc.useUtils();
  const wordsSectionRef = useRef<HTMLDivElement>(null);
  const { data: listData, isLoading: listLoading } = trpc.vendor.happyBanner.list.useQuery();
  const { data, isLoading } = trpc.vendor.happyBanner.get.useQuery();

  const [viewMode, setViewMode] = useState<ViewMode>("pick");

  const form = useForm<FormValues>({
    resolver: zodResolver(vendorHappyBannerTextSchema),
    defaultValues: { word1: "MEGA", word2: "50" },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({ word1: data.word1, word2: data.word2 });
    if (data.selectedBannerId && !embedded) {
      setViewMode("customize");
    }
  }, [data, form, embedded]);

  const selectMutation = trpc.vendor.happyBanner.select.useMutation({
    onSuccess: (result) => {
      toast.success("Banner selected — fill in your words below");
      utils.vendor.happyBanner.list.invalidate();
      utils.vendor.happyBanner.get.invalidate();
      form.reset({ word1: result.word1, word2: result.word2 });
      setViewMode("customize");
      wordsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    onError: (error) => toast.error(error.message || "Failed to select banner"),
  });

  const updateMutation = trpc.vendor.happyBanner.update.useMutation({
    onSuccess: (result) => {
      toast.success("Banner text saved");
      utils.vendor.happyBanner.get.invalidate();
      utils.vendor.happyBanner.list.invalidate();
      form.reset({ word1: result.word1, word2: result.word2 });
    },
    onError: (error) => toast.error(error.message || "Failed to save banner text"),
  });

  const clearMutation = trpc.vendor.happyBanner.clear.useMutation({
    onSuccess: () => {
      toast.success("Happy Banner removed from your storefront");
      utils.vendor.happyBanner.list.invalidate();
      utils.vendor.happyBanner.get.invalidate();
      setViewMode("pick");
      form.reset({ word1: "MEGA", word2: "50" });
    },
    onError: (error) => toast.error(error.message || "Failed to remove banner"),
  });

  const watchedWord1 = form.watch("word1");
  const watchedWord2 = form.watch("word2");
  const selectedBannerId = data?.selectedBannerId ?? null;
  const isWebsiteWord2 = data?.selectedPreset === "hue-editorial";
  const savedWord1 = data?.word1 ?? listData?.word1 ?? null;
  const savedWord2 = data?.word2 ?? listData?.word2 ?? null;

  const { data: livePreview } = trpc.vendor.happyBanner.previewBanner.useQuery(
    {
      bannerId: selectedBannerId ?? "",
      word1: watchedWord1,
      word2: watchedWord2,
    },
    { enabled: Boolean(selectedBannerId) },
  );

  const selectedBanner = useMemo(
    () => listData?.docs.find((banner) => banner.id === selectedBannerId) ?? null,
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
        {listData?.docs.map((banner: (typeof listData.docs)[number]) => {
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
                    {!isWebsiteWord2 ? "%" : ""}
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
                    variant="link"
                    className="mt-2 w-full"
                    onClick={() => setViewMode("customize")}
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

  const customizeSection =
    viewMode === "customize" && selectedBannerId ? (
      <div ref={wordsSectionRef} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your banner words</h2>
            <p className="text-sm text-gray-600">
              {selectedBanner
                ? `Design: ${selectedBanner.name} — your words are unique to your store.`
                : "Enter your words for the selected banner design."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {embedded ? (
              <Button variant="outline" size="sm" onClick={() => setViewMode("pick")}>
                Hide word editor
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setViewMode("pick")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change banner
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
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
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>{word1Slot?.label ?? "Word 1"} & {word2Slot?.label ?? "Word 2"}</CardTitle>
              <CardDescription>
                Your values for this design. Other vendors using the same design can enter
                different words.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
              >
                <div className="space-y-2">
                  <Label htmlFor="word1">{word1Slot?.label ?? "Word 1"}</Label>
                  <Input id="word1" {...form.register("word1")} className="uppercase" />
                  {form.formState.errors.word1 ? (
                    <p className="text-sm text-destructive">{form.formState.errors.word1.message}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{word1Slot?.hint}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="word2">{word2Slot?.label ?? "Word 2"}</Label>
                  <Input
                    id="word2"
                    {...form.register("word2")}
                    inputMode={isWebsiteWord2 ? "text" : "numeric"}
                    className={isWebsiteWord2 ? "uppercase" : undefined}
                  />
                  {form.formState.errors.word2 ? (
                    <p className="text-sm text-destructive">{form.formState.errors.word2.message}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{word2Slot?.hint}</p>
                  )}
                </div>

                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save words"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storefront preview</CardTitle>
              <CardDescription>Live preview with your Word 1 and Word 2.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                {livePreview ? (
                  <HappyBannerDisplay banner={livePreview} />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    Preview unavailable
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ) : null;

  if (embedded) {
    return (
      <section className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Pick a banner design and enter your words. Each vendor&apos;s text is unique to their
          store.
        </p>
        {bannerList}
        {customizeSection}
      </section>
    );
  }

  if (viewMode === "customize" && selectedBannerId) {
    return customizeSection;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Choose a banner design</h2>
        <p className="text-sm text-gray-600">
          Pick a design first. Multiple vendors can share the same design with different Word 1
          and Word 2.
        </p>
      </div>
      {bannerList}
    </section>
  );
}
