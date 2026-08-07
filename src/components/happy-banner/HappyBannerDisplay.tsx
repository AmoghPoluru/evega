import { HappyBannerMegaSale } from "./HappyBannerMegaSale";
import { HappyBannerSummerSale } from "./HappyBannerSummerSale";
import { HappyBannerHueEditorial } from "./HappyBannerHueEditorial";
import { HappyBannerTropicalHotSale } from "./HappyBannerTropicalHotSale";
import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";

type HappyBannerDisplayProps = {
  banner: ResolvedHappyBanner;
};

export function HappyBannerDisplay({ banner }: HappyBannerDisplayProps) {
  if (banner.preset === "summer-sale") {
    return <HappyBannerSummerSale banner={banner} />;
  }

  if (banner.preset === "hue-editorial") {
    return <HappyBannerHueEditorial banner={banner} />;
  }

  if (banner.preset === "tropical-hot-sale") {
    return <HappyBannerTropicalHotSale banner={banner} />;
  }

  return <HappyBannerMegaSale banner={banner} />;
}
