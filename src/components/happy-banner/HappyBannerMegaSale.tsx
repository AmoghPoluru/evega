import Link from "next/link";
import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import { getHappyBannerWord1Scale } from "@/lib/happy-banner/word1-scale";
import "./happy-banner.css";

type HappyBannerMegaSaleProps = {
  banner: ResolvedHappyBanner;
};

export function HappyBannerMegaSale({ banner }: HappyBannerMegaSaleProps) {
  const shopHref = banner.vendorSlug ? `/vendors/${banner.vendorSlug}#products` : "#products";
  const word1 = banner.word1.trim();
  const word1Scale = getHappyBannerWord1Scale(word1);

  return (
    <section
      className="happy-banner"
      aria-label="Promotional banner"
      style={{
        ["--hb-bg" as string]: banner.theme.backgroundColor,
        ["--hb-yellow" as string]: banner.theme.accentYellow,
        ["--hb-pink" as string]: banner.theme.accentPink,
        ["--hb-word1-scale" as string]: String(word1Scale),
      }}
    >
      <div className="happy-banner__inner">
        <div className="happy-banner__decor happy-banner__decor--dots-tl" aria-hidden />
        <div className="happy-banner__decor happy-banner__decor--dots-br" aria-hidden />
        <div className="happy-banner__decor happy-banner__decor--lines-left" aria-hidden />
        <div className="happy-banner__decor happy-banner__decor--lines-tr" aria-hidden />
        <div className="happy-banner__blob happy-banner__blob--yellow-left" aria-hidden />
        <div className="happy-banner__blob happy-banner__blob--pink-left" aria-hidden />
        <div className="happy-banner__blob happy-banner__blob--yellow-right" aria-hidden />
        <div className="happy-banner__blob happy-banner__blob--pink-right" aria-hidden />
        <div className="happy-banner__shape happy-banner__shape--circle-1" aria-hidden />
        <div className="happy-banner__shape happy-banner__shape--circle-2" aria-hidden />
        <div className="happy-banner__shape happy-banner__shape--triangle-1" aria-hidden />
        <div className="happy-banner__shape happy-banner__shape--triangle-2" aria-hidden />

        <div className="happy-banner__content">
          <p className="happy-banner__eyebrow">{banner.eyebrowText}</p>
          <h2 className="happy-banner__headline">
            <span className="happy-banner__word1">{banner.word1}</span>
            <span className="happy-banner__secondary">{banner.secondaryWord}</span>
          </h2>
          <Link href={shopHref} className="happy-banner__cta">
            {banner.ctaLabel}
          </Link>
        </div>

        <div className="happy-banner__badge" aria-label={`${banner.discountPrefix} ${banner.word2}% ${banner.discountSuffix}`}>
          <span className="happy-banner__badge-prefix">{banner.discountPrefix}</span>
          <span className="happy-banner__badge-value">
            {banner.word2}
            <span className="happy-banner__badge-percent">%</span>
          </span>
          <span className="happy-banner__badge-suffix">{banner.discountSuffix}</span>
        </div>
      </div>
    </section>
  );
}
