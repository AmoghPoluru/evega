"use client";

import type { ResolvedVendorLogoTemplate, VendorLogoPreset } from "@/lib/vendor-logo/types";

type VendorLogoDisplayProps = {
  logo: ResolvedVendorLogoTemplate;
  className?: string;
};

function LotusGraceLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const { word1, word2, theme } = logo;
  return (
    <svg viewBox="0 0 320 120" className="h-full w-full" aria-label={`${word1} ${word2}`}>
      <rect width="320" height="120" rx="12" fill={theme.background} />
      <path
        d="M160 18c-8 12-22 14-22 28 0 10 8 16 22 16s22-6 22-16c0-14-14-16-22-28z"
        fill={theme.secondary}
      />
      <path
        d="M160 62c-6 8-14 10-14 18 0 6 5 10 14 10s14-4 14-10c0-8-8-10-14-18z"
        fill={theme.primary}
        opacity="0.85"
      />
      <text x="160" y="88" textAnchor="middle" fill={theme.primary} fontSize="22" fontWeight="700" fontFamily="Georgia, serif">
        {word1}
      </text>
      <text x="160" y="108" textAnchor="middle" fill={theme.secondary} fontSize="11" fontWeight="600" letterSpacing="4" fontFamily="system-ui, sans-serif">
        {word2}
      </text>
    </svg>
  );
}

function PeacockRoyalLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const { word1, word2, theme } = logo;
  return (
    <svg viewBox="0 0 320 120" className="h-full w-full" aria-label={`${word1} ${word2}`}>
      <rect width="320" height="120" rx="12" fill={theme.background} />
      <circle cx="58" cy="60" r="34" fill={theme.accent} />
      <path
        d="M58 28c0 18-12 28-12 40 0 8 6 14 12 14s12-6 12-14c0-12-12-22-12-40z"
        fill={theme.primary}
      />
      <circle cx="58" cy="52" r="6" fill={theme.secondary} />
      <path d="M40 70c8 10 18 14 36 14" stroke={theme.secondary} strokeWidth="2" fill="none" />
      <text x="190" y="68" textAnchor="middle" fill={theme.primary} fontSize="24" fontWeight="700" fontFamily="Georgia, serif">
        {word1}
      </text>
      <text x="190" y="92" textAnchor="middle" fill={theme.secondary} fontSize="12" fontWeight="600" letterSpacing="3" fontFamily="system-ui, sans-serif">
        {word2}
      </text>
    </svg>
  );
}

function MandalaGoldLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const { word1, word2, theme } = logo;
  return (
    <svg viewBox="0 0 320 120" className="h-full w-full" aria-label={`${word1} ${word2}`}>
      <rect width="320" height="120" rx="12" fill={theme.background} />
      <circle cx="72" cy="60" r="38" fill="none" stroke={theme.secondary} strokeWidth="2" />
      <circle cx="72" cy="60" r="28" fill="none" stroke={theme.primary} strokeWidth="1.5" opacity="0.7" />
      <circle cx="72" cy="60" r="18" fill={theme.accent} opacity="0.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="72"
          y1="60"
          x2={72 + 34 * Math.cos((angle * Math.PI) / 180)}
          y2={60 + 34 * Math.sin((angle * Math.PI) / 180)}
          stroke={theme.secondary}
          strokeWidth="1"
          opacity="0.5"
        />
      ))}
      <text x="190" y="66" textAnchor="middle" fill={theme.primary} fontSize="22" fontWeight="700" fontFamily="Georgia, serif">
        {word1}
      </text>
      <text x="190" y="90" textAnchor="middle" fill={theme.secondary} fontSize="11" fontWeight="600" letterSpacing="4" fontFamily="system-ui, sans-serif">
        {word2}
      </text>
    </svg>
  );
}

function SilkEmblemLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const { word1, word2, theme } = logo;
  return (
    <svg viewBox="0 0 320 120" className="h-full w-full" aria-label={`${word1} ${word2}`}>
      <rect width="320" height="120" rx="12" fill={theme.background} />
      <rect x="28" y="28" width="64" height="64" rx="8" fill={theme.accent} />
      <path d="M36 36h48M36 48h48M36 60h48M36 72h48M36 84h48" stroke={theme.primary} strokeWidth="2" opacity="0.35" />
      <path d="M48 36v48M60 36v48M72 36v48" stroke={theme.secondary} strokeWidth="1.5" opacity="0.45" />
      <text x="190" y="66" textAnchor="middle" fill={theme.primary} fontSize="23" fontWeight="700" fontFamily="Georgia, serif">
        {word1}
      </text>
      <text x="190" y="90" textAnchor="middle" fill={theme.secondary} fontSize="11" fontWeight="600" letterSpacing="3" fontFamily="system-ui, sans-serif">
        {word2}
      </text>
    </svg>
  );
}

function TempleArchLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const { word1, word2, theme } = logo;
  return (
    <svg viewBox="0 0 320 120" className="h-full w-full" aria-label={`${word1} ${word2}`}>
      <rect width="320" height="120" rx="12" fill={theme.background} />
      <path
        d="M36 92V52c0-18 16-28 32-28s32 10 32 28v40H36z"
        fill={theme.accent}
        stroke={theme.primary}
        strokeWidth="2"
      />
      <path d="M52 92V58c0-10 8-16 16-16s16 6 16 16v34" fill="none" stroke={theme.secondary} strokeWidth="2" />
      <text x="190" y="66" textAnchor="middle" fill={theme.primary} fontSize="22" fontWeight="700" fontFamily="Georgia, serif">
        {word1}
      </text>
      <text x="190" y="90" textAnchor="middle" fill={theme.secondary} fontSize="11" fontWeight="600" letterSpacing="3" fontFamily="system-ui, sans-serif">
        {word2}
      </text>
    </svg>
  );
}

const presetComponents: Record<VendorLogoPreset, React.ComponentType<{ logo: ResolvedVendorLogoTemplate }>> = {
  "lotus-grace": LotusGraceLogo,
  "peacock-royal": PeacockRoyalLogo,
  "mandala-gold": MandalaGoldLogo,
  "silk-emblem": SilkEmblemLogo,
  "temple-arch": TempleArchLogo,
};

export function VendorLogoDisplay({ logo, className }: VendorLogoDisplayProps) {
  const Component = presetComponents[logo.preset] ?? LotusGraceLogo;
  return (
    <div className={className ?? "h-full w-full overflow-hidden rounded-md"}>
      <Component logo={logo} />
    </div>
  );
}

export function VendorLogoMark({
  logo,
  size = 36,
}: {
  logo: ResolvedVendorLogoTemplate;
  size?: number;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className="shrink-0 overflow-hidden rounded-md border border-border/40"
    >
      <VendorLogoDisplay logo={logo} className="h-full w-full" />
    </div>
  );
}
