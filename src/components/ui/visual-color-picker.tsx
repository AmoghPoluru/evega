"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HexColorPalette, normalizeHex } from "@/components/ui/hex-color-palette";

function expandShortHex(hex: string): string {
  if (hex.length !== 4 || !hex.startsWith("#")) return hex;
  const [, r, g, b] = hex;
  return `#${r}${r}${g}${g}${b}${b}`;
}

/** Best-effort conversion so the visual picker can edit seeded rgba/transparent values. */
export function toPickerHex(value: string | undefined, fallback = "#000000"): string {
  if (!value || value === "transparent") return fallback;

  if (value.startsWith("#")) {
    return expandShortHex(value.toLowerCase());
  }

  const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    const toByte = (channel: string) => Number(channel).toString(16).padStart(2, "0");
    return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
  }

  return fallback;
}

function formatReadonlyValue(value: string): string {
  if (value === "transparent") return "transparent";
  if (value.startsWith("#")) return expandShortHex(value).toUpperCase();
  return value;
}

interface VisualColorPickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  allowTransparent?: boolean;
  className?: string;
}

export function VisualColorPickerField({
  value,
  onChange,
  allowTransparent = false,
  className,
}: VisualColorPickerFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const isTransparent = value === "transparent";
  const pickerValue = useMemo(
    () => (isTransparent ? "#ffffff" : toPickerHex(value)),
    [isTransparent, value],
  );
  const displayValue = formatReadonlyValue(isTransparent ? "transparent" : value);

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  const handleSelect = (color: string) => {
    onChange(normalizeHex(color));
    setExpanded(false);
  };

  return (
    <>
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open color palette"
            onClick={() => setExpanded(true)}
            className="group min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-background p-2 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HexColorPalette
              compact
              interactive={false}
              value={pickerValue}
              className="pointer-events-none transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <span className="mt-1 block text-center text-[10px] text-muted-foreground">
              Tap to expand palette
            </span>
          </button>

          <Input
            readOnly
            value={displayValue}
            aria-label="Selected color value"
            className="h-10 w-30 shrink-0 font-mono text-xs uppercase"
          />
        </div>

        {allowTransparent && (
          <Button
            type="button"
            variant={isTransparent ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={() => onChange("transparent")}
          >
            Transparent
          </Button>
        )}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setExpanded(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-md rounded-xl border border-border bg-background p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Color palette"
          >
            <button
              type="button"
              aria-label="Close color palette"
              onClick={() => setExpanded(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
            </button>

            <div className="pt-6 pb-2">
              <HexColorPalette
                expanded
                value={pickerValue}
                onChange={handleSelect}
              />
            </div>

            <Input
              readOnly
              value={displayValue}
              aria-label="Selected color value"
              className="mt-3 font-mono text-sm uppercase"
            />

            {allowTransparent && (
              <Button
                type="button"
                variant={isTransparent ? "default" : "outline"}
                size="sm"
                className="mt-3 w-full"
                onClick={() => {
                  onChange("transparent");
                  setExpanded(false);
                }}
              >
                Transparent
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
