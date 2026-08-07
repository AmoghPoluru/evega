import Link from "next/link";
import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import { splitEditorialHeadline } from "@/lib/happy-banner/split-headline";
import { getHappyBannerWord1Scale } from "@/lib/happy-banner/word1-scale";
import "./hue-editorial-banner.css";

type HappyBannerHueEditorialProps = {
  banner: ResolvedHappyBanner;
};

function getWord2Scale(word2: string): number {
  const length = Math.max(word2.trim().length, 1);
  const ratio = 12 / length;
  return Math.min(1.4, Math.max(0.75, ratio));
}

export function HappyBannerHueEditorial({ banner }: HappyBannerHueEditorialProps) {
  const shopHref = banner.vendorSlug ? `/vendors/${banner.vendorSlug}#products` : "#products";
  const { line1, line2 } = splitEditorialHeadline(banner.word1);
  const word1Scale = getHappyBannerWord1Scale(banner.word1);
  const word2Scale = getWord2Scale(banner.word2);

  return (
    <section
      className="hue-banner"
      aria-label="Promotional banner"
      style={{
        ["--hb-bg" as string]: banner.theme.backgroundColor,
        ["--hb-text" as string]: banner.theme.accentYellow,
        ["--hb-word1-scale" as string]: String(word1Scale),
        ["--hb-word2-scale" as string]: String(word2Scale),
      }}
    >
      <div className="hue-banner__inner">
        <div className="hue-banner__copy">
          <div className="hue-banner__headline" aria-label={banner.word1}>
            <span className="hue-banner__headline-line">{line1}</span>
            {line2 ? <span className="hue-banner__headline-line">{line2}</span> : null}
          </div>

          <div className="hue-banner__footer">
            {banner.ctaLabel ? (
              <Link href={shopHref} className="hue-banner__cta">
                {banner.ctaLabel}
              </Link>
            ) : null}
            <p className="hue-banner__website">{banner.word2}</p>
          </div>
        </div>

        <div className="hue-banner__visual" aria-hidden>
          <div className="hue-banner__visual-shape hue-banner__visual-shape--1" />
          <div className="hue-banner__visual-shape hue-banner__visual-shape--2" />
        </div>
      </div>
    </section>
  );
}
