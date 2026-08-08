"use client";

import { Great_Vibes, Montserrat } from "next/font/google";
import type { ResolvedVendorLogoTemplate } from "@/lib/vendor-logo/types";

const scriptFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const captionFont = Montserrat({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Magnolia-inspired boutique wordmark: script brand name + spaced BOUTIQUE caption on a dark field.
 */
export function WingoverBoutiqueLogo({ logo }: { logo: ResolvedVendorLogoTemplate }) {
  const brand = (logo.word1 || "wingover").toLowerCase();
  const caption = (logo.word2 || "BOUTIQUE").toUpperCase();
  const { theme } = logo;

  return (
    <svg
      viewBox="0 0 320 140"
      className="h-full w-full"
      role="img"
      aria-label={`${brand} ${caption} logo`}
    >
      <rect width="320" height="140" rx="8" fill={theme.background} />
      <text
        x="160"
        y="72"
        textAnchor="middle"
        fill={theme.primary}
        fontSize="58"
        className={scriptFont.className}
        style={{ fontFamily: scriptFont.style.fontFamily }}
      >
        {brand}
      </text>
      {/* Soft flourish under the script — echoes Magnolia’s elongated m stroke */}
      <path
        d="M48 88 C90 102, 130 78, 160 88 C190 98, 230 78, 272 86"
        fill="none"
        stroke={theme.secondary}
        strokeWidth="1.1"
        opacity="0.55"
      />
      <text
        x="210"
        y="118"
        textAnchor="middle"
        fill={theme.secondary}
        fontSize="11"
        letterSpacing="0.42em"
        className={captionFont.className}
        style={{ fontFamily: captionFont.style.fontFamily }}
      >
        {caption}
      </text>
    </svg>
  );
}
