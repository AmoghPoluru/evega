"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { normalizeHex } from "@/components/ui/hex-color-palette";
import { AdvancedColorPicker } from "@/components/ui/advanced-color-picker";
import { toPickerHex } from "@/lib/color-utils";

interface ColorSwatchProps {
  value: string;
  size?: "md" | "lg";
  className?: string;
}

/** Visible color preview — replaces raw hex in the collapsed field. */
function ColorSwatch({ value, size = "md", className }: ColorSwatchProps) {
  const isTransparent = value === "transparent";
  const displayHex = isTransparent ? "transparent" : toPickerHex(value);
  const dimensions = size === "lg" ? "h-16 w-16" : "h-11 w-11";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-border shadow-inner",
        dimensions,
        className,
      )}
      aria-hidden
    >
      {isTransparent ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
            backgroundSize: "10px 10px",
            backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0",
          }}
        />
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: displayHex }} />
      )}
    </div>
  );
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
  };

  return (
    <>
      <div className={cn("space-y-2", className)}>
        <button
          type="button"
          aria-label="Open color picker"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 rounded-md border border-border bg-background p-2 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ColorSwatch value={value} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Choose color</p>
            <p className="text-xs text-muted-foreground font-mono uppercase">
              {isTransparent ? "Transparent" : pickerValue}
            </p>
          </div>
        </button>

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
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-background p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Color picker"
          >
            <button
              type="button"
              aria-label="Close color picker"
              onClick={() => setExpanded(false)}
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
            </button>

            <div className="mb-4 pt-2">
              <p className="text-sm font-semibold">Pick a color</p>
              <p className="text-xs text-muted-foreground">
                Drag on the plane, use the hue slider, type a hex code, or pick a preset.
              </p>
            </div>

            <AdvancedColorPicker value={pickerValue} onChange={handleSelect} />

            {allowTransparent && (
              <Button
                type="button"
                variant={isTransparent ? "default" : "outline"}
                size="sm"
                className="mt-4 w-full"
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
