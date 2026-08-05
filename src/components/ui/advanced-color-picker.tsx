"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeHex } from "@/components/ui/hex-color-palette";
import { toPickerHex } from "@/lib/color-utils";

export interface ColorPresetGroup {
  label: string;
  colors: readonly string[];
}

/** Curated palettes — fashion, ethnic, neutrals, and common storefront hues. */
export const COLOR_PRESET_GROUPS: readonly ColorPresetGroup[] = [
  {
    label: "South Asian",
    colors: [
      "#501313",
      "#800020",
      "#0F766E",
      "#115E59",
      "#D4AF37",
      "#B8860B",
      "#7C2D12",
      "#92400E",
      "#4C1D95",
      "#831843",
      "#1E3A5F",
      "#14532D",
    ],
  },
  {
    label: "Jewel tones",
    colors: [
      "#1B4332",
      "#40916C",
      "#023047",
      "#0077B6",
      "#6A040F",
      "#9D0208",
      "#5A189A",
      "#7209B7",
      "#370617",
      "#9B2226",
      "#005F73",
      "#0A9396",
    ],
  },
  {
    label: "Neutrals",
    colors: [
      "#FFFFFF",
      "#F8FAFC",
      "#F1F5F9",
      "#E2E8F0",
      "#CBD5E1",
      "#94A3B8",
      "#64748B",
      "#475569",
      "#334155",
      "#1E293B",
      "#0F172A",
      "#020617",
    ],
  },
  {
    label: "Warm",
    colors: [
      "#FCEBEB",
      "#FECACA",
      "#F97316",
      "#EA580C",
      "#DC2626",
      "#B91C1C",
      "#F59E0B",
      "#D97706",
      "#FBBF24",
      "#FDE68A",
      "#78350F",
      "#451A03",
    ],
  },
  {
    label: "Cool",
    colors: [
      "#ECFEFF",
      "#CFFAFE",
      "#06B6D4",
      "#0891B2",
      "#3B82F6",
      "#2563EB",
      "#6366F1",
      "#4F46E5",
      "#8B5CF6",
      "#7C3AED",
      "#164E63",
      "#1E3A8A",
    ],
  },
  {
    label: "Pastels",
    colors: [
      "#FFF1F2",
      "#FFE4E6",
      "#FDF2F8",
      "#FAE8FF",
      "#F3E8FF",
      "#EDE9FE",
      "#E0E7FF",
      "#DBEAFE",
      "#D1FAE5",
      "#CCFBF1",
      "#FEF3C7",
      "#FFEDD5",
    ],
  },
  {
    label: "Bold",
    colors: [
      "#FF006E",
      "#FB5607",
      "#FFBE0B",
      "#8338EC",
      "#3A86FF",
      "#EF4444",
      "#22C55E",
      "#14B8A6",
      "#F43F5E",
      "#A855F7",
      "#EAB308",
      "#0EA5E9",
    ],
  },
  {
    label: "Earth",
    colors: [
      "#FAF7F2",
      "#F5F0E8",
      "#E7DCC8",
      "#C4A77D",
      "#A67B5B",
      "#8B6914",
      "#6B4423",
      "#4A3728",
      "#3D2914",
      "#2C1810",
      "#556B2F",
      "#2F4F4F",
    ],
  },
] as const;

interface AdvancedColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Hide preset grids — picker + hex input only. */
  compact?: boolean;
}

function expandShortHex(hex: string): string {
  if (hex.length !== 4 || !hex.startsWith("#")) return hex;
  const [, r, g, b] = hex;
  return `#${r}${r}${g}${g}${b}${b}`;
}

function isValidHexInput(input: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(input.trim());
}

interface PresetSwatchProps {
  color: string;
  selected: boolean;
  onSelect: (color: string) => void;
}

function PresetSwatch({ color, selected, onSelect }: PresetSwatchProps) {
  const isLight = color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#fff";

  return (
    <button
      type="button"
      aria-label={`Select color ${color}`}
      title={color}
      onClick={() => onSelect(color)}
      className={cn(
        "aspect-square w-full rounded-md border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "ring-2 ring-primary ring-offset-1 border-primary" : "border-border/80",
        isLight && "shadow-inner",
      )}
      style={{ backgroundColor: color }}
    />
  );
}

/**
 * Full color picker: saturation/hue plane, hex input, and curated preset grids.
 * Replaces the honeycomb hex palette for richer color selection.
 */
export function AdvancedColorPicker({
  value,
  onChange,
  className,
  compact = false,
}: AdvancedColorPickerProps) {
  const pickerValue = useMemo(() => toPickerHex(value), [value]);
  const [hexInput, setHexInput] = useState(pickerValue);

  useEffect(() => {
    setHexInput(pickerValue);
  }, [pickerValue]);

  const commitColor = useCallback(
    (next: string) => {
      onChange(normalizeHex(expandShortHex(next.toLowerCase())));
    },
    [onChange],
  );

  const handleHexInputChange = (raw: string) => {
    let next = raw.trim();
    if (next && !next.startsWith("#")) {
      next = `#${next}`;
    }
    setHexInput(next);
    if (isValidHexInput(next)) {
      commitColor(next);
    }
  };

  const handleHexBlur = () => {
    if (isValidHexInput(hexInput)) {
      commitColor(hexInput);
      return;
    }
    setHexInput(pickerValue);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className="advanced-color-picker w-full [&_.react-colorful]:w-full [&_.react-colorful]:h-[140px] [&_.react-colorful__saturation]:rounded-md [&_.react-colorful__saturation]:border [&_.react-colorful__saturation]:border-border [&_.react-colorful__hue]:mt-2 [&_.react-colorful__hue]:h-3 [&_.react-colorful__hue]:rounded-full [&_.react-colorful__pointer]:h-4 [&_.react-colorful__pointer]:w-4 [&_.react-colorful__pointer]:border-2 [&_.react-colorful__pointer]:border-white [&_.react-colorful__pointer]:shadow-md"
        onPointerDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <HexColorPicker color={pickerValue} onChange={commitColor} />
      </div>

      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 shrink-0 rounded-md border border-border shadow-inner"
          style={{ backgroundColor: pickerValue }}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor="color-hex-input" className="text-xs text-muted-foreground">
            Hex code
          </Label>
          <Input
            id="color-hex-input"
            value={hexInput}
            onChange={(event) => handleHexInputChange(event.target.value)}
            onBlur={handleHexBlur}
            spellCheck={false}
            className="h-8 font-mono text-sm uppercase"
            maxLength={7}
          />
        </div>
      </div>

      {!compact && (
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
          {COLOR_PRESET_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {group.label}
              </Label>
              <div className="grid grid-cols-6 gap-1.5">
                {group.colors.map((color) => (
                  <PresetSwatch
                    key={`${group.label}-${color}`}
                    color={color}
                    selected={pickerValue.toLowerCase() === color.toLowerCase()}
                    onSelect={commitColor}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
