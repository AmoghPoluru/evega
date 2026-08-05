"use client";

import { useEffect, useMemo, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";

import { AdvancedColorPicker } from "@/components/ui/advanced-color-picker";
import { Label } from "@/components/ui/label";
import { normalizeHex } from "@/components/ui/hex-color-palette";
import { cn } from "@/lib/utils";
import { toPickerHex } from "@/lib/color-utils";
import { buildGoogleFontsHref } from "@/lib/templates/template-fonts";
import {
  TYPOGRAPHY_CATALOG,
  TYPOGRAPHY_CATALOG_FONTS,
} from "@/lib/templates/typography-catalog";
import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";

const TYPOGRAPHY_PREVIEW_LINK_ID = "evega-typography-catalog-fonts";

type TypographyArea = "vendor" | "hero" | "product" | "price";

const TYPOGRAPHY_AREAS: Array<{ id: TypographyArea; label: string; description: string }> = [
  { id: "vendor", label: "Vendor", description: "Store name in the header bar" },
  { id: "hero", label: "Hero banner", description: "Main headline on the banner" },
  { id: "product", label: "Product", description: "Product titles on the grid" },
  { id: "price", label: "Price", description: "Price tags — font, text & background" },
];

interface TypographyPickerProps {
  form: UseFormReturn<TemplateCustomization>;
  baseFonts?: TemplateConfig["fonts"];
  baseTypography?: TemplateConfig["typography"];
  baseColors?: TemplateConfig["colors"];
}

function TypographyFontLoader() {
  useEffect(() => {
    const href = buildGoogleFontsHref(TYPOGRAPHY_CATALOG_FONTS.map((font) => font.value));
    if (!href) return;

    let link = document.getElementById(TYPOGRAPHY_PREVIEW_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = TYPOGRAPHY_PREVIEW_LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    if (link.href !== href) {
      link.href = href;
    }

    return () => {
      document.getElementById(TYPOGRAPHY_PREVIEW_LINK_ID)?.remove();
    };
  }, []);

  return null;
}

function defaultColorForArea(
  area: TypographyArea,
  baseColors?: TemplateConfig["colors"],
): string {
  if (area === "price") return baseColors?.primary ?? "#501313";
  return baseColors?.text ?? "#1A1A1A";
}

function mergeTypographyArea(
  current: TemplateCustomization["typography"] | undefined,
  area: TypographyArea,
  patch: Record<string, string>,
): NonNullable<TemplateCustomization["typography"]> {
  return {
    ...current,
    [area]: {
      ...(current?.[area] ?? {}),
      ...patch,
    },
  };
}

export function TypographyPicker({
  form,
  baseFonts,
  baseTypography,
  baseColors,
}: TypographyPickerProps) {
  const [activeArea, setActiveArea] = useState<TypographyArea>("vendor");
  const typography = useWatch({ control: form.control, name: "typography" });

  const activeMeta = TYPOGRAPHY_AREAS.find((area) => area.id === activeArea)!;

  const selectedFont =
    typography?.[activeArea]?.font ??
    baseTypography?.[activeArea]?.font ??
    (activeArea === "price" ? baseFonts?.body : baseFonts?.heading);

  const selectedColor = useMemo(
    () =>
      toPickerHex(
        typography?.[activeArea]?.color ??
          baseTypography?.[activeArea]?.color ??
          defaultColorForArea(activeArea, baseColors),
        defaultColorForArea(activeArea, baseColors),
      ),
    [activeArea, baseColors, baseTypography, typography],
  );

  const selectedPriceBackground = useMemo(
    () =>
      toPickerHex(
        typography?.price?.backgroundColor ??
          baseTypography?.price?.backgroundColor ??
          baseColors?.accent ??
          "#D4AF37",
        baseColors?.accent ?? "#D4AF37",
      ),
    [baseColors, baseTypography, typography?.price?.backgroundColor],
  );

  const setAreaFont = (fontValue: string) => {
    form.setValue(
      "typography",
      mergeTypographyArea(form.getValues("typography"), activeArea, { font: fontValue }),
      { shouldDirty: true },
    );
  };

  const setAreaColor = (color: string) => {
    form.setValue(
      "typography",
      mergeTypographyArea(form.getValues("typography"), activeArea, {
        color: normalizeHex(color),
      }),
      { shouldDirty: true },
    );
  };

  const setPriceBackground = (color: string) => {
    form.setValue(
      "typography",
      mergeTypographyArea(form.getValues("typography"), "price", {
        backgroundColor: normalizeHex(color),
      }),
      { shouldDirty: true },
    );
  };

  return (
    <div className="space-y-4">
      <TypographyFontLoader />
      <p className="text-xs text-muted-foreground">
        Set a different typeface and color for each storefront area. Each font row previews
        &ldquo;Zvastra&rdquo; in that family.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {TYPOGRAPHY_AREAS.map((area) => (
          <button
            key={area.id}
            type="button"
            onClick={() => setActiveArea(area.id)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              activeArea === area.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {area.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
        <div>
          <p className="text-sm font-medium">{activeMeta.label}</p>
          <p className="text-xs text-muted-foreground">{activeMeta.description}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Text color</Label>
          <AdvancedColorPicker value={selectedColor} onChange={setAreaColor} />
        </div>

        {activeArea === "price" && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Price background</Label>
            <AdvancedColorPicker value={selectedPriceBackground} onChange={setPriceBackground} />
            <div
              className="inline-flex rounded-md px-3 py-1.5 text-sm font-bold"
              style={{
                fontFamily: selectedFont,
                color: selectedColor,
                backgroundColor: selectedPriceBackground,
              }}
            >
              ₹1,299
            </div>
          </div>
        )}

        {activeArea !== "price" && (
          <p
            className="text-2xl leading-none"
            style={{ fontFamily: selectedFont, color: selectedColor }}
            aria-hidden
          >
            Zvastra
          </p>
        )}
      </div>

      <div className="space-y-4 max-h-[42vh] overflow-y-auto pr-1">
        {TYPOGRAPHY_CATALOG.map((category) => (
          <section key={category.id} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {category.label}
            </h3>
            <ul className="space-y-1">
              {category.fonts.map((font) => {
                const selected = selectedFont === font.value;
                const preview = font.previewText ?? "Zvastra";

                return (
                  <li key={font.value}>
                    <button
                      type="button"
                      onClick={() => setAreaFont(font.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-muted-foreground/40 hover:bg-muted/40",
                      )}
                    >
                      <span className="shrink-0 text-xs text-muted-foreground">{font.label}</span>
                      <span
                        className="min-w-0 truncate text-lg leading-none"
                        style={{ fontFamily: font.value, color: selectedColor }}
                        aria-hidden
                      >
                        {preview}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
