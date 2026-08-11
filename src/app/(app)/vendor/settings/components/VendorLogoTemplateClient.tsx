"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import { vendorLogoTextSchema } from "@/lib/vendor-logo/schema";
import type { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorLogoDisplay } from "@/components/vendor-logo/VendorLogoDisplay";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof vendorLogoTextSchema>;
type LogoTemplateListItem =
  inferRouterOutputs<AppRouter>["vendor"]["logoTemplate"]["list"]["docs"][number];
type SourceMode = "template" | "upload";
type ViewMode = "pick" | "customize";

type VendorLogoTemplateClientProps = {
  embedded?: boolean;
};

export function VendorLogoTemplateClient({ embedded = false }: VendorLogoTemplateClientProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const wordsSectionRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState<SourceMode>("template");
  const [viewMode, setViewMode] = useState<ViewMode>("pick");

  const { data: listData, isLoading: listLoading, isError: listError } =
    trpc.vendor.logoTemplate.list.useQuery();
  const { data, isLoading, isError: getError } = trpc.vendor.logoTemplate.get.useQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(vendorLogoTextSchema),
    defaultValues: { word1: "A" },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({ word1: data.word1 });
    setSourceMode(data.logoSource === "upload" ? "upload" : "template");
    if (data.uploadLogoUrl) setLogoPreview(data.uploadLogoUrl);
    if (data.logoSource === "template" && data.selectedTemplateId && !embedded) {
      setViewMode("customize");
    }
  }, [data, form, embedded]);

  const selectMutation = trpc.vendor.logoTemplate.select.useMutation({
    onSuccess: (result) => {
      toast.success("Logo selected — choose your initial below");
      utils.vendor.logoTemplate.list.invalidate();
      utils.vendor.logoTemplate.get.invalidate();
      utils.vendor.dashboard.getMarketingProfile.invalidate();
      form.reset({ word1: result.word1 });
      setSourceMode("template");
      setViewMode("customize");
      wordsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    onError: (error) => toast.error(error.message || "Failed to select logo"),
  });

  const updateWordsMutation = trpc.vendor.logoTemplate.updateWords.useMutation({
    onSuccess: (result) => {
      toast.success("Logo initial saved");
      utils.vendor.logoTemplate.get.invalidate();
      form.reset({ word1: result.word1 });
    },
    onError: (error) => toast.error(error.message || "Failed to save logo words"),
  });

  const setSourceMutation = trpc.vendor.logoTemplate.setSource.useMutation({
    onSuccess: () => {
      utils.vendor.logoTemplate.get.invalidate();
      utils.vendor.logoTemplate.list.invalidate();
    },
  });

  const updateUploadMutation = trpc.vendor.dashboard.updateMarketingProfile.useMutation({
    onSuccess: () => {
      toast.success("Custom logo saved");
      utils.vendor.dashboard.getMarketingProfile.invalidate();
      utils.vendor.logoTemplate.get.invalidate();
      router.refresh();
    },
    onError: (error) => toast.error(error.message || "Failed to save logo"),
  });

  const watchedWord1 = form.watch("word1");
  const selectedTemplateId = data?.selectedTemplateId ?? listData?.selectedTemplateId ?? null;

  const { data: livePreview } = trpc.vendor.logoTemplate.previewTemplate.useQuery(
    {
      templateId: selectedTemplateId ?? "",
      word1: watchedWord1,
    },
    { enabled: Boolean(selectedTemplateId) && sourceMode === "template" },
  );

  const selectedTemplate = useMemo(
    () =>
      listData?.docs.find((item: LogoTemplateListItem) => item.id === selectedTemplateId) ?? null,
    [listData, selectedTemplateId],
  );

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to upload image");
      const result = await response.json();
      if (result.doc?.id) {
        setLogoPreview(result.doc.url ?? null);
        await setSourceMutation.mutateAsync({ source: "upload" });
        updateUploadMutation.mutate({ logo: result.doc.id });
        setSourceMode("upload");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading || listLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (listError || getError) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          Could not load logo options. Please refresh the page.
        </CardContent>
      </Card>
    );
  }

  const sourceToggle = (
    <div className="inline-flex rounded-lg border bg-muted p-1">
      <Button
        type="button"
        size="sm"
        variant={sourceMode === "template" ? "default" : "ghost"}
        className="rounded-md"
        onClick={() => setSourceMode("template")}
      >
        Logo templates
      </Button>
      <Button
        type="button"
        size="sm"
        variant={sourceMode === "upload" ? "default" : "ghost"}
        className="rounded-md"
        onClick={() => setSourceMode("upload")}
      >
        Upload your own
      </Button>
    </div>
  );

  const templateGrid = (
    <>
      {!listData?.docs.length ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No logo templates are available yet. Run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              npx tsx scripts/seed-vendor-logo-templates.ts
            </code>{" "}
            or ask your platform admin.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {listData.docs.map((template: LogoTemplateListItem) => {
            const isSelected = template.id === selectedTemplateId;
            return (
              <Card
                key={template.id}
                className={cn(
                  "overflow-hidden transition-colors",
                  isSelected ? "ring-2 ring-primary" : "hover:border-primary/40",
                )}
              >
                <div className="relative aspect-square bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    <VendorLogoDisplay
                      logo={{
                        templateId: template.id,
                        templateName: template.name,
                        preset: template.preset,
                        word1: template.defaultWord1,
                        word2: template.defaultWord2,
                        theme: template.theme,
                      }}
                      className="h-full w-full"
                    />
                  </div>
                  {isSelected ? (
                    <div className="absolute right-2 top-2">
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Selected
                      </Badge>
                    </div>
                  ) : null}
                </div>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {isSelected ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setViewMode("customize");
                        wordsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      Edit your initial
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={selectMutation.isPending}
                      onClick={() => selectMutation.mutate({ templateId: template.id })}
                    >
                      {selectMutation.isPending ? "Selecting…" : "Select"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );

  const customizeSection =
    selectedTemplateId && sourceMode === "template" ? (
      <div ref={wordsSectionRef} className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Choose your initial</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedTemplate
                ? `Design: ${selectedTemplate.name} — one colorful letter for your monogram.`
                : "Enter one letter for your selected monogram design."}
            </p>
          </div>
          {!embedded ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setViewMode("pick")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to designs
            </Button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {data?.vendorWordSlots?.word1.label ?? "Your brand initial"}
              </CardTitle>
              <CardDescription>
                One letter appears large in the center of your colorful South Asian monogram.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((values) => updateWordsMutation.mutate(values))}
              >
                <div>
                  <Label htmlFor="logo-word1">
                    {data?.vendorWordSlots?.word1.label ?? "Your brand initial"}
                  </Label>
                  <Input
                    id="logo-word1"
                    {...form.register("word1")}
                    maxLength={1}
                    className="mt-1 w-20 text-center text-2xl font-semibold uppercase"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data?.vendorWordSlots?.word1.hint ??
                      "One letter — e.g. A for Anaya, M for Maruthi"}
                  </p>
                </div>
                <Button type="submit" disabled={updateWordsMutation.isPending}>
                  {updateWordsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save initial"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mx-auto flex max-w-[200px] flex-col items-center gap-3 rounded-lg border bg-muted/30 p-4">
                {livePreview ? (
                  <VendorLogoDisplay logo={livePreview} className="aspect-square w-full" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center text-sm text-muted-foreground">
                    Preview unavailable
                  </div>
                )}
                <p className="text-center text-xs text-muted-foreground">
                  How your monogram appears on your storefront
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ) : null;

  const uploadSection =
    sourceMode === "upload" ? (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Upload your logo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your own image instead of a template design.
          </p>
        </div>
        {logoPreview ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border bg-white">
              <Image
                src={logoPreview}
                alt="Store logo"
                fill
                className="object-contain p-2"
                sizes="128px"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUpload(file);
                    e.target.value = "";
                  }}
                />
                <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Replace logo
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start px-0 text-destructive"
                disabled={uploading || updateUploadMutation.isPending}
                onClick={() => {
                  setLogoPreview(null);
                  updateUploadMutation.mutate({ logo: null });
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Remove logo
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-sm rounded-lg border-2 border-dashed p-8 text-center">
            <label className="flex cursor-pointer flex-col items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                  e.target.value = "";
                }}
              />
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                {uploading ? "Uploading…" : "Upload your logo"}
              </span>
              <span className="text-xs text-muted-foreground">PNG or JPG, square works best</span>
            </label>
          </div>
        )}
      </div>
    ) : null;

  const templatePickSection = (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Choose a logo design</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a colorful South Asian monogram, then add your shop&apos;s initial letter.
        </p>
      </div>
      {templateGrid}
    </div>
  );

  const templateSection =
    sourceMode === "template" ? (
      <div className="space-y-6">
        {(embedded || viewMode === "pick") && templatePickSection}
        {(embedded || viewMode === "customize") && customizeSection}
      </div>
    ) : null;

  const body = (
    <section className="space-y-6">
      {sourceToggle}
      {templateSection}
      {uploadSection}
    </section>
  );

  if (embedded) {
    return (
      <section className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Pick a colorful monogram or upload your own logo, then set your shop&apos;s initial
          letter.
        </p>
        {body}
      </section>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your store logo</CardTitle>
        <CardDescription>
          Upload your own logo or choose a colorful South Asian monogram and personalize it with
          one initial letter.
        </CardDescription>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
