"use client";

import { useId } from "react";
import type { ResolvedVendorLogoTemplate } from "@/lib/vendor-logo/types";
import { getMonogramLetter } from "@/lib/vendor-logo/vendor-words";
import {
  CenterDisc,
  MonogramLetter,
  palette,
  regularPolygonPoints,
  starPoints,
} from "./monogram-svg-utils";

/** Eight-point Diwali rangoli star */
export function RangoliStarLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <radialGradient id={`${uid}-star-bg`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={theme.background} />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0.25" />
        </radialGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={`url(#${uid}-star-bg)`} />
      {[52, 44, 36].map((r, i) => (
        <polygon
          key={r}
          points={starPoints(64, 64, r, r * 0.42, 8, i * 11)}
          fill="none"
          stroke={colors[i % colors.length]}
          strokeWidth={i === 0 ? 2.5 : 1.5}
          opacity={0.55 + i * 0.12}
        />
      ))}
      <polygon
        points={starPoints(64, 64, 48, 20, 8)}
        fill={theme.secondary}
        opacity="0.2"
        stroke={theme.primary}
        strokeWidth="1.5"
      />
      {Array.from({ length: 8 }, (_, i) => {
        const angle = i * 45;
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={angle}
            cx={64 + 54 * Math.cos(rad)}
            cy={64 + 54 * Math.sin(rad)}
            r="4"
            fill={colors[i % colors.length]}
          />
        );
      })}
      <CenterDisc theme={theme} />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.secondary} />
    </svg>
  );
}

/** Festive clay diya with flame */
export function DiyaLampLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <linearGradient id={`${uid}-flame`} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor={theme.secondary} />
          <stop offset="50%" stopColor={theme.accent} />
          <stop offset="100%" stopColor={theme.highlight} />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      <ellipse cx="64" cy="108" rx="40" ry="8" fill={theme.primary} opacity="0.15" />
      <path
        d="M28 88 C28 72 40 64 64 64 C88 64 100 72 100 88 C100 98 92 104 64 104 C36 104 28 98 28 88Z"
        fill={theme.primary}
        opacity="0.9"
      />
      <path
        d="M36 88 C36 76 48 72 64 72 C80 72 92 76 92 88 C92 94 86 98 64 98 C42 98 36 94 36 88Z"
        fill={theme.secondary}
        opacity="0.45"
      />
      <path
        d="M64 64 C58 52 52 38 64 18 C76 38 70 52 64 64Z"
        fill={`url(#${uid}-flame)`}
      />
      {[0, 120, 240].map((angle, i) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return (
          <circle
            key={angle}
            cx={64 + 18 * Math.cos(rad)}
            cy={36 + 18 * Math.sin(rad)}
            r="3"
            fill={colors[i + 2] ?? colors[i]}
            opacity="0.85"
          />
        );
      })}
      <circle cx="64" cy="82" r="28" fill={theme.background} stroke={theme.tertiary} strokeWidth="2" />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.secondary} />
    </svg>
  );
}

/** Malli jasmine bud garland ring */
export function JasmineWreathLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const colors = palette(theme);
  const buds = 14;

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      <circle cx="64" cy="64" r="54" fill="none" stroke={theme.primary} strokeWidth="1.5" opacity="0.35" />
      {Array.from({ length: buds }, (_, i) => {
        const angle = (360 / buds) * i;
        const rad = (angle * Math.PI) / 180;
        const x = 64 + 46 * Math.cos(rad);
        const y = 64 + 46 * Math.sin(rad);
        return (
          <g key={angle} transform={`rotate(${angle + 90} ${x} ${y})`}>
            <ellipse cx={x} cy={y} rx="5" ry="9" fill={colors[i % colors.length]} opacity="0.9" />
            <ellipse cx={x} cy={y - 3} rx="3" ry="5" fill={theme.background} opacity="0.7" />
          </g>
        );
      })}
      {Array.from({ length: buds }, (_, i) => {
        const angle = (360 / buds) * i + 180 / buds;
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={`leaf-${i}`}
            cx={64 + 38 * Math.cos(rad)}
            cy={64 + 38 * Math.sin(rad)}
            r="2.5"
            fill={theme.highlight}
            opacity="0.8"
          />
        );
      })}
      <CenterDisc theme={theme} innerOpacity={0.08} />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.primary} />
    </svg>
  );
}

/** Twin boteh paisley curves */
export function PaisleyCurveLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <linearGradient id={`${uid}-paisley-l`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
        <linearGradient id={`${uid}-paisley-r`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[2]} />
          <stop offset="50%" stopColor={colors[3]} />
          <stop offset="100%" stopColor={colors[4]} />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      <path
        d="M8 20 C8 60 20 90 48 108 C36 88 30 62 34 38 C22 32 8 28 8 20Z"
        fill={`url(#${uid}-paisley-l)`}
        opacity="0.88"
      />
      <path
        d="M120 20 C120 60 108 90 80 108 C92 88 98 62 94 38 C106 32 120 28 120 20Z"
        fill={`url(#${uid}-paisley-r)`}
        opacity="0.88"
      />
      <circle cx="28" cy="36" r="5" fill={theme.secondary} />
      <circle cx="100" cy="36" r="5" fill={theme.highlight} />
      <CenterDisc theme={theme} />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.secondary} />
    </svg>
  );
}

/** Makar Sankranti diamond kite */
export function KiteSankrantiLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <linearGradient id={`${uid}-kite`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="25%" stopColor={colors[1]} />
          <stop offset="50%" stopColor={colors[2]} />
          <stop offset="75%" stopColor={colors[3]} />
          <stop offset="100%" stopColor={colors[4]} />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      <polygon points="64,14 108,64 64,114 20,64" fill={`url(#${uid}-kite)`} opacity="0.92" />
      <line x1="64" y1="14" x2="64" y2="114" stroke={theme.background} strokeWidth="2" opacity="0.6" />
      <line x1="20" y1="64" x2="108" y2="64" stroke={theme.background} strokeWidth="2" opacity="0.6" />
      <circle cx="64" cy="64" r="6" fill={theme.secondary} stroke={theme.background} strokeWidth="2" />
      <path d="M64 114 L58 124 L64 120 L70 124 Z" fill={theme.accent} />
      <path d="M64 120 C68 108 72 100 76 88" fill="none" stroke={theme.tertiary} strokeWidth="2" />
      <path d="M76 88 C80 82 84 78 90 74" fill="none" stroke={theme.highlight} strokeWidth="1.5" />
      <circle cx="64" cy="64" r="26" fill={theme.background} opacity="0.92" />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.primary} />
    </svg>
  );
}

/** Mehndi corner scrollwork frame */
export function HennaScrollLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const colors = palette(theme);
  const corners = [
    "M16 40 C16 16 16 16 40 16",
    "M88 16 C112 16 112 16 112 40",
    "M112 88 C112 112 112 112 88 112",
    "M40 112 C16 112 16 112 16 88",
  ];

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      <rect x="14" y="14" width="100" height="100" rx="8" fill="none" stroke={theme.primary} strokeWidth="1.5" opacity="0.4" />
      {corners.map((d, i) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={colors[i % colors.length]}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
      ))}
      {[
        [22, 22],
        [106, 22],
        [106, 106],
        [22, 106],
      ].map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="6" fill={colors[(i + 1) % colors.length]} opacity="0.8" />
          <circle cx={x} cy={y} r="2.5" fill={theme.background} />
        </g>
      ))}
      <CenterDisc theme={theme} r={32} />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.highlight} />
    </svg>
  );
}

/** Genda marigold petal crown */
export function MarigoldRingLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const colors = palette(theme);
  const petals = 12;

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      {Array.from({ length: petals }, (_, i) => {
        const angle = (360 / petals) * i;
        const rad = (angle * Math.PI) / 180;
        const x = 64 + 44 * Math.cos(rad);
        const y = 64 + 44 * Math.sin(rad);
        return (
          <ellipse
            key={angle}
            cx={x}
            cy={y}
            rx="8"
            ry="14"
            fill={colors[i % colors.length]}
            opacity="0.9"
            transform={`rotate(${angle + 90} ${x} ${y})`}
          />
        );
      })}
      {Array.from({ length: petals }, (_, i) => {
        const angle = (360 / petals) * i + 15;
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={`center-${i}`}
            cx={64 + 44 * Math.cos(rad)}
            cy={64 + 44 * Math.sin(rad)}
            r="3"
            fill={theme.secondary}
          />
        );
      })}
      <CenterDisc theme={theme} />
      <MonogramLetter letter={letter} theme={theme} fill={theme.primary} stroke={theme.secondary} />
    </svg>
  );
}

/** Ashoka-inspired chakra wheel */
export function ChakraWheelLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const colors = palette(theme);
  const spokes = 12;

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      <circle cx="64" cy="64" r="54" fill="none" stroke={theme.primary} strokeWidth="2.5" />
      <circle cx="64" cy="64" r="48" fill="none" stroke={theme.secondary} strokeWidth="1.5" opacity="0.7" />
      {Array.from({ length: spokes }, (_, i) => {
        const angle = (360 / spokes) * i;
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1="64"
            y1="64"
            x2={64 + 50 * Math.cos(rad)}
            y2={64 + 50 * Math.sin(rad)}
            stroke={colors[i % colors.length]}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })}
      {Array.from({ length: spokes }, (_, i) => {
        const angle = (360 / spokes) * i + 360 / spokes / 2;
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={`dot-${i}`}
            cx={64 + 42 * Math.cos(rad)}
            cy={64 + 42 * Math.sin(rad)}
            r="3.5"
            fill={colors[(i + 2) % colors.length]}
          />
        );
      })}
      <CenterDisc theme={theme} r={30} />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.secondary} />
    </svg>
  );
}

/** Hexagonal floor kolam */
export function HexKolamLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const colors = palette(theme);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      {[54, 44, 34].map((r, i) => (
        <polygon
          key={r}
          points={regularPolygonPoints(64, 64, r, 6, i * 10)}
          fill="none"
          stroke={colors[i % colors.length]}
          strokeWidth={i === 0 ? 2.5 : 1.5}
          opacity={0.5 + i * 0.15}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = 60 * i;
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={64 + 20 * Math.cos(rad)}
            y1={64 + 20 * Math.sin(rad)}
            x2={64 + 54 * Math.cos(rad)}
            y2={64 + 54 * Math.sin(rad)}
            stroke={colors[(i + 1) % colors.length]}
            strokeWidth="1.5"
            opacity="0.65"
          />
        );
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = 60 * i + 30;
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={`v-${i}`}
            cx={64 + 54 * Math.cos(rad)}
            cy={64 + 54 * Math.sin(rad)}
            r="4"
            fill={colors[(i + 3) % colors.length]}
          />
        );
      })}
      <CenterDisc theme={theme} />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.tertiary} />
    </svg>
  );
}

/** Geometric festive elephant head */
export function ElephantEmblemLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <linearGradient id={`${uid}-elephant`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[0]} />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      <ellipse cx="64" cy="52" rx="38" ry="32" fill={`url(#${uid}-elephant)`} opacity="0.9" />
      <ellipse cx="34" cy="48" rx="14" ry="20" fill={colors[2]} opacity="0.85" />
      <ellipse cx="94" cy="48" rx="14" ry="20" fill={colors[2]} opacity="0.85" />
      <path
        d="M64 72 C64 88 58 100 48 108 C56 104 62 98 64 90 C66 98 72 104 80 108 C70 100 64 88 64 72Z"
        fill={colors[3]}
        opacity="0.9"
      />
      <circle cx="48" cy="46" r="4" fill={theme.background} />
      <circle cx="80" cy="46" r="4" fill={theme.background} />
      <circle cx="48" cy="46" r="2" fill={theme.primary} />
      <circle cx="80" cy="46" r="2" fill={theme.primary} />
      <path d="M52 58 C58 62 70 62 76 58" fill="none" stroke={theme.highlight} strokeWidth="2" strokeLinecap="round" />
      <rect x="44" y="28" width="40" height="8" rx="4" fill={colors[4]} opacity="0.85" />
      <circle cx="64" cy="78" r="24" fill={theme.background} stroke={theme.primary} strokeWidth="2" />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.secondary} />
    </svg>
  );
}
