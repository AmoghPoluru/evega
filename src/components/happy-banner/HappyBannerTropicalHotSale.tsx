import Link from "next/link";
import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import { getHappyBannerWord1Scale } from "@/lib/happy-banner/word1-scale";
import "./tropical-hot-sale.css";

type HappyBannerTropicalHotSaleProps = {
  banner: ResolvedHappyBanner;
};

function TropicalFoliage() {
  return (
    <svg className="tropical-banner__foliage" viewBox="0 0 1200 130" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 130 L0 80 Q120 40 240 70 T480 55 T720 75 T960 50 T1200 70 L1200 130 Z"
        fill="#2d7a45"
      />
      <path
        d="M0 130 L0 95 Q200 60 400 85 T800 70 T1200 90 L1200 130 Z"
        fill="#3d9a52"
        opacity="0.9"
      />
      <ellipse cx="180" cy="55" rx="70" ry="35" fill="#1f6b38" opacity="0.85" />
      <ellipse cx="420" cy="48" rx="85" ry="38" fill="#256f3c" opacity="0.9" />
      <ellipse cx="780" cy="52" rx="90" ry="40" fill="#2d7a45" />
      <ellipse cx="1020" cy="58" rx="75" ry="34" fill="#1f6b38" opacity="0.88" />
    </svg>
  );
}

function HibiscusIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="5" fill={fill} opacity="0.9" />
      <ellipse cx="16" cy="7" rx="6" ry="9" fill={fill} />
      <ellipse cx="16" cy="25" rx="6" ry="9" fill={fill} />
      <ellipse cx="7" cy="16" rx="9" ry="6" fill={fill} />
      <ellipse cx="25" cy="16" rx="9" ry="6" fill={fill} />
    </svg>
  );
}

export function HappyBannerTropicalHotSale({ banner }: HappyBannerTropicalHotSaleProps) {
  const shopHref = banner.vendorSlug ? `/vendors/${banner.vendorSlug}#products` : "#products";
  const word1Scale = getHappyBannerWord1Scale(banner.word1);

  return (
    <section
      className="tropical-banner"
      aria-label="Promotional banner"
      style={{
        ["--hb-bg" as string]: banner.theme.backgroundColor,
        ["--hb-green" as string]: banner.theme.accentYellow,
        ["--hb-red" as string]: banner.theme.accentPink,
        ["--hb-word1-scale" as string]: String(word1Scale),
      }}
    >
      <div className="tropical-banner__inner">
        <div className="tropical-banner__top-row">
          {banner.eyebrowText ? (
            <span className="tropical-banner__tag">{banner.eyebrowText}</span>
          ) : (
            <span />
          )}
          {banner.secondaryWord ? (
            <span className="tropical-banner__hot" aria-hidden>
              {banner.secondaryWord}
            </span>
          ) : null}
          <span className="tropical-banner__tag">LIMITED QUANTITIES</span>
        </div>

        <div className="tropical-banner__main">
          <div className="tropical-banner__copy">
            <p className="tropical-banner__word1">{banner.word1}</p>
            {banner.ctaLabel ? (
              <Link href={shopHref} className="tropical-banner__cta">
                {banner.ctaLabel}
              </Link>
            ) : null}
          </div>

          <div
            className="tropical-banner__badge"
            aria-label={`${banner.discountPrefix} ${banner.word2}% ${banner.discountSuffix}`}
          >
            <div className="tropical-banner__badge-blob" aria-hidden />
            <div className="tropical-banner__badge-text">
              {banner.discountPrefix ? (
                <span className="tropical-banner__badge-prefix">{banner.discountPrefix}</span>
              ) : null}
              <span className="tropical-banner__badge-value">{banner.word2}%</span>
              {banner.discountSuffix ? (
                <span className="tropical-banner__badge-suffix">{banner.discountSuffix}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="tropical-banner__flower tropical-banner__flower--left" aria-hidden>
          <HibiscusIcon fill="#ffffff" />
        </div>
        <div className="tropical-banner__flower tropical-banner__flower--center" aria-hidden>
          <HibiscusIcon fill="#e31c23" />
        </div>
        <div className="tropical-banner__flower tropical-banner__flower--right" aria-hidden>
          <HibiscusIcon fill="#f5c518" />
        </div>

        <TropicalFoliage />
      </div>
    </section>
  );
}
