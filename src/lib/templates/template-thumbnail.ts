import type { CSSProperties } from "react";
import type { VendorTemplate } from "@/payload-types";

type MediaLike = { url?: string | null } | string | null | undefined;

function mediaUrl(media: MediaLike): string | null {
  if (!media || typeof media === "string") return null;
  const url = media.url?.trim();
  return url || null;
}

/** Resolved thumbnail URL for template selection cards (thumbnail → preview image). */
export function getTemplateThumbnailUrl(template: VendorTemplate): string | null {
  return (
    mediaUrl(template.thumbnailImage) ??
    mediaUrl(template.previewImage) ??
    null
  );
}

/** Gradient fallback when no uploaded preview images exist. */
export function getTemplateCardPreviewStyle(template: VendorTemplate): CSSProperties {
  const config = template.templateConfig;
  const colors =
    config &&
    typeof config === "object" &&
    !Array.isArray(config) &&
    "colors" in config &&
    config.colors &&
    typeof config.colors === "object" &&
    !Array.isArray(config.colors)
      ? (config.colors as Record<string, string | undefined>)
      : null;

  const primary = colors?.primary ?? "#4f46e5";
  const secondary = colors?.secondary ?? "#7c3aed";
  const accent = colors?.accent ?? "#db2777";
  const background = colors?.background ?? "#f8fafc";

  return {
    background: `linear-gradient(145deg, ${primary} 0%, ${secondary} 45%, ${accent} 100%)`,
    color: colors?.text ?? "#ffffff",
    boxShadow: `inset 0 0 0 1px ${background}22`,
  };
}
