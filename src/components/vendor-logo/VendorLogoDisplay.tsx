"use client";

import { useId } from "react";
import type { ResolvedVendorLogoTemplate, VendorLogoPreset } from "@/lib/vendor-logo/types";
import { getMonogramLetter } from "@/lib/vendor-logo/vendor-words";
import {
  ChakraWheelLogo,
  DiyaLampLogo,
  ElephantEmblemLogo,
  HennaScrollLogo,
  HexKolamLogo,
  JasmineWreathLogo,
  KiteSankrantiLogo,
  MarigoldRingLogo,
  PaisleyCurveLogo,
  RangoliStarLogo,
} from "./extra-monogram-presets";
import { MonogramLetter, palette, polarX, polarY } from "./monogram-svg-utils";

type VendorLogoDisplayProps = {
  logo: ResolvedVendorLogoTemplate;
  className?: string;
};

/** Lotus — rani maroon, gold, gulabi, sindoor, mehndi */
function LotusGraceLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <radialGradient id={`${uid}-lotus-bg`} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor={theme.background} />
          <stop offset="55%" stopColor={theme.accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={theme.tertiary} stopOpacity="0.12" />
        </radialGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={`url(#${uid}-lotus-bg)`} />
      <circle cx="64" cy="64" r="58" fill="none" stroke={theme.secondary} strokeWidth="2" opacity="0.65" />
      <circle cx="64" cy="64" r="52" fill="none" stroke={theme.highlight} strokeWidth="1" opacity="0.45" strokeDasharray="4 5" />
      {petals.map((angle, i) => {
        const cx = polarX(64, 38, angle);
        const cy = polarY(64, 38, angle);
        return (
          <ellipse
            key={angle}
            cx={cx}
            cy={cy}
            rx="14"
            ry="22"
            fill={colors[i % colors.length]}
            opacity={0.88 - (i % 3) * 0.06}
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        );
      })}
      {petals.map((angle, i) => {
        const cx = polarX(64, 26, angle);
        const cy = polarY(64, 26, angle);
        return (
          <circle key={`dot-${angle}`} cx={cx} cy={cy} r="3" fill={colors[(i + 2) % colors.length]} opacity="0.9" />
        );
      })}
      <circle cx="64" cy="64" r="34" fill={theme.background} stroke={theme.primary} strokeWidth="2.5" />
      <circle cx="64" cy="64" r="28" fill={theme.secondary} opacity="0.12" />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.secondary} />
    </svg>
  );
}

/** Peacock — blue, gold, emerald, purple, magenta */
function PeacockRoyalLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <linearGradient id={`${uid}-peacock-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.background} />
          <stop offset="40%" stopColor={theme.accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={theme.tertiary} stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id={`${uid}-peacock-feather`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={theme.primary} />
          <stop offset="45%" stopColor={theme.accent} />
          <stop offset="100%" stopColor={theme.tertiary} />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={`url(#${uid}-peacock-bg)`} />
      <path
        d="M64 8 C28 28 18 58 24 88 C32 72 48 62 64 58 C80 62 96 72 104 88 C110 58 100 28 64 8Z"
        fill={`url(#${uid}-peacock-feather)`}
        opacity="0.95"
      />
      <path
        d="M64 22 C42 38 36 58 40 78 C48 68 56 62 64 60 C72 62 80 68 88 78 C92 58 86 38 64 22Z"
        fill={theme.secondary}
        opacity="0.75"
      />
      <circle cx="64" cy="48" r="9" fill={theme.background} stroke={theme.secondary} strokeWidth="2" />
      <circle cx="64" cy="48" r="4" fill={theme.highlight} />
      <circle cx="62" cy="46" r="1.2" fill={theme.background} />
      {[0, 72, 144, 216, 288].map((angle, i) => (
          <g key={angle}>
            <circle
              cx={polarX(64, 46, angle - 90)}
              cy={polarY(64, 46, angle - 90)}
              r="5"
              fill={colors[i % colors.length]}
              opacity="0.85"
            />
            <circle
              cx={polarX(64, 46, angle - 90)}
              cy={polarY(64, 46, angle - 90)}
              r="2"
              fill={theme.background}
              opacity="0.7"
            />
          </g>
        ))}
      <circle cx="64" cy="68" r="36" fill={theme.primary} />
      <circle cx="64" cy="68" r="30" fill={theme.accent} opacity="0.22" />
      <circle cx="64" cy="68" r="24" fill={theme.tertiary} opacity="0.15" />
      <MonogramLetter letter={letter} theme={theme} fill="#FFFFFF" stroke={theme.secondary} />
    </svg>
  );
}

/** Mandala — kumkum, kesari, haldi, fuchsia, turquoise */
function MandalaGoldLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <radialGradient id={`${uid}-mandala-bg`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={theme.background} />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={`url(#${uid}-mandala-bg)`} />
      {[56, 48, 40, 32, 24].map((r, i) => (
        <circle
          key={r}
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={colors[i % colors.length]}
          strokeWidth={i === 0 ? 2.5 : 1.5}
          opacity={0.5 + i * 0.08}
        />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30;
        return (
          <circle
            key={angle}
            cx={polarX(64, 50, angle)}
            cy={polarY(64, 50, angle)}
            r="5"
            fill={colors[i % colors.length]}
            opacity="0.9"
          />
        );
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = i * 60 + 15;
        return (
          <circle
            key={`inner-${angle}`}
            cx={polarX(64, 36, angle)}
            cy={polarY(64, 36, angle)}
            r="3.5"
            fill={colors[(i + 2) % colors.length]}
            opacity="0.75"
          />
        );
      })}
      <circle cx="64" cy="64" r="30" fill={theme.background} stroke={theme.primary} strokeWidth="2" />
      <circle cx="64" cy="64" r="26" fill={theme.highlight} opacity="0.08" />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.secondary} />
    </svg>
  );
}

/** Bandhani — purple, pink, marigold, emerald, amber */
function SilkEmblemLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);
  const cornerDots: Array<[number, number]> = [
    [24, 24],
    [104, 24],
    [24, 104],
    [104, 104],
    [64, 16],
    [64, 112],
    [16, 64],
    [112, 64],
  ];

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <linearGradient id={`${uid}-bandhani-frame`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.primary} />
          <stop offset="33%" stopColor={theme.secondary} />
          <stop offset="66%" stopColor={theme.accent} />
          <stop offset="100%" stopColor={theme.tertiary} />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      <rect x="12" y="12" width="104" height="104" rx="12" fill="none" stroke={`url(#${uid}-bandhani-frame)`} strokeWidth="2.5" />
      <rect x="20" y="20" width="88" height="88" rx="8" fill={theme.highlight} opacity="0.1" />
      {cornerDots.map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="10" fill={colors[i % colors.length]} opacity="0.92" />
          <circle cx={x} cy={y} r="4" fill={theme.background} opacity="0.85" />
          <circle cx={x} cy={y} r="1.8" fill={colors[(i + 3) % colors.length]} />
        </g>
      ))}
      {[32, 48, 64, 80, 96].map((y, row) =>
        [32, 48, 64, 80, 96].map((x, col) => {
          if (x === 64 && y === 64) return null;
          const colorIndex = (row + col) % colors.length;
          return (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="3"
              fill={colors[colorIndex]}
              opacity={0.45}
            />
          );
        }),
      )}
      <circle cx="64" cy="64" r="36" fill={theme.primary} opacity="0.06" />
      <circle cx="64" cy="64" r="32" fill={theme.background} stroke={theme.primary} strokeWidth="2.5" />
      <circle cx="64" cy="64" r="28" fill={theme.secondary} opacity="0.07" />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.tertiary} />
    </svg>
  );
}

/** Heritage arch — terracotta, jade, saffron, rose, Krishna blue */
function TempleArchLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const letter = getMonogramLetter(logo.word1);
  const { theme } = logo;
  const uid = useId();
  const colors = palette(theme);

  return (
    <svg viewBox="0 0 128 128" className="h-full w-full" aria-label={`${letter} logo`}>
      <defs>
        <linearGradient id={`${uid}-arch-fill`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.45" />
          <stop offset="50%" stopColor={theme.tertiary} stopOpacity="0.25" />
          <stop offset="100%" stopColor={theme.highlight} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="16" fill={theme.background} />
      <path
        d="M20 108 V52 C20 28 44 16 64 16 C84 16 108 28 108 52 V108 H20Z"
        fill={`url(#${uid}-arch-fill)`}
        stroke={theme.primary}
        strokeWidth="2"
      />
      <path
        d="M32 108 V58 C32 42 46 32 64 32 C82 32 96 42 96 58 V108 H32Z"
        fill="none"
        stroke={theme.secondary}
        strokeWidth="2.5"
      />
      {[28, 44, 64, 84, 100].map((x, i) => (
        <circle key={x} cx={x} cy="22" r="3" fill={colors[i % colors.length]} opacity="0.85" />
      ))}
      <circle cx="64" cy="44" r="7" fill={theme.secondary} stroke={theme.accent} strokeWidth="1.5" />
      <circle cx="64" cy="44" r="3" fill={theme.highlight} />
      <rect x="58" y="108" width="12" height="8" fill={theme.primary} opacity="0.55" />
      {[40, 88].map((x, i) => (
        <rect
          key={x}
          x={x}
          y="96"
          width="6"
          height="12"
          rx="1"
          fill={colors[(i + 1) % colors.length]}
          opacity="0.7"
        />
      ))}
      <circle cx="64" cy="68" r="34" fill={theme.background} stroke={theme.primary} strokeWidth="2" />
      <circle cx="64" cy="68" r="28" fill={theme.accent} opacity="0.1" />
      <MonogramLetter letter={letter} theme={theme} stroke={theme.secondary} />
    </svg>
  );
}

const presetComponents: Record<VendorLogoPreset, React.ComponentType<{ logo: ResolvedVendorLogoTemplate }>> = {
  "lotus-grace": LotusGraceLogo,
  "peacock-royal": PeacockRoyalLogo,
  "mandala-gold": MandalaGoldLogo,
  "silk-emblem": SilkEmblemLogo,
  "temple-arch": TempleArchLogo,
  "rangoli-star": RangoliStarLogo,
  "diya-lamp": DiyaLampLogo,
  "jasmine-wreath": JasmineWreathLogo,
  "paisley-curve": PaisleyCurveLogo,
  "kite-sankranti": KiteSankrantiLogo,
  "henna-scroll": HennaScrollLogo,
  "marigold-ring": MarigoldRingLogo,
  "chakra-wheel": ChakraWheelLogo,
  "hex-kolam": HexKolamLogo,
  "elephant-emblem": ElephantEmblemLogo,
};

export function VendorLogoDisplay({ logo, className }: VendorLogoDisplayProps) {
  const Component = presetComponents[logo.preset] ?? LotusGraceLogo;
  return (
    <div className={className ?? "aspect-square h-full w-full overflow-hidden rounded-xl"}>
      <Component logo={logo} />
    </div>
  );
}

export function VendorLogoMark({
  logo,
  size = 48,
}: {
  logo: ResolvedVendorLogoTemplate;
  size?: number;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className="shrink-0 overflow-hidden rounded-xl border border-border/30 shadow-sm"
    >
      <VendorLogoDisplay logo={logo} className="h-full w-full" />
    </div>
  );
}
