"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdvancedColorPicker } from "@/components/ui/advanced-color-picker";
import { normalizeHex } from "@/components/ui/hex-color-palette";
import { cn } from "@/lib/utils";
import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";
import type { StorefrontSection } from "@/types/template-sections";
import { toPickerHex } from "@/lib/color-utils";
import { backgroundTreatmentPreviewStyle } from "@/lib/templates/background-style-treatments";

import {
  BACKGROUND_STYLE_OPTIONS,
  HERO_BANNER_OPTIONS,
  LAYOUT_TYPE_OPTIONS,
  type BackgroundStyleOption,
  type BuilderPanelId,
  type HeroBannerVariant,
  type ProductLayoutVariant,
} from "./builder-panels";
import { BackgroundStyleSwatch } from "./BackgroundStyleSwatch";
import { GridLayoutPreview } from "./GridLayoutPreview";
import { TypographyPicker } from "./TypographyPicker";
import { ChromeSettingsPanel } from "./ChromeSettingsPanel";
import { findSection, updateSectionSettings } from "./builder-section-utils";

interface BuilderSettingsPanelProps {
  activePanel: BuilderPanelId;
  form: UseFormReturn<TemplateCustomization>;
  baseColors: TemplateConfig["colors"];
  baseFonts?: TemplateConfig["fonts"];
  baseTypography?: TemplateConfig["typography"];
  baseChrome?: TemplateConfig["chrome"];
  backgroundStyleType: BackgroundStyleOption;
  onBackgroundStyleTypeChange: (type: BackgroundStyleOption) => void;
  gridLayout: ProductLayoutVariant;
  onGridLayoutChange: (layout: ProductLayoutVariant) => void;
  heroVariant: HeroBannerVariant;
  onHeroVariantChange: (variant: HeroBannerVariant) => void;
  sections: StorefrontSection[];
  onSectionsChange: (sections: StorefrontSection[]) => void;
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function OptionCard({
  selected,
  label,
  description,
  onClick,
}: {
  selected: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-muted-foreground/40 hover:bg-muted/50",
      )}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

export function BuilderSettingsPanel({
  activePanel,
  form,
  baseColors,
  baseFonts,
  baseTypography,
  baseChrome,
  backgroundStyleType,
  onBackgroundStyleTypeChange,
  gridLayout,
  onGridLayoutChange,
  heroVariant,
  onHeroVariantChange,
  sections,
  onSectionsChange,
}: BuilderSettingsPanelProps) {
  const backgroundOverride = form.watch("colors.background");
  const seedColor = useMemo(
    () => toPickerHex(backgroundOverride ?? baseColors.primary, baseColors.primary),
    [backgroundOverride, baseColors.primary],
  );
  const activeTreatment = useMemo(
    () => backgroundTreatmentPreviewStyle(seedColor, backgroundStyleType),
    [seedColor, backgroundStyleType],
  );

  const vendorSection = findSection(sections, "vendor-info");
  const vendorSettings = vendorSection?.settings ?? {};

  const updateVendorSetting = (key: string, value: unknown) => {
    onSectionsChange(updateSectionSettings(sections, "vendor-info", { [key]: value }));
  };

  const panelTitle =
    activePanel === "background"
      ? "Background color"
      : activePanel === "layout"
        ? "Layout type"
        : activePanel === "typography"
          ? "Typography"
          : activePanel === "chrome"
            ? "Storefront chrome"
            : activePanel === "hero"
            ? "Hero banner type"
            : "Vendor details";

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">{panelTitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activePanel === "background" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div
                className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border shadow-inner"
                style={{ backgroundColor: seedColor }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Brand hue</p>
                <p className="text-xs text-muted-foreground">
                  Every style below is derived from this color
                </p>
              </div>
              <div
                className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border shadow-inner"
                style={activeTreatment}
                aria-hidden
                title="Active style preview"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Background style</Label>
              <div className="grid grid-cols-1 gap-2">
                {BACKGROUND_STYLE_OPTIONS.map((option) => (
                  <BackgroundStyleSwatch
                    key={option.value}
                    seedColor={seedColor}
                    type={option.value}
                    label={option.label}
                    description={option.description}
                    selected={backgroundStyleType === option.value}
                    onSelect={() => onBackgroundStyleTypeChange(option.value)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color picker</Label>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <AdvancedColorPicker
                  value={seedColor}
                  onChange={(color) =>
                    form.setValue("colors.background", normalizeHex(color), {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activePanel === "layout" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Choose how products are arranged on your storefront grid.
            </p>
            {LAYOUT_TYPE_OPTIONS.map((option) => (
              <GridLayoutPreview
                key={option.value}
                layout={option.value}
                selected={gridLayout === option.value}
                label={option.label}
                description={option.description}
                tradeOff={option.tradeOff}
                columns={option.columns}
                onSelect={() => onGridLayoutChange(option.value)}
              />
            ))}
          </div>
        )}

        {activePanel === "typography" && (
          <TypographyPicker
            form={form}
            baseFonts={baseFonts}
            baseTypography={baseTypography}
            baseColors={baseColors}
          />
        )}

        {activePanel === "chrome" && (
          <ChromeSettingsPanel form={form} baseChrome={baseChrome} />
        )}

        {activePanel === "hero" && (
          <div className="space-y-2">
            {HERO_BANNER_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                selected={heroVariant === option.value}
                label={option.label}
                description={option.description}
                onClick={() => onHeroVariantChange(option.value)}
              />
            ))}
          </div>
        )}

        {activePanel === "vendor" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Control how your store name and contact info appear at the top of the page.
            </p>
            <ToggleRow
              label="Show breadcrumb"
              checked={vendorSettings.showBreadcrumb !== false}
              onCheckedChange={(checked) => updateVendorSetting("showBreadcrumb", checked)}
            />
            <ToggleRow
              label="Show contact details"
              checked={vendorSettings.showContact !== false}
              onCheckedChange={(checked) => updateVendorSetting("showContact", checked)}
            />
            <ToggleRow
              label="Stick to top on scroll"
              checked={vendorSettings.sticky !== false}
              onCheckedChange={(checked) => updateVendorSetting("sticky", checked)}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
