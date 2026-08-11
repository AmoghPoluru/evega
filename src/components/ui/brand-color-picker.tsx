"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { ChevronDown, Pipette, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BRAND_COLOR_SWATCHES } from "@/lib/templates/brand-color-swatches";
import {
  formatHexDisplay,
  getContrastRatio,
  isValidHex,
  meetsWcagAaNormalText,
  normalizeHex,
  supportsEyeDropper,
} from "@/lib/templates/color-utils";
import { cn } from "@/lib/utils";

const PICKER_DEBOUNCE_MS = 150;

type BrandColorPickerProps = {
  value: string | undefined;
  onChange: (hex: string) => void;
  label: string;
  description?: string;
  fallbackColor?: string;
  presets?: string[];
  /** When set, show a contrast warning if body text would fail WCAG AA on this color. */
  contrastTextColor?: string;
  disabled?: boolean;
};

export function BrandColorPicker({
  value,
  onChange,
  label,
  description,
  fallbackColor,
  presets = BRAND_COLOR_SWATCHES,
  contrastTextColor,
  disabled = false,
}: BrandColorPickerProps) {
  const triggerId = useId();
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(formatHexDisplay(value));
  const [hexError, setHexError] = useState<string | null>(null);
  const [pickerColor, setPickerColor] = useState(formatHexDisplay(value));
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayColor = formatHexDisplay(value);
  const triggerColor = open ? pickerColor : displayColor;

  useEffect(() => {
    setPickerColor(displayColor);
  }, [displayColor]);

  useEffect(
    () => () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      setHexInput(displayColor);
      setHexError(null);
    }
  }, [open, displayColor]);

  const applyColor = useCallback(
    (next: string, options?: { debounce?: boolean }) => {
      const normalized = normalizeHex(next);
      if (!normalized) return;

      setPickerColor(normalized);
      setHexInput(normalized);
      setHexError(null);

      const commit = () => onChange(normalized);
      if (options?.debounce) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(commit, PICKER_DEBOUNCE_MS);
        return;
      }

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      commit();
    },
    [onChange],
  );

  const handleHexCommit = () => {
    const normalized = normalizeHex(hexInput);
    if (!normalized) {
      setHexError("Enter a valid hex color (#RGB or #RRGGBB)");
      return;
    }
    applyColor(normalized);
  };

  const handleEyeDropper = async () => {
    if (!supportsEyeDropper()) return;

    try {
      // @ts-expect-error EyeDropper is not in all TS DOM libs yet
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      applyColor(result.sRGBHex);
    } catch {
      // User cancelled — no-op
    }
  };

  const showContrastWarning =
    contrastTextColor &&
    isValidHex(displayColor) &&
    isValidHex(contrastTextColor) &&
    !meetsWcagAaNormalText(contrastTextColor, displayColor);

  const contrastRatio =
    contrastTextColor && isValidHex(displayColor) && isValidHex(contrastTextColor)
      ? getContrastRatio(contrastTextColor, displayColor).toFixed(1)
      : null;

  const canReset =
    fallbackColor &&
    normalizeHex(fallbackColor) &&
    normalizeHex(fallbackColor) !== normalizeHex(displayColor);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={triggerId} className="text-sm font-medium leading-none">
          {label}
        </label>
        {canReset ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => applyColor(fallbackColor!)}
            disabled={disabled}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        ) : null}
      </div>

      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={triggerId}
            type="button"
            disabled={disabled}
            className={cn(
              "flex w-full items-center gap-3 rounded-md border bg-background px-3 py-2 text-left text-sm shadow-xs transition-colors",
              "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <span
              className="h-8 w-8 shrink-0 rounded-md border shadow-inner"
              style={{ backgroundColor: triggerColor }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 font-mono text-sm">{triggerColor}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-3" align="start">
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Brand presets</p>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((swatch) => {
                  const normalized = normalizeHex(swatch) ?? swatch;
                  const selected = normalized === displayColor;
                  return (
                    <button
                      key={swatch}
                      type="button"
                      title={normalized}
                      aria-label={`Use ${normalized}`}
                      className={cn(
                        "h-7 w-7 rounded-md border shadow-sm transition-transform hover:scale-105",
                        selected && "ring-2 ring-primary ring-offset-1",
                      )}
                      style={{ backgroundColor: normalized }}
                      onClick={() => applyColor(normalized)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="overflow-hidden rounded-md [&_.react-colorful]:h-36 [&_.react-colorful]:w-full">
              <HexColorPicker
                color={pickerColor}
                onChange={(next) => applyColor(next, { debounce: true })}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Input
                  value={hexInput}
                  onChange={(event) => setHexInput(event.target.value)}
                  onBlur={handleHexCommit}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleHexCommit();
                  }}
                  className="font-mono text-sm"
                  aria-invalid={Boolean(hexError)}
                  placeholder="#RRGGBB"
                />
                {hexError ? (
                  <p className="mt-1 text-xs text-destructive">{hexError}</p>
                ) : null}
              </div>

              {supportsEyeDropper() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => void handleEyeDropper()}
                  aria-label="Pick color from screen"
                >
                  <Pipette className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {showContrastWarning ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Low contrast with text ({contrastRatio}:1) — body text may be hard to read on this
          color.
        </p>
      ) : null}
    </div>
  );
}
