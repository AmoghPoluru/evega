"use client";

import { useMemo } from "react";

import { buildVendorPageBackgroundStyles } from "@/lib/templates/template-background-styles";
import { generateCSSVariables } from "@/lib/templates/css-variables";
import { resolveMergedBackgroundStyle } from "@/lib/templates/resolve-merged-background-style";
import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";

const SWATCH_CLASS = "store-appearance-bg-swatch";

type BackgroundStylePreviewProps = {
  values: TemplateCustomization;
  baseColors?: TemplateConfig["colors"];
};

/** Live swatch using the same CSS pipeline as the storefront. */
export function BackgroundStylePreview({ values, baseColors }: BackgroundStylePreviewProps) {
  const css = useMemo(() => {
    const mergedColors = {
      ...baseColors,
      ...values.colors,
    };

    const backgroundStyle = resolveMergedBackgroundStyle(
      undefined,
      values.backgroundStyle,
      mergedColors,
    );

    const templateConfig = {
      colors: mergedColors,
      backgroundStyle,
    } as TemplateConfig;

    const cssVariables = generateCSSVariables(templateConfig);
    return buildVendorPageBackgroundStyles(SWATCH_CLASS, templateConfig, cssVariables);
  }, [values, baseColors]);

  const label =
    values.backgroundStyle?.type === "solid"
      ? "Solid fill"
      : values.backgroundStyle?.type === "gradient"
        ? "Linear gradient"
        : values.backgroundStyle?.type === "mesh-gradient"
          ? "Mesh gradient"
          : "Page backdrop";

  return (
    <div className="space-y-2">
      {css ? <style>{css}</style> : null}
      <div
        className={`${SWATCH_CLASS} h-20 w-full overflow-hidden rounded-lg border shadow-inner`}
        aria-hidden
      />
      <p className="text-xs text-muted-foreground">{label} preview (matches storefront CSS)</p>
    </div>
  );
}
