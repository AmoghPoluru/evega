"use client";

import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import { HappyBanner } from "@/components/happy-banner/HappyBanner";

export function HappyBannerPreview({ banner }: { banner: ResolvedHappyBanner }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <HappyBanner banner={banner} />
    </div>
  );
}
