"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HappyBannerDisplay } from "@/components/happy-banner/HappyBannerDisplay";
import { buildResolvedHappyBanner } from "@/lib/happy-banner/format-banner";
import {
  HAPPY_BANNER_PRESET_DEFAULTS,
  HAPPY_BANNER_PRESET_OPTIONS,
} from "@/lib/happy-banner/presets";
import type { HappyBannerPreset } from "@/lib/happy-banner/types";
import { toast } from "sonner";

type FormState = {
  preset: HappyBannerPreset;
  name: string;
  slug: string;
  description: string;
  word1Label: string;
  word1Hint: string;
  word1Default: string;
  word2Label: string;
  word2Hint: string;
  word2Default: string;
  eyebrowText: string;
  secondaryWord: string;
  ctaLabel: string;
  discountPrefix: string;
  discountSuffix: string;
  backgroundColor: string;
  accentYellow: string;
  accentPink: string;
  previewImageId: string | null;
  previewImageUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
};

const emptyForm: FormState = {
  preset: "mega-sale",
  name: "",
  slug: "",
  description: "",
  word1Label: "Word 1",
  word1Hint: "Main headline (e.g. MEGA, SUMMER)",
  word1Default: "MEGA",
  word2Label: "Word 2",
  word2Hint: "Discount number before % (e.g. 50, 35)",
  word2Default: "50",
  eyebrowText: "LIMITED TIME ONLY",
  secondaryWord: "SALE",
  ctaLabel: "SHOP NOW",
  discountPrefix: "UP TO",
  discountSuffix: "OFF",
  backgroundColor: "#1b2db8",
  accentYellow: "#ffd400",
  accentPink: "#ff2d9a",
  previewImageId: null,
  previewImageUrl: null,
  isDefault: false,
  isActive: true,
};

function formFromPresetDefaults(preset: HappyBannerPreset): FormState {
  const defaults = HAPPY_BANNER_PRESET_DEFAULTS[preset];
  return {
    preset,
    name: "",
    slug: "",
    description: defaults.description,
    word1Label: defaults.word1Label,
    word1Hint: defaults.word1Hint,
    word1Default: defaults.word1Default,
    word2Label: defaults.word2Label,
    word2Hint: defaults.word2Hint,
    word2Default: defaults.word2Default,
    eyebrowText: defaults.eyebrowText,
    secondaryWord: defaults.secondaryWord,
    ctaLabel: defaults.ctaLabel,
    discountPrefix: defaults.discountPrefix,
    discountSuffix: defaults.discountSuffix,
    backgroundColor: defaults.backgroundColor,
    accentYellow: defaults.accentYellow,
    accentPink: defaults.accentPink,
    previewImageId: null,
    previewImageUrl: null,
    isDefault: false,
    isActive: true,
  };
}

type Props = {
  bannerId?: string;
};

export function StaffHappyBannerForm({ bannerId }: Props) {
  const router = useRouter();
  const isEditing = Boolean(bannerId);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: banner, isLoading } = trpc.admin.happyBanners.getOne.useQuery(
    { id: bannerId ?? "" },
    { enabled: isEditing },
  );

  useEffect(() => {
    if (!isEditing || !banner) return;
    setForm({
      preset: (banner.preset as HappyBannerPreset) ?? "mega-sale",
      name: banner.name ?? "",
      slug: banner.slug ?? "",
      description: banner.description ?? "",
      word1Label: banner.vendorWords?.word1?.label ?? "Word 1",
      word1Hint: banner.vendorWords?.word1?.hint ?? "Main headline (e.g. MEGA, SUMMER)",
      word1Default: banner.vendorWords?.word1?.defaultValue ?? banner.defaultWord1 ?? "MEGA",
      word2Label: banner.vendorWords?.word2?.label ?? "Word 2",
      word2Hint: banner.vendorWords?.word2?.hint ?? "Discount number before % (e.g. 50, 35)",
      word2Default: banner.vendorWords?.word2?.defaultValue ?? banner.defaultWord2 ?? "50",
      eyebrowText: banner.eyebrowText ?? "LIMITED TIME ONLY",
      secondaryWord: banner.secondaryWord ?? "SALE",
      ctaLabel: banner.ctaLabel ?? "SHOP NOW",
      discountPrefix: banner.discountPrefix ?? "UP TO",
      discountSuffix: banner.discountSuffix ?? "OFF",
      backgroundColor: banner.theme?.backgroundColor ?? "#1b2db8",
      accentYellow: banner.theme?.accentYellow ?? "#ffd400",
      accentPink: banner.theme?.accentPink ?? "#ff2d9a",
      previewImageId: banner.previewImageId ?? null,
      previewImageUrl: banner.previewImageUrl ?? null,
      isDefault: banner.isDefault ?? false,
      isActive: banner.isActive ?? true,
    });
  }, [isEditing, banner]);

  const createMutation = trpc.admin.happyBanners.create.useMutation({
    onSuccess: () => {
      toast.success("Banner design created");
      router.push("/staff/hero-banners");
    },
    onError: (err) => toast.error(err.message || "Failed to create banner"),
  });

  const updateMutation = trpc.admin.happyBanners.update.useMutation({
    onSuccess: () => {
      toast.success("Banner design updated");
      router.push("/staff/hero-banners");
    },
    onError: (err) => toast.error(err.message || "Failed to update banner"),
  });

  const presetConfig = HAPPY_BANNER_PRESET_DEFAULTS[form.preset];

  const preview = useMemo(
    () =>
      buildResolvedHappyBanner(
        {
          id: bannerId ?? "preview",
          name: form.name || "Preview",
          preset: form.preset,
          vendorWords: {
            word1: {
              label: form.word1Label,
              hint: form.word1Hint,
              defaultValue: form.word1Default,
            },
            word2: {
              label: form.word2Label,
              hint: form.word2Hint,
              defaultValue: form.word2Default,
            },
          },
          eyebrowText: form.eyebrowText,
          secondaryWord: form.secondaryWord,
          ctaLabel: form.ctaLabel,
          discountPrefix: form.discountPrefix,
          discountSuffix: form.discountSuffix,
          theme: {
            backgroundColor: form.backgroundColor,
            accentYellow: form.accentYellow,
            accentPink: form.accentPink,
          },
        },
        {
          word1: form.word1Default || "WORD 1",
          word2: form.word2Default || (form.preset === "hue-editorial" ? "TALBOTS.COM" : "00"),
        },
      ),
    [form, bannerId],
  );

  const handlePresetChange = (preset: HappyBannerPreset) => {
    if (isEditing) {
      setForm((prev) => ({ ...prev, preset }));
      return;
    }
    setForm((prev) => ({
      ...formFromPresetDefaults(preset),
      name: prev.name,
      slug: prev.slug,
      previewImageId: prev.previewImageId,
      previewImageUrl: prev.previewImageUrl,
      isDefault: prev.isDefault,
      isActive: prev.isActive,
    }));
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreviewUpload = async (file: File) => {
    setUploadingPreview(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          typeof errorData.error === "string" ? errorData.error : "Failed to upload thumbnail",
        );
      }
      const data = await response.json();
      if (!data.doc?.id || !data.doc?.url) {
        throw new Error("Upload succeeded but no image was returned");
      }
      updateField("previewImageId", data.doc.id);
      updateField("previewImageUrl", data.doc.url);
      toast.success("Thumbnail uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload thumbnail");
    } finally {
      setUploadingPreview(false);
    }
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      preset: form.preset,
      vendorWords: {
        word1: {
          label: form.word1Label.trim(),
          hint: form.word1Hint.trim(),
          defaultValue: form.word1Default.trim(),
        },
        word2: {
          label: form.word2Label.trim(),
          hint: form.word2Hint.trim(),
          defaultValue: form.word2Default.trim(),
        },
      },
      eyebrowText: form.eyebrowText.trim(),
      secondaryWord: form.secondaryWord.trim(),
      ctaLabel: form.ctaLabel.trim(),
      discountPrefix: form.discountPrefix.trim(),
      discountSuffix: form.discountSuffix.trim(),
      theme: {
        backgroundColor: form.backgroundColor.trim(),
        accentYellow: form.accentYellow.trim(),
        accentPink: form.accentPink.trim(),
      },
      previewImage: form.previewImageId,
      isDefault: form.isDefault,
      isActive: form.isActive,
    };

    if (isEditing && bannerId) {
      updateMutation.mutate({ id: bannerId, ...payload });
      return;
    }
    createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/staff/hero-banners">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to banners
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Banner details</CardTitle>
              <CardDescription>
                Name and thumbnail for the vendor picker. This is the design catalog entry, not a
                vendor&apos;s live text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preset">Design template</Label>
                <select
                  id="preset"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.preset}
                  onChange={(e) => handlePresetChange(e.target.value as HappyBannerPreset)}
                >
                  {HAPPY_BANNER_PRESET_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">{presetConfig.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Mega Sale Blue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) =>
                      updateField(
                        "slug",
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      )
                    }
                    placeholder="mega-sale-blue"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={2}
                  placeholder="Shown to vendors when choosing a banner"
                />
              </div>
              <div className="space-y-2">
                <Label>Picker thumbnail</Label>
                <p className="text-xs text-muted-foreground">Optional image in the vendor banner grid.</p>
                {form.previewImageUrl ? (
                  <div className="relative h-24 overflow-hidden rounded-lg border">
                    <img
                      src={form.previewImageUrl}
                      alt="Banner thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handlePreviewUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingPreview}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingPreview ? "Uploading..." : form.previewImageUrl ? "Replace" : "Upload"}
                  </Button>
                  {form.previewImageUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateField("previewImageId", null);
                        updateField("previewImageUrl", null);
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visual design</CardTitle>
              <CardDescription>Colors and layout preset. Vendors cannot change these.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Background</Label>
                <Input
                  value={form.backgroundColor}
                  onChange={(e) => updateField("backgroundColor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{form.preset === "summer-sale" ? "Leaf / border accent" : "Yellow accent"}</Label>
                <Input
                  value={form.accentYellow}
                  onChange={(e) => updateField("accentYellow", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{form.preset === "summer-sale" ? "Water accent" : "Pink accent"}</Label>
                <Input
                  value={form.accentPink}
                  onChange={(e) => updateField("accentPink", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fixed copy</CardTitle>
              <CardDescription>Locked text on the banner. Only Word 1 and Word 2 are vendor-editable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {presetConfig.showEyebrow ? (
                <div className="space-y-2">
                  <Label>Eyebrow</Label>
                  <Input
                    value={form.eyebrowText}
                    onChange={(e) => updateField("eyebrowText", e.target.value)}
                  />
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Secondary headline</Label>
                  <Input
                    value={form.secondaryWord}
                    onChange={(e) => updateField("secondaryWord", e.target.value)}
                  />
                </div>
                {presetConfig.showCta ? (
                  <div className="space-y-2">
                    <Label>CTA button</Label>
                    <Input
                      value={form.ctaLabel}
                      onChange={(e) => updateField("ctaLabel", e.target.value)}
                    />
                  </div>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {form.preset !== "hue-editorial" ? (
                  <>
                    <div className="space-y-2">
                      <Label>{form.preset === "summer-sale" ? "Offer prefix" : "Badge prefix"}</Label>
                      <Input
                        value={form.discountPrefix}
                        onChange={(e) => updateField("discountPrefix", e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{form.preset === "summer-sale" ? "Offer suffix" : "Badge suffix"}</Label>
                      <Input
                        value={form.discountSuffix}
                        onChange={(e) => updateField("discountSuffix", e.target.value.toUpperCase())}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-primary/40 bg-primary/5">
            <CardHeader>
              <CardTitle>Vendor word slots</CardTitle>
              <CardDescription>
                Same two-slot pattern for every banner design. Each vendor enters their own values
                after selecting this design — labels and starting values can differ per design.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Slot 1 label</Label>
                  <Input
                    value={form.word1Label}
                    onChange={(e) => updateField("word1Label", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slot 1 starting value</Label>
                  <Input
                    value={form.word1Default}
                    onChange={(e) =>
                      updateField(
                        "word1Default",
                        form.preset === "hue-editorial" ? e.target.value : e.target.value.toUpperCase(),
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Slot 1 hint (shown to vendors)</Label>
                <Input
                  value={form.word1Hint}
                  onChange={(e) => updateField("word1Hint", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Slot 2 label</Label>
                  <Input
                    value={form.word2Label}
                    onChange={(e) => updateField("word2Label", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slot 2 starting value</Label>
                  <Input
                    value={form.word2Default}
                    onChange={(e) =>
                      updateField(
                        "word2Default",
                        form.preset === "hue-editorial"
                          ? e.target.value.toUpperCase()
                          : e.target.value.replace(/\D/g, ""),
                      )
                    }
                    inputMode={form.preset === "hue-editorial" ? "text" : "numeric"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Slot 2 hint (shown to vendors)</Label>
                <Input
                  value={form.word2Hint}
                  onChange={(e) => updateField("word2Hint", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="isDefault">Default for new vendors</Label>
                <Switch
                  id="isDefault"
                  checked={form.isDefault}
                  onCheckedChange={(checked) => updateField("isDefault", checked)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="isActive">Available in vendor picker</Label>
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => updateField("isActive", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save design" : "Create banner design"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/staff/hero-banners">Cancel</Link>
            </Button>
          </div>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Design preview</CardTitle>
              <CardDescription>
                Sample with placeholder words. Shown on storefront only after a vendor selects this
                design and saves Word 1 and Word 2.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <HappyBannerDisplay banner={preview} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
