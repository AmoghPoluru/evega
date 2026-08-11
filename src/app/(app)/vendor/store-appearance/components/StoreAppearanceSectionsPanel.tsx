"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  templateCustomizationSchema,
  type TemplateCustomization,
} from "@/types/template-customization";

const HERO_HEIGHT_MIN = 300;
const HERO_HEIGHT_MAX = 640;
const HERO_HEIGHT_DEFAULT = 480;

type StoreAppearanceSectionsPanelProps = {
  onSaved?: () => void;
};

function parseHeroHeight(value: string | undefined): number {
  if (!value) return HERO_HEIGHT_DEFAULT;
  const match = /^(\d+)px$/.exec(value);
  return match ? Number(match[1]) : HERO_HEIGHT_DEFAULT;
}

export function StoreAppearanceSectionsPanel({ onSaved }: StoreAppearanceSectionsPanelProps) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.vendor.templates.getCustomization.useQuery();

  const form = useForm<TemplateCustomization>({
    resolver: zodResolver(templateCustomizationSchema),
    defaultValues: {},
  });

  const customizeMutation = trpc.vendor.templates.customize.useMutation({
    onSuccess: () => {
      toast.success("Section settings saved");
      void utils.vendor.templates.getCustomization.invalidate();
      onSaved?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save section settings");
    },
  });

  useEffect(() => {
    if (data?.customization) {
      form.reset(data.customization);
    } else if (data?.template) {
      const base = data.template.templateConfig;
      form.reset({
        layout: { showBanner: base.layout?.showBanner ?? true },
        components: {
          heroBanner: { height: base.components?.heroBanner?.height ?? `${HERO_HEIGHT_DEFAULT}px` },
          productCard: { borderRadius: base.components?.productCard?.borderRadius ?? "8px" },
        },
      });
    }
  }, [data, form]);

  const heroHeight = parseHeroHeight(form.watch("components.heroBanner.height"));

  const handleSave = form.handleSubmit((values) => {
    customizeMutation.mutate({
      customization: {
        layout: values.layout?.showBanner !== undefined
          ? { showBanner: values.layout.showBanner }
          : undefined,
        components: {
          heroBanner: values.components?.heroBanner?.height
            ? { height: values.components.heroBanner.height }
            : undefined,
          productCard: values.components?.productCard?.borderRadius
            ? { borderRadius: values.components.productCard.borderRadius }
            : undefined,
        },
      },
    });
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Step 5 · Sections
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Control visible regions and sizing. These settings are independent of layout and style.
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="layout.showBanner"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Hero banner region</FormLabel>
                  <FormDescription>Show the top hero banner area on your storefront</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Label>Hero banner height</Label>
              <span className="text-sm text-muted-foreground">{heroHeight}px</span>
            </div>
            <Slider
              min={HERO_HEIGHT_MIN}
              max={HERO_HEIGHT_MAX}
              step={20}
              value={[heroHeight]}
              onValueChange={([value]) => {
                form.setValue("components.heroBanner.height", `${value}px`, { shouldDirty: true });
              }}
            />
          </div>

          <FormField
            control={form.control}
            name="components.productCard.borderRadius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product card corner radius</FormLabel>
                <FormDescription>e.g. 8px, 12px, 20px</FormDescription>
                <FormControl>
                  <input
                    type="text"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    value={field.value ?? "8px"}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Category strip, filters, and review toggles will appear here once the storefront honors
            those settings (Phase 2).
          </p>
        </div>
      </Form>

      <Button
        type="button"
        size="sm"
        onClick={() => void handleSave()}
        disabled={customizeMutation.isPending}
      >
        {customizeMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save sections
      </Button>
    </div>
  );
}
