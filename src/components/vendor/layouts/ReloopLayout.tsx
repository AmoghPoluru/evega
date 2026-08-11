import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { VendorLayoutProps } from "./types";
import { getMediaUrl } from "./utils";
import { VendorTemplateBackgroundStyles } from "@/components/vendor/VendorTemplateBackgroundStyles";
import { VendorLayoutBannerRegion } from "./VendorLayoutBannerRegion";

/**
 * ReloopLayout
 * A social-resale storefront: image-first square grid with minimal chrome.
 * Banners (happy + hero) replace the legacy in-layout seller profile header.
 */
export function ReloopLayout({ vendor, template, products, happyBanner }: VendorLayoutProps) {
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

      <VendorLayoutBannerRegion vendor={vendor} template={template} happyBanner={happyBanner} />

      {/* Dense square grid */}
      <main className="mx-auto max-w-6xl px-1 py-4">
        <div className="mb-3 px-3">
          <h1
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--template-font-heading)" }}
          >
            {vendor.name}
          </h1>
          <p className="text-sm" style={{ color: "var(--template-text-secondary)" }}>
            {totalDocs} listing{totalDocs === 1 ? "" : "s"}
          </p>
        </div>

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
