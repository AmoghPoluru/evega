import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import {
  getHappyBannerWord1Scale,
  HAPPY_BANNER_WORD1_REF_LENGTH,
} from "@/lib/happy-banner/word1-scale";
import "./summer-banner.css";

type HappyBannerSummerSaleProps = {
  banner: ResolvedHappyBanner;
};

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 160" fill="none" aria-hidden>
      <path
        d="M60 8C28 38 8 78 18 122c8 34 28 30 42 18 14-12 34-8 40-28C108 88 92 42 60 8Z"
        fill="var(--hb-leaf, #3d7a45)"
      />
      <path
        d="M60 20c-18 24-28 52-22 78 4 18 16 16 24 8 8-8 18-6 22-18 6-20-6-46-24-68Z"
        fill="var(--hb-leaf-light, #5a9a52)"
        opacity="0.85"
      />
      <path
        d="M60 24 L60 130"
        stroke="var(--hb-leaf-vein, #2f5536)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

function FlowerIcon() {
  return (
    <svg className="summer-banner__flower" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="3.5" fill="#fff7c2" />
      <ellipse cx="12" cy="5.5" rx="3.2" ry="5.2" fill="#fff" />
      <ellipse cx="12" cy="18.5" rx="3.2" ry="5.2" fill="#fff" />
      <ellipse cx="5.5" cy="12" rx="5.2" ry="3.2" fill="#fff" />
      <ellipse cx="18.5" cy="12" rx="5.2" ry="3.2" fill="#fff" />
    </svg>
  );
}

export function HappyBannerSummerSale({ banner }: HappyBannerSummerSaleProps) {
  const word1 = banner.word1.trim();
  const word1Scale = getHappyBannerWord1Scale(word1);

  return (
    <section
      className="summer-banner"
      aria-label="Promotional banner"
      style={{
        ["--hb-bg" as string]: banner.theme.backgroundColor,
        ["--hb-accent" as string]: banner.theme.accentYellow,
        ["--hb-water" as string]: banner.theme.accentPink,
        ["--hb-leaf" as string]: banner.theme.accentYellow,
        ["--hb-leaf-light" as string]: "#6cab5a",
        ["--hb-leaf-vein" as string]: banner.theme.backgroundColor,
        ["--hb-word1-ch" as string]: String(Math.max(word1.length, 1)),
        ["--hb-word1-scale" as string]: String(word1Scale),
        ["--hb-word1-ref" as string]: String(HAPPY_BANNER_WORD1_REF_LENGTH),
      }}
    >
      <div className="summer-banner__inner">
        <LeafIcon className="summer-banner__leaf summer-banner__leaf--tl" />
        <LeafIcon className="summer-banner__leaf summer-banner__leaf--tr" />
        <LeafIcon className="summer-banner__leaf summer-banner__leaf--bl" />
        <LeafIcon className="summer-banner__leaf summer-banner__leaf--br" />

        <svg className="summer-banner__waves" viewBox="0 0 1200 72" preserveAspectRatio="none" aria-hidden>
          <path
            d="M0 36 C200 8 400 64 600 36 C800 8 1000 64 1200 36 L1200 72 L0 72 Z"
            fill="var(--hb-water, #7ec8e3)"
            opacity="0.95"
          />
          <path
            d="M0 48 C250 24 450 60 700 42 C900 28 1050 58 1200 46 L1200 72 L0 72 Z"
            fill="var(--hb-water, #7ec8e3)"
            opacity="0.65"
          />
        </svg>

        <div className="summer-banner__flowers" aria-hidden>
          <FlowerIcon />
          <FlowerIcon />
          <FlowerIcon />
          <FlowerIcon />
        </div>

        <div className="summer-banner__content">
          <div className="summer-banner__headline">
            <span className="summer-banner__word1">{banner.word1}</span>
            <span className="summer-banner__secondary">{banner.secondaryWord}</span>
          </div>

          <p className="summer-banner__offer">
            {banner.discountPrefix}{" "}
            <span className="summer-banner__offer-value">{banner.word2}%</span>{" "}
            {banner.discountSuffix}
          </p>
        </div>
      </div>
    </section>
  );
}
