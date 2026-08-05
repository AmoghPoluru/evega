import Link from "next/link";
import Image from "next/image";

import { formatCurrency } from "@/lib/utils";
import { getDescriptionText, getMediaUrl } from "@/components/vendor/layouts/utils";
import type { SectionProps } from "./types";

/**
 * ProductLookbookSection
 * Editorial alternating product tiles — the modular equivalent of Runway's
 * lookbook presentation. RunwayLayout remains the canonical legacy renderer.
 */
export function ProductLookbookSection({ settings, products }: SectionProps) {
  const sectionLabel =
    typeof settings.sectionLabel === "string" ? settings.sectionLabel : "The Collection";
  const showIndex = settings.showIndex !== false;
  const ctaLabel = typeof settings.ctaLabel === "string" ? settings.ctaLabel : "Shop the look";

  return (
    <section className="mx-auto max-w-[var(--template-container-width,1440px)] px-6 py-16">
      <div className="text-center">
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--template-secondary)" }}
        >
          {sectionLabel}
        </p>
        <div
          className="mx-auto mt-4 h-px w-16"
          style={{ backgroundColor: "var(--template-accent)" }}
        />
      </div>

      <div className="mt-16 flex flex-col gap-20">
        {products.length === 0 ? (
          <p className="py-20 text-center" style={{ color: "var(--template-text-secondary)" }}>
            This collection is coming soon.
          </p>
        ) : (
          products.map((product, index) => {
            const imageUrl = getMediaUrl(product.image ?? product.cover);
            const desc = getDescriptionText(product.description);
            const reversed = index % 2 === 1;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group grid items-center gap-8 md:grid-cols-2"
              >
                <div
                  className={`relative aspect-[4/5] overflow-hidden ${reversed ? "md:order-2" : "md:order-1"}`}
                  style={{ borderRadius: "var(--template-card-radius, 0px)" }}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className={`px-2 ${reversed ? "md:order-1 md:text-right" : "md:order-2"}`}>
                  {showIndex ? (
                    <p
                      className="mb-3 text-xs uppercase tracking-[0.25em]"
                      style={{ color: "var(--template-secondary)" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>
                  ) : null}
                  <h2
                    className="text-3xl leading-tight md:text-4xl"
                    style={{
                      fontFamily: "var(--template-font-heading)",
                      color: "var(--template-text)",
                      textTransform: "var(--template-h2-transform, none)" as React.CSSProperties["textTransform"],
                    }}
                  >
                    {product.name}
                  </h2>
                  {desc ? (
                    <p
                      className="mt-4 max-w-md text-sm leading-relaxed md:ml-auto"
                      style={{ color: "var(--template-text-secondary)" }}
                    >
                      {desc.length > 220 ? `${desc.slice(0, 220)}…` : desc}
                    </p>
                  ) : null}
                  <p
                    className="mt-6 text-lg font-semibold"
                    style={{ color: "var(--template-text)" }}
                  >
                    {formatCurrency(product.price)}
                  </p>
                  <span
                    className="mt-4 inline-block border-b-2 pb-1 text-xs uppercase tracking-[0.2em] transition-colors"
                    style={{ borderColor: "var(--template-accent)", color: "var(--template-text)" }}
                  >
                    {ctaLabel}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
