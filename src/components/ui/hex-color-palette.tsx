"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

export interface HexColorSwatch {
  q: number;
  r: number;
  color: string;
}

interface HexColorPaletteProps {
  value?: string;
  onChange?: (color: string) => void;
  className?: string;
  /** Smaller hex tiles for inline field layouts. */
  compact?: boolean;
  /** Larger hex tiles for the expanded picker overlay. */
  expanded?: boolean;
  /** When false, swatches are not clickable (preview only). */
  interactive?: boolean;
}

const DEFAULT_HEX_RADIUS = 15;
const COMPACT_HEX_RADIUS = 11;
const EXPANDED_HEX_RADIUS = 20;
const HEX_GAP = 1.5;

function hslToHex(h: number, s: number, l: number): string {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = h / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (huePrime >= 0 && huePrime < 1) [r1, g1, b1] = [chroma, x, 0];
  else if (huePrime < 2) [r1, g1, b1] = [x, chroma, 0];
  else if (huePrime < 3) [r1, g1, b1] = [0, chroma, x];
  else if (huePrime < 4) [r1, g1, b1] = [0, x, chroma];
  else if (huePrime < 5) [r1, g1, b1] = [x, 0, chroma];
  else [r1, g1, b1] = [chroma, 0, x];

  const match = lightness - chroma / 2;
  const toByte = (channel: number) =>
    Math.round((channel + match) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toByte(r1)}${toByte(g1)}${toByte(b1)}`;
}

function normalizeHex(color: string): string {
  return color.trim().toLowerCase();
}

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = expandShortHex(hex).replace("#", "");
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return [r, g, b];
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

/** Pick the palette swatch nearest to a target hex (exact match when available). */
export function findClosestSwatchColor(
  targetHex: string,
  swatches: HexColorSwatch[],
): string | undefined {
  if (swatches.length === 0) return undefined;

  const normalized = normalizeHex(toDisplayHex(targetHex));
  const exact = swatches.find((swatch) => normalizeHex(swatch.color) === normalized);
  if (exact) return exact.color;

  const targetRgb = hexToRgb(normalized);
  if (!targetRgb) return swatches[0]?.color;

  let closest = swatches[0];
  let bestDistance = Infinity;

  for (const swatch of swatches) {
    const rgb = hexToRgb(swatch.color);
    if (!rgb) continue;
    const distance = colorDistance(targetRgb, rgb);
    if (distance < bestDistance) {
      bestDistance = distance;
      closest = swatch;
    }
  }

  return closest.color;
}

/** Flat-top axial hex → pixel center. */
function axialToPixel(q: number, r: number, size: number): { x: number; y: number } {
  return {
    x: size * (3 / 2) * q,
    y: size * Math.sqrt(3) * (r + q / 2),
  };
}

function hexRingDistance(q: number, r: number): number {
  const s = -q - r;
  return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
}

/** Honeycomb spectrum: white center, pastels inward, vivid hues outward. */
function buildHoneycombPalette(maxRing = 4): HexColorSwatch[] {
  const swatches: HexColorSwatch[] = [];

  for (let q = -maxRing; q <= maxRing; q += 1) {
    for (let r = -maxRing; r <= maxRing; r += 1) {
      const ring = hexRingDistance(q, r);
      if (ring > maxRing) continue;

      if (ring === 0) {
        swatches.push({ q, r, color: "#FFFFFF" });
        continue;
      }

      const { x, y } = axialToPixel(q, r, 1);
      const angle = (Math.atan2(y, x) * 180) / Math.PI;
      const hue = (angle + 360) % 360;

      if (ring === 1) {
        swatches.push({ q, r, color: hslToHex(hue, 28, 92) });
        continue;
      }

      if (ring === 2) {
        swatches.push({ q, r, color: hslToHex(hue, 52, 78) });
        continue;
      }

      if (ring === 3) {
        swatches.push({ q, r, color: hslToHex(hue, 76, 58) });
        continue;
      }

      swatches.push({ q, r, color: hslToHex(hue, 88, 42) });
    }
  }

  return swatches;
}

function hexPoints(cx: number, cy: number, size: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = ((60 * index - 30) * Math.PI) / 180;
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  }).join(" ");
}

export function HexColorPalette({
  value,
  onChange,
  className,
  compact = false,
  expanded = false,
  interactive = true,
}: HexColorPaletteProps) {
  const maxRing = expanded ? 4 : compact ? 3 : 4;
  const swatches = useMemo(() => buildHoneycombPalette(maxRing), [maxRing]);
  const highlightedColor = useMemo(
    () => (value ? findClosestSwatchColor(value, swatches) : undefined),
    [value, swatches],
  );
  const hexRadius = expanded
    ? EXPANDED_HEX_RADIUS
    : compact
      ? COMPACT_HEX_RADIUS
      : DEFAULT_HEX_RADIUS;

  const layout = useMemo(() => {
    const drawRadius = hexRadius - HEX_GAP;
    const positioned = swatches.map((swatch) => {
      const center = axialToPixel(swatch.q, swatch.r, hexRadius);
      return { ...swatch, ...center };
    });

    const xs = positioned.map((item) => item.x);
    const ys = positioned.map((item) => item.y);
    const minX = Math.min(...xs) - hexRadius - 4;
    const maxX = Math.max(...xs) + hexRadius + 4;
    const minY = Math.min(...ys) - hexRadius - 4;
    const maxY = Math.max(...ys) + hexRadius + 4;

    return {
      positioned,
      drawRadius,
      viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
    };
  }, [hexRadius, swatches]);

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={layout.viewBox}
        role="grid"
        aria-label="Hexagonal color palette"
        className={cn(
          "mx-auto h-auto w-full",
          expanded ? "max-w-[min(100%,380px)]" : compact ? "max-w-52.5" : "max-w-[320px]",
          className,
        )}
      >
        {layout.positioned.map((swatch) => {
          const isSelected =
            highlightedColor !== undefined &&
            normalizeHex(swatch.color) === normalizeHex(highlightedColor);

          return (
            <g key={`${swatch.q}-${swatch.r}`}>
              <polygon
                points={hexPoints(swatch.x, swatch.y, layout.drawRadius)}
                fill={swatch.color}
                stroke={isSelected ? "#111827" : "rgba(255,255,255,0.65)"}
                strokeWidth={isSelected ? 3.2 : 1.2}
                className={cn(
                  "transition-[stroke-width,stroke,filter]",
                  isSelected && "drop-shadow-[0_0_6px_rgba(0,0,0,0.35)]",
                  interactive
                    ? "cursor-pointer hover:stroke-gray-900 focus-visible:outline-none"
                    : "pointer-events-none",
                )}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={interactive ? `Select color ${swatch.color}` : undefined}
                aria-pressed={interactive ? isSelected : undefined}
                onClick={
                  interactive && onChange
                    ? () => onChange(swatch.color)
                    : undefined
                }
                onKeyDown={
                  interactive && onChange
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onChange(swatch.color);
                        }
                      }
                    : undefined
                }
              />
              <title>{swatch.color}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function toDisplayHex(value: string): string {
  if (value === "transparent") return "#ffffff";
  if (value.startsWith("#")) return value.length === 4 ? expandShortHex(value) : value;

  const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!rgbMatch) return value;

  const [, r, g, b] = rgbMatch;
  const toByte = (channel: string) => Number(channel).toString(16).padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function expandShortHex(hex: string): string {
  if (hex.length !== 4 || !hex.startsWith("#")) return hex;
  const [, r, g, b] = hex;
  return `#${r}${r}${g}${g}${b}${b}`;
}

export { buildHoneycombPalette, normalizeHex };
