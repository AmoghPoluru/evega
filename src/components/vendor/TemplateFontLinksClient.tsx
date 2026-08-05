"use client";

import { useEffect } from "react";

import { buildGoogleFontsHref } from "@/lib/templates/template-fonts";

interface TemplateFontLinksClientProps {
  headingFont?: string | null;
  bodyFont?: string | null;
}

/** Client-side Google Fonts loader for live template previews. */
export function TemplateFontLinksClient({
  headingFont,
  bodyFont,
}: TemplateFontLinksClientProps) {
  useEffect(() => {
    const href = buildGoogleFontsHref([headingFont, bodyFont]);
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
  }, [headingFont, bodyFont]);

  return null;
}
