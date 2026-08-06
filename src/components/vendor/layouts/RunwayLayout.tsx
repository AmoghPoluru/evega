import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { ProductMedia } from "@/components/product-media";
import type { VendorLayoutProps } from "./types";
import { getDescriptionText, getMediaUrl } from "./utils";

/**
 * RunwayLayout
 * An editorial fashion lookbook: a full-bleed hero banner followed by oversized
 * alternating product tiles for a magazine-style, image-led presentation.
 *
 * Preserved as a legacy layout — Runway theme uses `preserveLegacyLayout: true`
 * in its theme manifest and always renders through this component.
 */
export function RunwayLayout({ vendor, template, products }: VendorLayoutProps) {
  const tagline = getDescriptionText(vendor.description);
  const coverUrl = getMediaUrl(vendor.coverImage) || getMediaUrl(vendor.logo);

  return (
    <div
      className="runway-layout min-h-screen"
      style={{
        ...(template.cssVariables as React.CSSProperties),
        backgroundColor: "var(--template-background, #F7F5F2)",
        color: "var(--template-text, #0A0A0A)",
        fontFamily: "var(--template-font-body)",
      }}
    >
      {/* Full-bleed hero */}
      <section className="relative h-[70vh] min-h-[440px] w-full overflow-hidden">
        {coverUrl ? (
          <Image src={coverUrl} alt={vendor.name} fill priority className="object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, var(--template-primary), var(--template-secondary))",
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1
            className="text-4xl font-bold uppercase tracking-widest text-white md:text-7xl"
            style={{ fontFamily: "var(--template-font-heading)", textShadow: "2px 2px 12px rgba(0,0,0,0.6)" }}
          >
            {vendor.name}
          </h1>
          {tagline && (
            <p className="mt-4 max-w-2xl text-base text-white/90 md:text-xl">{tagline}</p>
          )}
        </div>
      </section>

      {/* Section label */}
      <div className="mx-auto max-w-[1440px] px-6 pt-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--template-secondary)" }}>
          The Collection
        </p>
        <div className="mx-auto mt-4 h-px w-16" style={{ backgroundColor: "var(--template-accent)" }} />
      </div>

      {/* Oversized alternating tiles */}
      <main className="mx-auto max-w-[1440px] px-6 py-16">
        {products.length === 0 ? (
          <p className="py-20 text-center" style={{ color: "var(--template-text-secondary)" }}>
            This collection is coming soon.
          </p>
        ) : (
          <div className="flex flex-col gap-20">
            {products.map((product, index) => {
              const imageUrl = getMediaUrl(product.image);
              const desc = getDescriptionText(product.description);
              const reversed = index % 2 === 1;
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group grid items-center gap-8 md:grid-cols-2"
                >
                  <div
                    className={`relative overflow-hidden ${reversed ? "md:order-2" : "md:order-1"}`}
                  >
                    <ProductMedia
                      src={imageUrl}
                      alt={product.name}
                      ratio="portrait"
                      fit="contain"
                      mat="blur"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  <div className={`px-2 ${reversed ? "md:order-1 md:text-right" : "md:order-2"}`}>
                    <p
                      className="mb-3 text-xs uppercase tracking-[0.25em]"
                      style={{ color: "var(--template-secondary)" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2
                      className="text-3xl leading-tight md:text-4xl"
                      style={{ fontFamily: "var(--template-font-heading)" }}
                    >
                      {product.name}
                    </h2>
                    {desc && (
                      <p
                        className="mt-4 max-w-md text-sm leading-relaxed md:ml-auto"
                        style={{ color: "var(--template-text-secondary)" }}
                      >
                        {desc.length > 220 ? `${desc.slice(0, 220)}…` : desc}
                      </p>
                    )}
                    <p className="mt-6 text-lg font-semibold">{formatCurrency(product.price)}</p>
                    <span
                      className="mt-4 inline-block border-b-2 pb-1 text-xs uppercase tracking-[0.2em] transition-colors"
                      style={{ borderColor: "var(--template-accent)" }}
                    >
                      Shop the look
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
