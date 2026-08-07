"use client";

import { HappyBannerDisplay } from "@/components/happy-banner/HappyBannerDisplay";
import { buildResolvedHappyBanner } from "@/lib/happy-banner/format-banner";
import type { HappyBannerDocFields } from "@/lib/happy-banner/types";

type HappyBannerThumbnailProps = {
  thumbnailUrl?: string | null;
  banner: HappyBannerDocFields & { id: string };
  alt: string;
  className?: string;
  /** Vendor-specific words — when set, preview reflects this store's text. */
  word1?: string | null;
  word2?: string | null;
};

/** Card thumbnail: uploaded preview image, or a scaled live banner render. */
export function HappyBannerThumbnail({
  thumbnailUrl,
  banner,
  alt,
  className = "h-36 w-full",
  word1,
  word2,
}: HappyBannerThumbnailProps) {
  if (thumbnailUrl) {
    return (
      <div className={`relative overflow-hidden bg-muted ${className}`}>
        <img src={thumbnailUrl} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  const preview = buildResolvedHappyBanner(banner, {
    word1: word1?.trim() || banner.defaultWord1,
    word2: word2?.trim() || banner.defaultWord2,
  });

  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div className="w-[min(100%,920px)] origin-top scale-[0.46]">
          <HappyBannerDisplay banner={preview} />
        </div>
      </div>
    </div>
  );
}
