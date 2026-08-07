"use client";

import Link from "next/link";
import Image from "next/image";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { formatCurrency } from "@/lib/utils";
import type { VendorLayoutProps } from "./types";
import { getMediaUrl } from "./utils";
import { HappyBannerDisplay } from "@/components/happy-banner/HappyBannerDisplay";

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const bodyFont = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

/** Deterministic swatch color from product id (display-only). */
function getSwatchColor(productId: string): string {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) & 0xffffffff;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 18% 72%)`;
}

function getVariantColor(product: { variants?: Array<{ variantData?: Record<string, unknown> }> | null }): string | null {
  const variants = product.variants;
  if (!Array.isArray(variants)) return null;
  for (const variant of variants) {
    const color = variant.variantData?.color;
    if (typeof color === "string" && color.trim()) {
      if (color.startsWith("#") || color.startsWith("rgb")) return color;
    }
  }
  return null;
}

/**
 * CollectionLayout
 * Editorial 4-column product grid with bordered tiles, centered product info,
 * and quick-add affordance — "The Collection" luxury catalog style.
 */
export function CollectionLayout({ vendor, template, products, happyBanner }: VendorLayoutProps) {
  const sectionTitle =
    (template.templateConfig as { sections?: { collectionTitle?: string } })?.sections
      ?.collectionTitle ?? "All pieces";
  const sectionEyebrow =
    (template.templateConfig as { sections?: { collectionEyebrow?: string } })?.sections
      ?.collectionEyebrow ?? "The Collection";

  return (
    <div
      className={`collection-layout min-h-screen ${bodyFont.className}`}
      style={{
        ...(template.cssVariables as React.CSSProperties),
        backgroundColor: "var(--template-background, #FBFAF8)",
        color: "var(--template-text, #1A1A1A)",
        fontSize: "var(--template-type-base, 1.063rem)",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {happyBanner ? <HappyBannerDisplay banner={happyBanner} /> : null}

      <div
        className="mx-auto flex items-baseline justify-between border-b px-6 pb-8 pt-16"
        style={{
          maxWidth: "var(--template-container-width, 1240px)",
          borderColor: "var(--template-border)",
          borderWidth: "0 0 var(--template-border-width, 1px) 0",
        }}
      >
        <h1
          className={`${headingFont.className} leading-[1.15] tracking-[-0.02em]`}
          style={{
            fontSize: "var(--template-h1-size, 2.517rem)",
            fontWeight: "var(--template-h1-weight, 500)",
            color: "var(--template-text)",
          }}
        >
          {sectionTitle}
        </h1>
        <span
          className="text-[0.8rem] font-normal uppercase tracking-[0.12em]"
          style={{ color: "var(--template-secondary)" }}
        >
          {sectionEyebrow}
        </span>
      </div>

      <main
        className="mx-auto grid grid-cols-2 md:grid-cols-4"
        style={{ maxWidth: "var(--template-container-width, 1240px)" }}
      >
        {products.length === 0 ? (
          <p
            className="col-span-full px-6 py-20 text-center"
            style={{ color: "var(--template-text-secondary)" }}
          >
            This collection is coming soon.
          </p>
        ) : (
          products.map((product) => {
            const imageUrl = getMediaUrl(product.image);
            const swatch = getVariantColor(product) ?? getSwatchColor(product.id);

            return (
              <article
                key={product.id}
                className="group relative flex flex-col bg-[var(--template-card-bg,#fff)] border-b border-r border-[var(--template-border)] md:[&:nth-child(4n)]:border-r-0 max-md:[&:nth-child(2n)]:border-r-0"
                style={{
                  borderWidth: "0 var(--template-border-width, 1px) var(--template-border-width, 1px) 0",
                }}
              >
                <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
                  <div
                    className="relative overflow-hidden bg-[#F1EFEA]"
                    style={{ aspectRatio: "var(--template-image-aspect, 4 / 5)" }}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}

                    <span
                      className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center border bg-[var(--template-card-bg)] text-base transition-colors duration-200 group-hover:bg-[var(--template-primary)] group-hover:text-[var(--template-card-bg)] pointer-events-none"
                      style={{
                        borderColor: "var(--template-primary)",
                        color: "var(--template-primary)",
                        borderWidth: "var(--template-border-width, 1px)",
                      }}
                      aria-hidden
                    >
                      +
                    </span>
                  </div>

                  <div className="px-1 pb-7 pt-5 text-center">
                    <div
                      className="mb-1.5 text-[0.86rem] tracking-[0.02em]"
                      style={{ color: "var(--template-text-secondary)" }}
                    >
                      {product.name}
                    </div>
                    <div
                      className="mb-3 text-[0.86rem]"
                      style={{ color: "var(--template-secondary)" }}
                    >
                      {formatCurrency(product.price)}
                    </div>
                    <span
                      className="inline-block h-3 w-[18px] border border-black/10"
                      style={{ backgroundColor: swatch }}
                      aria-hidden
                    />
                  </div>
                </Link>
              </article>
            );
          })
        )}
      </main>

      <footer className="py-12 text-center text-xs" style={{ color: "var(--template-secondary)" }}>
        {vendor.name}
      </footer>
    </div>
  );
}
