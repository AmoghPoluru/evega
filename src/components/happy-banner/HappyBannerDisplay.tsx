import { HappyBannerMegaSale } from "./HappyBannerMegaSale";
import { HappyBannerSummerSale } from "./HappyBannerSummerSale";
import { HappyBannerHueEditorial } from "./HappyBannerHueEditorial";
import { HappyBannerTropicalHotSale } from "./HappyBannerTropicalHotSale";
import {
  HappyBannerNewArrivals,
  HappyBannerEthnicFestive,
  HappyBannerFlashSale,
  HappyBannerBridalEdit,
  HappyBannerLinenEdit,
  HappyBannerKurtaPrint,
  HappyBannerLuxuryBoutique,
  HappyBannerBohoChic,
  HappyBannerClearanceEoss,
  HappyBannerHandloomHeritage,
} from "./HappyBannerFashionPresets";
import type { HappyBannerPreset, ResolvedHappyBanner } from "@/lib/happy-banner/types";

type HappyBannerDisplayProps = {
  banner: ResolvedHappyBanner;
};

const presetComponents: Record<
  HappyBannerPreset,
  React.ComponentType<{ banner: ResolvedHappyBanner }>
> = {
  "mega-sale": HappyBannerMegaSale,
  "summer-sale": HappyBannerSummerSale,
  "hue-editorial": HappyBannerHueEditorial,
  "tropical-hot-sale": HappyBannerTropicalHotSale,
  "new-arrivals": HappyBannerNewArrivals,
  "ethnic-festive": HappyBannerEthnicFestive,
  "flash-sale": HappyBannerFlashSale,
  "bridal-edit": HappyBannerBridalEdit,
  "linen-edit": HappyBannerLinenEdit,
  "kurta-print": HappyBannerKurtaPrint,
  "luxury-boutique": HappyBannerLuxuryBoutique,
  "boho-chic": HappyBannerBohoChic,
  "clearance-eoss": HappyBannerClearanceEoss,
  "handloom-heritage": HappyBannerHandloomHeritage,
};

export function HappyBannerDisplay({ banner }: HappyBannerDisplayProps) {
  const Component = presetComponents[banner.preset] ?? HappyBannerMegaSale;
  return <Component banner={banner} />;
}
