import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ProductsList } from "@/components/product-filters/products-list";
import { VendorHeroBannersSection } from "@/components/vendor-hero-banners-section";
import { HappyBannerDisplay } from "@/components/happy-banner/HappyBannerDisplay";
import { cssVariablesToString } from "@/lib/templates/css-variables";
import { VendorTemplateBackgroundStyles } from "@/components/vendor/VendorTemplateBackgroundStyles";
import type { VendorLayoutProps } from "./types";
import { isLayoutBannerEnabled } from "./utils";

/**
 * DefaultLayout
 * Reproduces the original hardcoded vendor storefront: an animated mesh-gradient
 * background, a hero banner carousel and a filterable product grid.
 */
export function DefaultLayout({ vendor, template, products, happyBanner }: VendorLayoutProps) {
  const cssVariables = cssVariablesToString(template.cssVariables);

  const fallbackBannerTitle = vendor.name;
  const fallbackBackgroundImageUrl =
    vendor.coverImage && typeof vendor.coverImage === "object" && vendor.coverImage.url
      ? vendor.coverImage.url
      : null;

  const totalDocs = products.length;
  const showHeroBanner = isLayoutBannerEnabled(template);

  return (
    <div
      className="flex flex-col min-h-screen vendor-page-template"
      style={{
        ...(template.cssVariables as React.CSSProperties),
      }}
    >
      <VendorTemplateBackgroundStyles scopeClass="vendor-page-template" template={template} />
      <style>{`
        ${cssVariables ? `:root {
          ${cssVariables}
        }` : ''}

        /* Force the container to be transparent so the background shows through */
        .vendor-main-container {
          background: transparent !important;
        }

        /* Make cards look modern and "Glassy" against the vibrant back */
        .vendor-page-template [class*="card"],
        .vendor-page-template .vendor-glass-panel,
        .vendor-page-template a[href*="/products/"] > div {
          background-color: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15) !important;
          border-radius: var(--template-card-radius, 8px) !important;
        }

        /* Override ProductsList wrapper background */
        .vendor-page-template .bg-gray-50 {
          background: transparent !important;
        }

        .vendor-page-template h1, 
        .vendor-page-template .breadcrumb-text {
          text-shadow: 0px 2px 4px rgba(0,0,0,0.1);
        }

        /* Style buttons to be extra punchy */
        .vendor-page-template button[class*="bg-"] {
          background-color: var(--template-primary) !important;
          filter: saturate(1.5);
          transition: transform 0.2s ease;
        }
        
        .vendor-page-template button[class*="bg-"]:hover {
          transform: scale(1.05);
        }

        /* Apply template styles to all elements on vendor page */
        .vendor-page-template * {
          font-family: var(--template-font-body) !important;
        }
        .vendor-page-template h1 {
          font-family: var(--template-font-heading) !important;
          color: var(--template-text) !important;
          font-size: var(--template-h1-size, 2.5rem) !important;
          font-weight: var(--template-h1-weight, 700) !important;
          letter-spacing: var(--template-h1-spacing, 0) !important;
          line-height: var(--template-h1-height, 1.2) !important;
          text-transform: var(--template-h1-transform, none) !important;
        }
        .vendor-page-template h2:not([class*="happy-banner__"]):not([class*="summer-banner__"]):not([class*="hue-banner__"]):not([class*="tropical-banner__"]) {
          font-family: var(--template-font-heading) !important;
          color: var(--template-text) !important;
          font-size: var(--template-h2-size, 2rem) !important;
          font-weight: var(--template-h2-weight, 600) !important;
          letter-spacing: var(--template-h2-spacing, 0) !important;
          line-height: var(--template-h2-height, 1.3) !important;
          text-transform: var(--template-h2-transform, none) !important;
        }
        .vendor-page-template h3,
        .vendor-page-template h4,
        .vendor-page-template h5,
        .vendor-page-template h6 {
          font-family: var(--template-font-heading) !important;
          color: var(--template-text) !important;
        }
        .vendor-page-template p:not([class*="happy-banner__"]):not([class*="summer-banner__"]):not([class*="hue-banner__"]):not([class*="tropical-banner__"]),
        .vendor-page-template span:not([class*="happy-banner__"]):not([class*="summer-banner__"]):not([class*="hue-banner__"]):not([class*="tropical-banner__"]),
        .vendor-page-template div:not([class*="happy-banner__"]):not([class*="summer-banner__"]):not([class*="hue-banner__"]):not([class*="tropical-banner__"]) {
          font-size: var(--template-body-size, 1rem) !important;
          font-weight: var(--template-body-weight, 400) !important;
          letter-spacing: var(--template-body-spacing, 0) !important;
          line-height: var(--template-body-height, 1.6) !important;
        }

        /* Happy Banner promos control their own typography */
        .vendor-page-template .happy-banner,
        .vendor-page-template .summer-banner,
        .vendor-page-template .hue-banner,
        .vendor-page-template .tropical-banner {
          font-size: initial;
        }
        .vendor-page-template .happy-banner *,
        .vendor-page-template .summer-banner *,
        .vendor-page-template .hue-banner *,
        .vendor-page-template .tropical-banner * {
          font-family: inherit;
          letter-spacing: inherit;
          line-height: inherit;
          text-transform: inherit;
        }

        /* Override for hero banner text - must be white and visible */
        .vendor-page-template [class*="hero"] h1,
        .vendor-page-template [class*="banner"] h1 {
          color: white !important;
          font-size: var(--template-hero-title-size, 3rem) !important;
          font-weight: var(--template-hero-title-weight, 700) !important;
          text-shadow: var(--template-hero-text-shadow, 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5)) !important;
        }
        .vendor-page-template [class*="hero"] h2,
        .vendor-page-template [class*="hero"] p,
        .vendor-page-template [class*="banner"] h2:not([class*="happy-banner__"]):not([class*="summer-banner__"]):not([class*="hue-banner__"]):not([class*="tropical-banner__"]),
        .vendor-page-template [class*="banner"] p:not([class*="happy-banner__"]):not([class*="summer-banner__"]):not([class*="hue-banner__"]):not([class*="tropical-banner__"]),
        .vendor-page-template [class*="text-white"] {
          color: white !important;
          font-size: var(--template-hero-subtitle-size, 1.5rem) !important;
          font-weight: var(--template-hero-subtitle-weight, 400) !important;
          text-shadow: var(--template-hero-text-shadow, 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5)) !important;
        }
        .vendor-page-template a {
          color: var(--template-primary) !important;
        }
        .vendor-page-template a:hover {
          color: var(--template-secondary) !important;
        }
            .vendor-page-template [class*="text-gray"] {
              color: var(--template-text-secondary) !important;
            }

            /* Hero Banner Text - Ensure white text is visible */
            .vendor-page-template [class*="hero"] h1,
            .vendor-page-template [class*="hero"] h2,
            .vendor-page-template [class*="hero"] p,
            .vendor-page-template [class*="banner"] h1,
            .vendor-page-template [class*="banner"] h2:not([class*="happy-banner__"]):not([class*="summer-banner__"]),
            .vendor-page-template [class*="banner"] p:not([class*="happy-banner__"]):not([class*="summer-banner__"]),
            .vendor-page-template [class*="text-white"] {
              color: white !important;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5) !important;
            }
      `}</style>
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-2 vendor-main-container">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-2 flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="hover:underline"
              style={{ color: "var(--template-primary)" }}
            >
              Home
            </Link>
            <span style={{ color: "var(--template-text-secondary)" }}>/</span>
            <span style={{ color: "var(--template-text-secondary)" }}>Vendors</span>
            <span style={{ color: "var(--template-text-secondary)" }}>/</span>
            <span style={{ color: "var(--template-text)" }}>{vendor.name}</span>
          </nav>
        </div>
      </div>

      {happyBanner ? <HappyBannerDisplay banner={happyBanner} /> : null}

      {showHeroBanner && !happyBanner ? (
      <Suspense
        fallback={
          <div className="relative w-full overflow-hidden">
            {fallbackBackgroundImageUrl ? (
              <div data-template-hero-banner className="relative w-full">
                <Image
                  src={fallbackBackgroundImageUrl}
                  alt={fallbackBannerTitle}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              </div>
            ) : (
              <div
                data-template-hero-banner
                className="w-full"
                style={{
                  background: `linear-gradient(to right, var(--template-primary), var(--template-secondary))`,
                }}
              />
            )}
          </div>
        }
      >
        <VendorHeroBannersSection vendorSlug={vendor.slug} />
      </Suspense>
      ) : null}

      {/* Products Section */}
      <div
        id="products"
        className="container mx-auto px-4 py-8 vendor-main-container"
        style={{
          maxWidth: "var(--template-container-width)",
          padding: "var(--template-spacing-section)",
        }}
      >
        <div className="mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-12 rounded-lg vendor-glass-panel">
              <p className="text-lg" style={{ color: "var(--template-text-secondary)" }}>
                This vendor has no products available yet.
              </p>
            </div>
          ) : (
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  color: "var(--template-text)",
                  fontFamily: "var(--template-font-heading)",
                }}
              >
                Products ({totalDocs})
              </h2>
              <ProductsList products={products as any} title="" showFilters={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
