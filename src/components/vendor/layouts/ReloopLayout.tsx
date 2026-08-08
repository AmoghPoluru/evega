import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { VendorLayoutProps } from "./types";
import { getDescriptionText, getMediaUrl } from "./utils";
import { VendorStoreLogo } from "@/components/vendor-logo/VendorStoreLogo";
import { VendorTemplateBackgroundStyles } from "@/components/vendor/VendorTemplateBackgroundStyles";

/**
 * ReloopLayout
 * A social-resale storefront: a seller-forward profile header followed by a
 * dense, image-first square grid with minimal chrome. Structurally distinct
 * from the default marketplace layout — no hero carousel, no filter sidebar.
 */
export function ReloopLayout({ vendor, template, products, resolvedLogoTemplate }: VendorLayoutProps) {
  const bio = getDescriptionText(vendor.description);
  const logoUrl = getMediaUrl(vendor.logo);
  const totalDocs = products.length;

  return (
    <div
      className="reloop-layout min-h-screen"
      style={{
        ...(template.cssVariables as React.CSSProperties),
        color: "var(--template-text, #111111)",
        fontFamily: "var(--template-font-body)",
      }}
    >
      <VendorTemplateBackgroundStyles scopeClass="reloop-layout" template={template} />
      {/* Seller profile header */}
      <header
        className="border-b"
        style={{ borderColor: "var(--template-border)" }}
      >
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex items-start gap-5">
            <VendorStoreLogo
              vendorName={vendor.name}
              uploadUrl={logoUrl}
              templateLogo={resolvedLogoTemplate}
              size={80}
              className="rounded-full"
            />

            <div className="min-w-0 flex-1">
              <h1
                className="truncate text-2xl font-bold"
                style={{ fontFamily: "var(--template-font-heading)" }}
              >
                {vendor.name}
              </h1>
              <p className="text-sm" style={{ color: "var(--template-text-secondary)" }}>
                @{vendor.slug}
              </p>

              <div className="mt-3 flex gap-6 text-sm">
                <span>
                  <strong>{totalDocs}</strong>{" "}
                  <span style={{ color: "var(--template-text-secondary)" }}>listings</span>
                </span>
                <span>
                  <strong>100%</strong>{" "}
                  <span style={{ color: "var(--template-text-secondary)" }}>positive</span>
                </span>
              </div>

              {bio && (
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--template-text-secondary)" }}>
                  {bio}
                </p>
              )}

              <div className="mt-4 flex gap-3">
                {vendor.email && (
                  <a
                    href={`mailto:${vendor.email}`}
                    className="rounded-full px-5 py-1.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: "var(--template-secondary)" }}
                  >
                    Message
                  </a>
                )}
                {vendor.website && (
                  <a
                    href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border px-5 py-1.5 text-sm font-semibold"
                    style={{ borderColor: "var(--template-border)" }}
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dense square grid */}
      <main className="mx-auto max-w-6xl px-1 py-4">
        {products.length === 0 ? (
          <p className="py-20 text-center" style={{ color: "var(--template-text-secondary)" }}>
            No listings yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5">
            {products.map((product) => {
              const imageUrl = getMediaUrl(product.image);
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group relative block aspect-square overflow-hidden bg-gray-100"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}

                  {/* Price chip */}
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {formatCurrency(product.price)}
                  </span>

                  {/* Name on hover */}
                  <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-2 text-xs font-medium text-white transition-transform duration-200 group-hover:translate-y-0">
                    <span className="line-clamp-2">{product.name}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
