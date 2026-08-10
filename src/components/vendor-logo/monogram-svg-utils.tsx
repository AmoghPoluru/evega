import type { VendorLogoTheme } from "@/lib/vendor-logo/types";

export type MonogramProps = {
  letter: string;
  theme: VendorLogoTheme;
};

/** Five accent colors plus background — cycles for decorative elements. */
export function palette(theme: VendorLogoTheme): string[] {
  return [theme.primary, theme.secondary, theme.accent, theme.tertiary, theme.highlight];
}

export function MonogramLetter({
  letter,
  theme,
  fill,
  stroke,
}: MonogramProps & { fill?: string; stroke?: string }) {
  const letterFill = fill ?? theme.primary;
  return (
    <>
      {stroke ? (
        <text
          x="64"
          y="76"
          textAnchor="middle"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          fontSize="54"
          fontWeight="700"
          fontFamily="Georgia, 'Palatino Linotype', 'Times New Roman', serif"
        >
          {letter}
        </text>
      ) : null}
      <text
        x="64"
        y="76"
        textAnchor="middle"
        fill={letterFill}
        fontSize="54"
        fontWeight="700"
        fontFamily="Georgia, 'Palatino Linotype', 'Times New Roman', serif"
      >
        {letter}
      </text>
    </>
  );
}

export function CenterDisc({
  theme,
  r = 34,
  innerOpacity = 0.1,
}: {
  theme: VendorLogoTheme;
  r?: number;
  innerOpacity?: number;
}) {
  return (
    <>
      <circle cx="64" cy="64" r={r} fill={theme.background} stroke={theme.primary} strokeWidth="2" />
      <circle cx="64" cy="64" r={r - 6} fill={theme.accent} opacity={innerOpacity} />
    </>
  );
}

/** Round SVG coordinates so SSR and client hydration produce identical attribute strings. */
export function svgCoord(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function polarX(cx: number, radius: number, angleDeg: number): number {
  const rad = (angleDeg * Math.PI) / 180;
  return svgCoord(cx + radius * Math.cos(rad));
}

export function polarY(cy: number, radius: number, angleDeg: number): number {
  const rad = (angleDeg * Math.PI) / 180;
  return svgCoord(cy + radius * Math.sin(rad));
}

/** Regular polygon points for SVG polygon / path. */
export function regularPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotationDeg = -90,
): string {
  return Array.from({ length: sides }, (_, i) => {
    const angle = rotationDeg + (360 / sides) * i;
    return `${polarX(cx, radius, angle)},${polarY(cy, radius, angle)}`;
  }).join(" ");
}

/** Star polygon with alternating outer/inner radii. */
export function starPoints(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number,
  rotationDeg = -90,
): string {
  return Array.from({ length: points * 2 }, (_, i) => {
    const angle = rotationDeg + (180 / points) * i;
    const r = i % 2 === 0 ? outerR : innerR;
    return `${polarX(cx, r, angle)},${polarY(cy, r, angle)}`;
  }).join(" ");
}
