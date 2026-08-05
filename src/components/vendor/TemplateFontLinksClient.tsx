"use client";

import { useEffect } from "react";

import { buildGoogleFontsHref } from "@/lib/templates/template-fonts";

interface TemplateFontLinksClientProps {
  headingFont?: string | null;
  bodyFont?: string | null;
  /** Additional section-specific font stacks (vendor, hero, product, price). */
  extraFonts?: Array<string | null | undefined>;
}

/** Client-side Google Fonts loader for live template previews. */
export function TemplateFontLinksClient({
  headingFont,
  bodyFont,
  extraFonts = [],
}: TemplateFontLinksClientProps) {
  useEffect(() => {
    const href = buildGoogleFontsHref([headingFont, bodyFont, ...extraFonts]);
    const linkId = "evega-template-fonts-preview";

    if (!href) {
      document.getElementById(linkId)?.remove();
      return;
    }

    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    if (link.href !== href) {
      link.href = href;
    }
  }, [headingFont, bodyFont, extraFonts.join("|")]);

  return null;
}
