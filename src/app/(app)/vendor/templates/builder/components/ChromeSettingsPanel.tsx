"use client";

import type { UseFormReturn } from "react-hook-form";

import { AdvancedColorPicker } from "@/components/ui/advanced-color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { normalizeHex } from "@/components/ui/hex-color-palette";
import { toPickerHex } from "@/lib/color-utils";
import {
  TRIUMPH_CHROME_DEFAULTS,
  type StorefrontChrome,
} from "@/lib/templates/storefront-chrome";
import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";

interface ChromeSettingsPanelProps {
  form: UseFormReturn<TemplateCustomization>;
  baseChrome?: TemplateConfig["chrome"];
}

const COLOR_ROLES: Array<{ key: keyof NonNullable<StorefrontChrome["colors"]>; label: string }> = [
  { key: "utilityBarBg", label: "Utility bar background" },
  { key: "utilityBarText", label: "Utility bar text" },
  { key: "navBarBg", label: "Nav bar background" },
  { key: "subNavBg", label: "Sub-nav background" },
  { key: "heroPanelLeft", label: "Hero peek panel (left)" },
  { key: "heroPanelMain", label: "Hero main panel" },
  { key: "heroAccent", label: "Hero accent" },
  { key: "heroText", label: "Hero text" },
  { key: "primaryButtonFill", label: "Primary button fill" },
  { key: "primaryButtonText", label: "Primary button text" },
  { key: "secondaryButtonBorder", label: "Secondary button border" },
  { key: "sectionLabelText", label: "Section label text" },
  { key: "bodyTextMuted", label: "Body text muted" },
];

const LAYOUT_FIELDS: Array<{ key: keyof NonNullable<StorefrontChrome["layout"]>; label: string }> = [
  { key: "utilityBarHeight", label: "Utility bar height" },
  { key: "navHeight", label: "Nav height" },
  { key: "subNavHeight", label: "Sub-nav height" },
  { key: "heroHeight", label: "Hero height" },
  { key: "heroContentPadding", label: "Hero content padding" },
  { key: "heroHeadlineSize", label: "Hero headline size" },
  { key: "buttonBorderRadius", label: "Button border radius" },
  { key: "buttonPadding", label: "Button padding" },
  { key: "sectionLabelSize", label: "Section label size" },
  { key: "sectionHeadlineSize", label: "Section headline size" },
  { key: "carouselPeekWidth", label: "Carousel peek width" },
  { key: "countdownBoxSize", label: "Countdown box size" },
  { key: "countdownGap", label: "Countdown gap" },
];

const TYPOGRAPHY_ROLES = [
  { key: "wordmark", label: "Wordmark" },
  { key: "heroHeadline", label: "Hero headline" },
  { key: "sectionHeadline", label: "Section headline" },
  { key: "navLinks", label: "Nav links" },
  { key: "body", label: "Body / subtext" },
  { key: "smallLabels", label: "Small labels" },
] as const;

const CHROME_FONTS = [
  { value: '"Archivo Black", sans-serif', label: "Archivo Black" },
  { value: "Anton, sans-serif", label: "Anton" },
  { value: "Archivo, sans-serif", label: "Archivo" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Hind, sans-serif", label: "Hind" },
  { value: "Rubik, sans-serif", label: "Rubik" },
  { value: '"Baloo 2", sans-serif', label: "Baloo 2" },
];

function resolveColor(
  form: UseFormReturn<TemplateCustomization>,
  base: TemplateConfig["chrome"] | undefined,
  colorKey: keyof NonNullable<StorefrontChrome["colors"]>,
): string {
  const watched = form.watch(`chrome.colors.${colorKey}`);
  const baseColor = base?.colors?.[colorKey];
  const defaultColor = TRIUMPH_CHROME_DEFAULTS.colors?.[colorKey] ?? "#171717";
  return toPickerHex(watched ?? baseColor ?? defaultColor, defaultColor);
}

export function ChromeSettingsPanel({ form, baseChrome }: ChromeSettingsPanelProps) {
  const chromeEnabled = form.watch("chrome.enabled") ?? baseChrome?.enabled ?? true;

  const setColor = (key: keyof NonNullable<StorefrontChrome["colors"]>, value: string) => {
    form.setValue(`chrome.colors.${key}`, normalizeHex(value), { shouldDirty: true });
    form.setValue("chrome.enabled", true, { shouldDirty: true });
  };

  const setLayout = (key: keyof NonNullable<StorefrontChrome["layout"]>, value: string) => {
    form.setValue(`chrome.layout.${key}`, value, { shouldDirty: true });
    form.setValue("chrome.enabled", true, { shouldDirty: true });
  };

  const setContent = (key: keyof NonNullable<StorefrontChrome["content"]>, value: string) => {
    form.setValue(`chrome.content.${key}`, value, { shouldDirty: true });
    form.setValue("chrome.enabled", true, { shouldDirty: true });
  };

  const setTypo = (
    role: (typeof TYPOGRAPHY_ROLES)[number]["key"],
    field: "font" | "color" | "skew" | "letterSpacing",
    value: string,
  ) => {
    const path = `chrome.typography.${role}.${field}` as const;
    form.setValue(path, field === "color" ? normalizeHex(value) : value, { shouldDirty: true });
    form.setValue("chrome.enabled", true, { shouldDirty: true });
  };

  const applyTriumphPreset = () => {
    form.setValue("chrome", TRIUMPH_CHROME_DEFAULTS, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Triumph-style storefront chrome — utility bar, nav, hero carousel, and section headers.
        </p>
        <button
          type="button"
          onClick={applyTriumphPreset}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          Reset to Triumph
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label className="text-sm font-normal">Enable storefront chrome</Label>
        <Switch
          checked={chromeEnabled !== false}
          onCheckedChange={(checked) =>
            form.setValue("chrome.enabled", checked, { shouldDirty: true })
          }
        />
      </div>

      {chromeEnabled === false ? null : (
        <>
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Colors
            </h3>
            <div className="space-y-3">
              {COLOR_ROLES.map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs">{label}</Label>
                  <AdvancedColorPicker
                    value={resolveColor(form, baseChrome, key)}
                    onChange={(color) => setColor(key, color)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Layout
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {LAYOUT_FIELDS.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    value={
                      form.watch(`chrome.layout.${key}`) ??
                      baseChrome?.layout?.[key] ??
                      TRIUMPH_CHROME_DEFAULTS.layout?.[key] ??
                      ""
                    }
                    onChange={(e) => setLayout(key, e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Typography roles
            </h3>
            {TYPOGRAPHY_ROLES.map(({ key, label }) => {
              const rolePath = `chrome.typography.${key}` as const;
              const currentFont =
                form.watch(`${rolePath}.font`) ??
                baseChrome?.typography?.[key]?.font ??
                TRIUMPH_CHROME_DEFAULTS.typography?.[key]?.font ??
                "";
              const currentSkew =
                form.watch(`${rolePath}.skew`) ??
                baseChrome?.typography?.[key]?.skew ??
                TRIUMPH_CHROME_DEFAULTS.typography?.[key]?.skew ??
                "";
              const currentSpacing =
                form.watch(`${rolePath}.letterSpacing`) ??
                baseChrome?.typography?.[key]?.letterSpacing ??
                "";

              return (
                <div key={key} className="rounded-lg border border-border p-3 space-y-2">
                  <p className="text-sm font-medium">{label}</p>
                  <select
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                    value={currentFont}
                    onChange={(e) => setTypo(key, "font", e.target.value)}
                  >
                    {CHROME_FONTS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                  <AdvancedColorPicker
                    value={toPickerHex(
                      form.watch(`${rolePath}.color`) ??
                        baseChrome?.typography?.[key]?.color ??
                        "#171717",
                      "#171717",
                    )}
                    onChange={(color) => setTypo(key, "color", color)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Skew (e.g. -8deg)</Label>
                      <Input
                        value={currentSkew}
                        onChange={(e) => setTypo(key, "skew", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Letter spacing</Label>
                      <Input
                        value={currentSpacing}
                        onChange={(e) => setTypo(key, "letterSpacing", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Content
            </h3>
            {(
              [
                ["wordmark", "Wordmark"],
                ["utilityMessage", "Utility message"],
                ["heroHeadline", "Hero headline"],
                ["heroSubtext", "Hero subtext"],
                ["heroLabel", "Hero label"],
                ["primaryCta", "Primary CTA"],
                ["secondaryCta", "Secondary CTA"],
                ["sectionLabel", "Section label"],
                ["sectionHeadline", "Section headline"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  value={
                    form.watch(`chrome.content.${key}`) ??
                    baseChrome?.content?.[key] ??
                    TRIUMPH_CHROME_DEFAULTS.content?.[key] ??
                    ""
                  }
                  onChange={(e) => setContent(key, e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Features
            </h3>
            {(
              [
                ["showUtilityBar", "Utility bar"],
                ["showCountdown", "Countdown timer"],
                ["showSubNav", "Category sub-nav"],
                ["heroCarouselPeek", "Hero carousel peek"],
                ["dualCta", "Dual CTA buttons"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <Label className="text-sm font-normal">{label}</Label>
                <Switch
                  checked={
                    form.watch(`chrome.features.${key}`) ??
                    baseChrome?.features?.[key] ??
                    TRIUMPH_CHROME_DEFAULTS.features?.[key] ??
                    true
                  }
                  onCheckedChange={(checked) => {
                    form.setValue(`chrome.features.${key}`, checked, { shouldDirty: true });
                    form.setValue("chrome.enabled", true, { shouldDirty: true });
                  }}
                />
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
