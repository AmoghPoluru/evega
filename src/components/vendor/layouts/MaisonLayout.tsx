"use client";

import Link from "next/link";
import Image from "next/image";
import { Libre_Baskerville, DM_Sans } from "next/font/google";
import { formatCurrency } from "@/lib/utils";
import type { VendorLayoutProps } from "./types";
import { getMediaUrl } from "./utils";
import { HappyBannerDisplay } from "@/components/happy-banner/HappyBannerDisplay";
import { VendorStoreLogo } from "@/components/vendor-logo/VendorStoreLogo";
import { isWordmarkLogoPreset } from "@/lib/vendor-logo/types";

const headingFont = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/**
 * MaisonLayout — Magnolia-Boutique–inspired elegant women's boutique storefront.
 * Promo strip (Happy Banner) + centered text wordmark + trending product grid.
 * Does not copy Magnolia assets or branding; structure and tone only.
 */
export function MaisonLayout({
  vendor,
  template,
  products,
  happyBanner,
  resolvedLogoTemplate,
}: VendorLayoutProps) {
  const sectionTitle =
    (template.templateConfig as { sections?: { collectionTitle?: string } })?.sections
      ?.collectionTitle ?? "Currently Trending";
  const sectionEyebrow =
    (template.templateConfig as { sections?: { collectionEyebrow?: string } })?.sections
      ?.collectionEyebrow ?? "Shop the edit";

  const uploadLogoUrl = getMediaUrl(vendor.logo);
  const showMark = Boolean(resolvedLogoTemplate || uploadLogoUrl);
  const isWordmark = isWordmarkLogoPreset(resolvedLogoTemplate?.preset);

  return (
    <div
      className={`maison-layout min-h-screen ${bodyFont.className}`}
      style={{
        ...(template.cssVariables as React.CSSProperties),
        backgroundColor: "var(--template-background, #FFFFFF)",
        color: "var(--template-text, #1A1A1A)",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {happyBanner ? <HappyBannerDisplay banner={happyBanner} /> : null}

      {/* Text-style brand wordmark header */}
      <header className="border-b px-6 py-10 text-center" style={{ borderColor: "var(--template-border, #E8E4DE)" }}>
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4">
          {showMark ? (
            <VendorStoreLogo
              vendorName={vendor.name}
              uploadUrl={uploadLogoUrl}
              templateLogo={resolvedLogoTemplate}
              size={isWordmark ? 96 : 64}
              className="rounded-none border-0 shadow-none bg-transparent"
            />
          ) : null}
          {/* Wordmark logos already include the brand name — avoid duplicating the H1 */}
          {!isWordmark ? (
            <Link href={`/vendors/${vendor.slug}`} className="group inline-block">
              <h1
                className={`${headingFont.className} text-[1.75rem] tracking-[0.08em] sm:text-[2.25rem]`}
                style={{
                  color: "var(--template-text)",
                  fontWeight: 400,
                }}
              >
                {vendor.name}
              </h1>
              <p
                className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.28em]"
                style={{ color: "var(--template-secondary, #6B6560)" }}
              >
                Welcome to our store
              </p>
            </Link>
          ) : (
            <Link href={`/vendors/${vendor.slug}`} className="group inline-block">
              <p
                className="text-[0.7rem] font-medium uppercase tracking-[0.28em]"
                style={{ color: "var(--template-secondary, #6B6560)" }}
              >
                Welcome to our store
              </p>
            </Link>
          )}
        </div>
      </header>

      {/* Trending products */}
      <section className="mx-auto max-w-[1200px] px-4 pb-16 pt-12 sm:px-6">
        <div className="mb-10 text-center">
          <p
            className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.22em]"
            style={{ color: "var(--template-secondary, #6B6560)" }}
          >
            {sectionEyebrow}
          </p>
          <h2
            className={`${headingFont.className} text-2xl tracking-[0.04em] sm:text-3xl`}
            style={{ color: "var(--template-text)", fontWeight: 400 }}
          >
            {sectionTitle}
          </h2>
        </div>

        {products.length === 0 ? (
          <p className="py-20 text-center" style={{ color: "var(--template-text-secondary)" }}>
            New arrivals are coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {products.map((product) => {
              const imageUrl = getMediaUrl(product.image);
              return (
                <article key={product.id} className="group flex flex-col">
                  <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
                    <div
                      className="relative mb-4 overflow-hidden bg-[#F5F3F0]"
                      style={{ aspectRatio: "var(--template-image-aspect, 3 / 4)" }}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <h3
                      className={`${headingFont.className} mb-1 text-[0.95rem] leading-snug tracking-[0.02em]`}
                      style={{ color: "var(--template-text)", fontWeight: 400 }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="text-[0.85rem] font-medium tracking-wide"
                      style={{ color: "var(--template-text-secondary, #555)" }}
                    >
                      {formatCurrency(product.price)}
                    </p>
                    <span
                      className="mt-3 inline-block text-[0.65rem] font-semibold uppercase tracking-[0.18em] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      style={{ color: "var(--template-primary, #1A1A1A)" }}
                    >
                      Quick view
                    </span>
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        {products.length > 0 ? (
          <div className="mt-12 text-center">
            <Link
              href={`/vendors/${vendor.slug}`}
              className="inline-block border px-8 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-[var(--template-primary)] hover:text-white"
              style={{
                borderColor: "var(--template-primary, #1A1A1A)",
                color: "var(--template-primary, #1A1A1A)",
              }}
            >
              View all
            </Link>
          </div>
        ) : null}
      </section>

      {/* Trust strip — inspired by boutique shipping info, generic copy */}
      <section
        className="border-t px-6 py-12"
        style={{
          borderColor: "var(--template-border, #E8E4DE)",
          backgroundColor: "var(--template-card-bg, #FAF9F7)",
        }}
      >
        <div className="mx-auto grid max-w-[1000px] gap-8 text-center sm:grid-cols-3">
          {[
            { title: "Thoughtful packaging", body: "Every order is packed with care." },
            { title: "Easy returns", body: "Hassle-free returns on eligible items." },
            { title: "Support", body: "Questions? Reach out anytime." },
          ].map((item) => (
            <div key={item.title}>
              <h3
                className={`${headingFont.className} mb-2 text-base tracking-[0.04em]`}
                style={{ color: "var(--template-text)", fontWeight: 400 }}
              >
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--template-secondary)" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer
        className="border-t py-8 text-center text-xs tracking-[0.12em]"
        style={{
          borderColor: "var(--template-border)",
          color: "var(--template-secondary)",
        }}
      >
        {vendor.name}
      </footer>
    </div>
  );
}
