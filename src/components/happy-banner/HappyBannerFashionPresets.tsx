import Link from "next/link";
import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import { getHappyBannerWord1Scale } from "@/lib/happy-banner/word1-scale";
import "./fashion-banners.css";

type FashionBannerProps = {
  banner: ResolvedHappyBanner;
};

function bannerVars(banner: ResolvedHappyBanner): React.CSSProperties {
  return {
    ["--hb-bg" as string]: banner.theme.backgroundColor,
    ["--hb-accent" as string]: banner.theme.accentYellow,
    ["--hb-accent-2" as string]: banner.theme.accentPink,
    ["--hb-word1-scale" as string]: String(getHappyBannerWord1Scale(banner.word1)),
  };
}

function shopHref(vendorSlug: string) {
  return vendorSlug ? `/vendors/${vendorSlug}#products` : "#products";
}

function TaglineBanner({
  banner,
  className,
  decor,
}: FashionBannerProps & { className: string; decor?: React.ReactNode }) {
  const href = shopHref(banner.vendorSlug);

  return (
    <section className={`fb-banner ${className}`} aria-label="Promotional banner" style={bannerVars(banner)}>
      <div className="fb-banner__inner">
        {decor}
        <div className="fb-banner__content">
          {banner.eyebrowText ? <p className="fb-banner__eyebrow">{banner.eyebrowText}</p> : null}
          <h2 className="fb-banner__headline">
            {banner.word1}
            {banner.secondaryWord ? (
              <span className="fb-banner__secondary"> {banner.secondaryWord}</span>
            ) : null}
          </h2>
          <p className="fb-banner__tagline">{banner.word2}</p>
          {banner.ctaLabel ? (
            <Link href={href} className="fb-banner__cta">
              {banner.ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DiscountBanner({
  banner,
  className,
  decor,
}: FashionBannerProps & { className: string; decor?: React.ReactNode }) {
  const href = shopHref(banner.vendorSlug);

  return (
    <section className={`fb-banner ${className}`} aria-label="Promotional banner" style={bannerVars(banner)}>
      <div className="fb-banner__inner">
        {decor}
        <div className="fb-banner__content">
          {banner.eyebrowText ? <p className="fb-banner__eyebrow">{banner.eyebrowText}</p> : null}
          <h2 className="fb-banner__headline">
            {banner.word1}
            {banner.secondaryWord ? (
              <span className="fb-banner__secondary"> {banner.secondaryWord}</span>
            ) : null}
          </h2>
          {banner.ctaLabel ? (
            <Link href={href} className="fb-banner__cta">
              {banner.ctaLabel}
            </Link>
          ) : null}
        </div>
        <div
          className="fb-banner__badge"
          aria-label={`${banner.discountPrefix} ${banner.word2}% ${banner.discountSuffix}`}
        >
          {banner.discountPrefix ? (
            <span className="fb-banner__badge-prefix">{banner.discountPrefix}</span>
          ) : null}
          <span className="fb-banner__badge-value">
            {banner.word2}
            <span className="fb-banner__badge-percent">%</span>
          </span>
          {banner.discountSuffix ? (
            <span className="fb-banner__badge-suffix">{banner.discountSuffix}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function HappyBannerNewArrivals({ banner }: FashionBannerProps) {
  return (
    <TaglineBanner
      banner={banner}
      className="fb-new-arrivals"
      decor={
        <>
          <div className="fb-new-arrivals__orb fb-new-arrivals__orb--1" aria-hidden />
          <div className="fb-new-arrivals__orb fb-new-arrivals__orb--2" aria-hidden />
          <div className="fb-new-arrivals__arc" aria-hidden />
        </>
      }
    />
  );
}

export function HappyBannerEthnicFestive({ banner }: FashionBannerProps) {
  return (
    <TaglineBanner
      banner={banner}
      className="fb-ethnic-festive"
      decor={
        <>
          <div className="fb-ethnic-festive__frame" aria-hidden />
          <div className="fb-ethnic-festive__frame-inner" aria-hidden />
          <div className="fb-ethnic-festive__corner fb-ethnic-festive__corner--tl" aria-hidden />
          <div className="fb-ethnic-festive__corner fb-ethnic-festive__corner--tr" aria-hidden />
          <div className="fb-ethnic-festive__corner fb-ethnic-festive__corner--bl" aria-hidden />
          <div className="fb-ethnic-festive__corner fb-ethnic-festive__corner--br" aria-hidden />
        </>
      }
    />
  );
}

export function HappyBannerFlashSale({ banner }: FashionBannerProps) {
  return (
    <DiscountBanner
      banner={banner}
      className="fb-flash-sale"
      decor={<div className="fb-flash-sale__slash" aria-hidden />}
    />
  );
}

export function HappyBannerBridalEdit({ banner }: FashionBannerProps) {
  return (
    <TaglineBanner
      banner={banner}
      className="fb-bridal-edit"
      decor={
        <>
          <div className="fb-bridal-edit__ring" aria-hidden />
          {[
            [18, 22],
            [82, 18],
            [75, 72],
          ].map(([left, top]) => (
            <div
              key={`${left}-${top}`}
              className="fb-bridal-edit__sparkle"
              style={{ left: `${left}%`, top: `${top}%` }}
              aria-hidden
            />
          ))}
        </>
      }
    />
  );
}

export function HappyBannerLinenEdit({ banner }: FashionBannerProps) {
  return (
    <TaglineBanner
      banner={banner}
      className="fb-linen-edit"
      decor={
        <>
          <div className="fb-linen-edit__leaf" aria-hidden />
          <div className="fb-linen-edit__line" aria-hidden />
        </>
      }
    />
  );
}

export function HappyBannerKurtaPrint({ banner }: FashionBannerProps) {
  return <TaglineBanner banner={banner} className="fb-kurta-print" />;
}

export function HappyBannerLuxuryBoutique({ banner }: FashionBannerProps) {
  return <TaglineBanner banner={banner} className="fb-luxury-boutique" />;
}

export function HappyBannerBohoChic({ banner }: FashionBannerProps) {
  return (
    <TaglineBanner
      banner={banner}
      className="fb-boho-chic"
      decor={<div className="fb-boho-chic__arch" aria-hidden />}
    />
  );
}

export function HappyBannerClearanceEoss({ banner }: FashionBannerProps) {
  return <DiscountBanner banner={banner} className="fb-clearance-eoss" />;
}

export function HappyBannerHandloomHeritage({ banner }: FashionBannerProps) {
  return (
    <TaglineBanner
      banner={banner}
      className="fb-handloom-heritage"
      decor={
        <>
          <div className="fb-handloom-heritage__weave" aria-hidden />
          <div className="fb-handloom-heritage__weave-2" aria-hidden />
        </>
      }
    />
  );
}
