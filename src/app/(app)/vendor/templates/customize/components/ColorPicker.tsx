"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { BrandColorPicker } from "@/components/ui/brand-color-picker";
import {
  getContrastTextColor,
  getSecondaryTextColor,
} from "@/lib/templates/auto-contrast-text";
import { resolvePageBackgroundContrastHex } from "@/lib/templates/resolve-contrast-surface";
import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";

export type ColorFieldConfig = {
  name: string;
  label: string;
  description: string;
  /** Show WCAG contrast warning against auto body text when relevant. */
  warnContrast?: boolean;
};

interface ColorPickerProps {
  form: UseFormReturn<TemplateCustomization>;
  fields?: ColorFieldConfig[];
  /** Base template colors — powers per-field Reset. */
  fallbackColors?: Partial<TemplateConfig["colors"]>;
}

const DEFAULT_COLOR_FIELDS: ColorFieldConfig[] = [
  { name: "colors.primary", label: "Primary Color", description: "Main brand color", warnContrast: true },
  { name: "colors.secondary", label: "Secondary Color", description: "Secondary brand color" },
  { name: "colors.accent", label: "Accent Color", description: "Highlight color for CTAs" },
  {
    name: "colors.background",
    label: "Background Color",
    description: "Page background (solid style only)",
    warnContrast: true,
  },
  { name: "colors.border", label: "Border Color", description: "Border and divider color" },
  { name: "colors.cardBackground", label: "Card Background", description: "Card background color" },
];

function getFallbackForField(
  fallbackColors: Partial<TemplateConfig["colors"]> | undefined,
  fieldName: string,
): string | undefined {
  const key = fieldName.split(".").pop() as keyof TemplateConfig["colors"];
  return fallbackColors?.[key];
}

type AutoTextColorsPreviewProps = {
  form: UseFormReturn<TemplateCustomization>;
  fallbackColors?: Partial<TemplateConfig["colors"]>;
};

/** Read-only preview of auto-computed text colors (not free-picked). */
export function AutoTextColorsPreview({ form, fallbackColors }: AutoTextColorsPreviewProps) {
  const values = form.watch();
  const mergedForContrast: TemplateCustomization = {
    colors: { ...fallbackColors, ...values.colors },
    backgroundStyle: values.backgroundStyle,
  };

  const surface = resolvePageBackgroundContrastHex(mergedForContrast, fallbackColors);
  const autoText = surface ? getContrastTextColor(surface) : values.colors?.text ?? "#1A1A1A";
  const autoSecondary = getSecondaryTextColor(autoText);
  const displayText = values.colors?.text ?? autoText;
  const displaySecondary = values.colors?.textSecondary ?? autoSecondary;

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Text colors (auto)</p>
      <div className="flex flex-wrap gap-3">
        <TextSwatch label="Body" color={displayText} />
        <TextSwatch label="Muted" color={displaySecondary} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Computed for readability against your page backdrop when saved.
      </p>
    </div>
  );
}

function TextSwatch({ label, color }: { label: string; color: string }) {
  const isHex = color.startsWith("#");
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span
        className="h-5 w-5 rounded border shadow-inner"
        style={{ backgroundColor: isHex ? color : undefined }}
      />
      <span>
        {label}{" "}
        <span className="font-mono text-muted-foreground">{isHex ? color : "auto"}</span>
      </span>
    </span>
  );
}

export function ColorPicker({
  form,
  fields = DEFAULT_COLOR_FIELDS,
  fallbackColors,
}: ColorPickerProps) {
  const watchedText = form.watch("colors.text");
  const backgroundType = form.watch("backgroundStyle.type");

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name as keyof TemplateCustomization & string}
          render={({ field: formField }) => {
            let contrastTextColor: string | undefined;
            if (field.warnContrast && watchedText?.startsWith("#")) {
              if (field.name === "colors.background" || (field.name === "colors.primary" && backgroundType === "solid")) {
                contrastTextColor = watchedText;
              }
            }

            return (
              <BrandColorPicker
                label={field.label}
                description={field.description}
                value={typeof formField.value === "string" ? formField.value : undefined}
                onChange={formField.onChange}
                fallbackColor={getFallbackForField(fallbackColors, field.name)}
                contrastTextColor={contrastTextColor}
              />
            );
          }}
        />
      ))}
    </div>
  );
}
