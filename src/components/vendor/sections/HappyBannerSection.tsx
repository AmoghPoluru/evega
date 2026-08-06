"use client";

import type { SectionProps } from "./types";
import { HappyBanner } from "@/components/happy-banner/HappyBanner";

/** Dedicated Happy Banner section — uses server-resolved banner data. */
export function HappyBannerSection({ happyBanner, preview }: SectionProps) {
  if (preview || !happyBanner?.enabled) return null;
  return <HappyBanner banner={happyBanner} />;
}
