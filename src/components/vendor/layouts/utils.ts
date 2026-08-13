/**
 * Shared helpers used across vendor storefront layouts.
 */

import type { ResolvedTemplate } from "@/types/template-customization";

/** Extract plain text from a Payload/Lexical rich-text value (or plain string). */
export function getDescriptionText(description: any): string | null {
  if (!description) return null;
  if (typeof description === "string") return description;
  if (typeof description === "object" && "root" in description) {
    const extractText = (node: any): string => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) {
        return node.map(extractText).join(" ");
      }
      if (node && typeof node === "object") {
        if (node.text) return node.text;
        if (node.children) return extractText(node.children);
      }
      return "";
    };
    return extractText(description.root?.children || []).trim() || null;
  }
  return null;
}

/** Resolve a usable image URL from a Payload upload relationship. */
export function getMediaUrl(media: any): string | null {
  if (!media) return null;
  if (typeof media === "string") return null;
  if (typeof media === "object" && typeof media.url === "string") return media.url;
  return null;
}

/**
 * Deterministic pseudo-rating (3.5 - 5.0) derived from a stable id so the value
 * is consistent between server and client renders. Used for display-only star
 * ratings in catalog-style layouts.
 */
export function getPseudoRating(seed: string): { rating: number; count: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  const abs = Math.abs(hash);
  const rating = 3.5 + (abs % 16) / 10; // 3.5 .. 5.0 in 0.1 steps
  const count = 12 + (abs % 480); // 12 .. 491
  return { rating: Math.min(5, rating), count };
}

/** Whether the storefront template should render the hero banner region. */
export function isLayoutBannerEnabled(template: ResolvedTemplate): boolean {
  return template.templateConfig.layout?.showBanner !== false;
}
