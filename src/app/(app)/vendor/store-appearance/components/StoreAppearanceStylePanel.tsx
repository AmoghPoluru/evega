"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getContrastTextColor,
  getSecondaryTextColor,
} from "@/lib/templates/auto-contrast-text";
import {
  buildBackgroundStyleForType,
  type VendorBackgroundStyleType,
} from "@/lib/templates/build-background-style-for-type";
import {
  buildFullStyleCustomization,
  buildStyleCustomizationPatch,
} from "@/lib/templates/build-style-customization-patch";
import {
  STYLE_PRESETS,
  type StylePresetId,
} from "@/lib/templates/style-presets";
import {
  templateCustomizationSchema,
  type TemplateCustomization,
} from "@/types/template-customization";
import { ColorPicker } from "@/app/(app)/vendor/templates/customize/components/ColorPicker";
import { FontSelector } from "@/app/(app)/vendor/templates/customize/components/FontSelector";
import { BackgroundStylePreview } from "./BackgroundStylePreview";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STYLE_COLOR_FIELDS = [
  { name: "colors.primary", label: "Primary", description: "Main brand / page accent" },
  { name: "colors.secondary", label: "Secondary", description: "Supporting brand color" },
  { name: "colors.accent", label: "Accent", description: "Highlights and CTAs" },
  { name: "colors.background", label: "Page background", description: "Solid fill when using Solid background style" },
];

const AUTO_SAVE_DELAY_MS = 500;

type SaveIntent = "silent" | "preset" | "manual";

type StoreAppearanceStylePanelProps = {
  onSaved?: () => void;
};

function withBackgroundStyleType(
  values: TemplateCustomization,
  type: VendorBackgroundStyleType,
): TemplateCustomization {
  const colors = { ...values.colors };

  if (type === "solid") {
    if (
      (!colors.background || colors.background === "transparent") &&
      colors.primary
    ) {
      colors.background = colors.primary;
    }
  } else {
    colors.background = "transparent";
  }

  return {
    ...values,
    colors,
    backgroundStyle: buildBackgroundStyleForType(type, {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      cardBackground: colors.cardBackground,
    }),
  };
}

function withAutoContrast(values: TemplateCustomization): TemplateCustomization {
  const primary = values.colors?.primary;
  if (!primary?.startsWith("#")) return values;

  const text = getContrastTextColor(primary);
  const textSecondary = getSecondaryTextColor(text);

  return {
    ...values,
    colors: {
      ...values.colors,
      text,
      textSecondary,
    },
  };
}

export function StoreAppearanceStylePanel({ onSaved }: StoreAppearanceStylePanelProps) {
  const utils = trpc.useUtils();
  const [applyingPresetId, setApplyingPresetId] = useState<StylePresetId | null>(null);
  const saveIntentRef = useRef<SaveIntent>("silent");
  const skipAutoSaveRef = useRef(false);
  const { data, isLoading } = trpc.vendor.templates.getCustomization.useQuery();

  const form = useForm<TemplateCustomization>({
    resolver: zodResolver(templateCustomizationSchema),
    defaultValues: {},
  });

  const watchedValues = useWatch({ control: form.control });
  const isDirty = form.formState.isDirty;

  const customizeMutation = trpc.vendor.templates.customize.useMutation({
    onSuccess: () => {
      const intent = saveIntentRef.current;
      if (intent === "preset" && applyingPresetId) {
        const presetLabel = STYLE_PRESETS.find((p) => p.id === applyingPresetId)?.label;
        toast.success(presetLabel ? `${presetLabel} preset applied` : "Preset applied");
      } else if (intent === "manual") {
        toast.success("Style saved");
      }
      setApplyingPresetId(null);
      saveIntentRef.current = "silent";
      skipAutoSaveRef.current = true;
      void utils.vendor.templates.getCustomization.invalidate();
      onSaved?.();
    },
    onError: (error) => {
      setApplyingPresetId(null);
      saveIntentRef.current = "silent";
      toast.error(error.message || "Failed to save style");
    },
  });

  const saveCustomization = useCallback(
    (
      values: TemplateCustomization,
      intent: SaveIntent = "silent",
      options?: { presetId?: StylePresetId; includeAll?: boolean },
    ) => {
      saveIntentRef.current = intent;
      if (options?.presetId) setApplyingPresetId(options.presetId);

      const patch = options?.includeAll
        ? buildFullStyleCustomization(values)
        : buildStyleCustomizationPatch(values, { dirtyFields: form.formState.dirtyFields });

      if (Object.keys(patch).length === 0) return;

      customizeMutation.mutate({
        customization: withAutoContrast(patch),
      });
    },
    [customizeMutation, form.formState.dirtyFields],
  );

  useEffect(() => {
    if (data?.customization) {
      skipAutoSaveRef.current = true;
      const customization = { ...data.customization };
      const type = customization.backgroundStyle?.type;
      if (type === "solid" || type === "gradient" || type === "mesh-gradient") {
        customization.backgroundStyle = buildBackgroundStyleForType(type, {
          primary: customization.colors?.primary ?? data.template?.templateConfig?.colors?.primary,
          secondary:
            customization.colors?.secondary ?? data.template?.templateConfig?.colors?.secondary,
          accent: customization.colors?.accent ?? data.template?.templateConfig?.colors?.accent,
          background: customization.colors?.background,
          cardBackground:
            customization.colors?.cardBackground ??
            data.template?.templateConfig?.colors?.cardBackground,
        });
      }
      form.reset(customization);
    }
  }, [data, form]);

  useEffect(() => {
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return;
    }
    if (!isDirty || customizeMutation.isPending || applyingPresetId) return;

    const timer = window.setTimeout(() => {
      saveCustomization(form.getValues(), "silent");
    }, AUTO_SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [watchedValues, isDirty, customizeMutation.isPending, applyingPresetId, form, saveCustomization]);

  const watchedPrimary = form.watch("colors.primary");

  const activePresetId = useMemo((): StylePresetId | null => {
    if (!watchedPrimary) return null;
    const match = STYLE_PRESETS.find(
      (preset) => preset.customization.colors?.primary === watchedPrimary,
    );
    return match?.id ?? null;
  }, [watchedPrimary]);

  const handleApplyPreset = (presetId: StylePresetId) => {
    const preset = STYLE_PRESETS.find((item) => item.id === presetId);
    if (!preset || customizeMutation.isPending) return;
    const next = withAutoContrast(preset.customization);
    skipAutoSaveRef.current = true;
    form.reset(next, { keepDefaultValues: false });
    saveCustomization(next, "preset", { presetId, includeAll: true });
  };

  const handleSave = form.handleSubmit((values) => {
    saveCustomization(values, "manual", { includeAll: true });
  });

  const handleDiscard = () => {
    skipAutoSaveRef.current = true;
    form.reset(data?.customization ?? {});
    toast.message("Changes discarded");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Step 3 · Style
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a preset to apply instantly. Color, font, and background changes save automatically.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Quick presets</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {STYLE_PRESETS.map((preset) => {
            const isApplying = applyingPresetId === preset.id && customizeMutation.isPending;
            return (
            <button
              key={preset.id}
              type="button"
              disabled={customizeMutation.isPending}
              onClick={() => handleApplyPreset(preset.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-shadow hover:shadow-sm disabled:opacity-60",
                activePresetId === preset.id && "ring-2 ring-primary",
              )}
            >
              <div className="flex h-6 w-full overflow-hidden rounded">
                {preset.swatches.map((color) => (
                  <span key={color} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span className="text-xs font-medium">
                {isApplying ? (
                  <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                ) : (
                  preset.label
                )}
              </span>
            </button>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Colors</Label>
            <ColorPicker form={form} fields={STYLE_COLOR_FIELDS} />
            <p className="text-xs text-muted-foreground">
              Text colors auto-adjust for readability when changes are saved.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Background style</Label>
            <FormField
              control={form.control}
              name="backgroundStyle.type"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value) => {
                      const type = value as VendorBackgroundStyleType;
                      field.onChange(type);
                      skipAutoSaveRef.current = true;
                      const current = form.getValues();
                      const withBackground = withBackgroundStyleType(current, type);
                      form.setValue("backgroundStyle", withBackground.backgroundStyle, {
                        shouldDirty: true,
                      });
                      form.setValue("colors.background", withBackground.colors?.background, {
                        shouldDirty: true,
                      });
                      customizeMutation.mutate({
                        customization: withAutoContrast({
                          backgroundStyle: withBackground.backgroundStyle,
                          colors: {
                            background: withBackground.colors?.background,
                          },
                        }),
                      });
                    }}
                    value={field.value ?? "mesh-gradient"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Background type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="mesh-gradient">Mesh gradient</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Controls the page backdrop behind your products</FormDescription>
                </FormItem>
              )}
            />
            <BackgroundStylePreview
              values={(watchedValues ?? {}) as TemplateCustomization}
              baseColors={data?.template?.templateConfig?.colors}
            />
          </div>

          <div className="space-y-3">
            <Label>Typography</Label>
            <FontSelector form={form} />
          </div>
        </div>
      </Form>

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDiscard}
          disabled={!form.formState.isDirty || customizeMutation.isPending}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button type="button" size="sm" onClick={() => void handleSave()} disabled={customizeMutation.isPending}>
          {customizeMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save style
        </Button>
      </div>
    </div>
  );
}
