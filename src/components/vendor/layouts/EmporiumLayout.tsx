"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { VendorLayoutProps } from "./types";
import { getMediaUrl, getPseudoRating } from "./utils";
import { VendorTemplateBackgroundStyles } from "@/components/vendor/VendorTemplateBackgroundStyles";
import { VendorLayoutBannerRegion } from "./VendorLayoutBannerRegion";

/**
 * EmporiumLayout
 * A dense catalog storefront: search bar, rating filter, and product grid.
 * Banners (happy + hero) replace the legacy sticky vendor header bar.
 */
export function EmporiumLayout({ vendor, template, products, happyBanner }: VendorLayoutProps) {
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name?.toLowerCase().includes(q)) return false;
      if (minRating > 0) {
        const { rating } = getPseudoRating(p.id);
        if (rating < minRating) return false;
      }
      return true;
    });
  }, [products, query, minRating]);

  return (
    <div
      className="emporium-layout min-h-screen"
      style={{
        ...(template.cssVariables as React.CSSProperties),
        color: "var(--template-text, #0F1111)",
        fontFamily: "var(--template-font-body)",
      }}
    >
      <VendorTemplateBackgroundStyles scopeClass="emporium-layout" template={template} />

      <VendorLayoutBannerRegion vendor={vendor} template={template} happyBanner={happyBanner} />

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6">
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <div
            className="rounded-md border bg-white p-4"
            style={{ borderColor: "var(--template-border)" }}
          >
            <h2 className="mb-2 text-sm font-bold">Customer reviews</h2>
            <ul className="space-y-1 text-sm">
              {[4, 3, 0].map((r) => (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() => setMinRating(r)}
                    className={`flex items-center gap-1 hover:underline ${minRating === r ? "font-bold" : ""}`}
                  >
                    {r > 0 ? (
                      <>
                        <StarRow value={r} />
                        <span style={{ color: "var(--template-text-secondary)" }}>&amp; up</span>
                      </>
                    ) : (
                      <span style={{ color: "var(--template-text-secondary)" }}>All ratings</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--template-border)" }}>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "var(--template-font-heading)" }}>
                {vendor.name}
              </h1>
              <p className="text-sm" style={{ color: "var(--template-text-secondary)" }}>
                All products
              </p>
            </div>
            <div className="flex w-full max-w-md items-stretch overflow-hidden rounded sm:w-auto sm:min-w-[280px]">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${vendor.name}`}
                className="min-w-0 flex-1 border px-3 py-2 text-sm text-gray-900 outline-none"
                style={{ borderColor: "var(--template-border)" }}
              />
              <button
                type="button"
                className="flex items-center justify-center px-4"
                style={{ backgroundColor: "var(--template-accent, #F0A020)" }}
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-gray-900" />
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-sm" style={{ color: "var(--template-text-secondary)" }}>
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center" style={{ color: "var(--template-text-secondary)" }}>
              No products match your search.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => {
                const imageUrl = getMediaUrl(product.image);
                const { rating, count } = getPseudoRating(product.id);
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    data-template-product-card
                    className="flex flex-col rounded-md border bg-white p-3 transition-shadow hover:shadow-md overflow-hidden"
                    style={{ borderColor: "var(--template-border)" }}
                  >
                    <div data-template-product-card-media className="relative mb-3 aspect-square">
                      <Image
                        src={imageUrl || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className="mb-1 line-clamp-2 text-sm leading-snug">{product.name}</h3>
                    <div className="mb-1 flex items-center gap-1">
                      <StarRow value={rating} />
                      <span className="text-xs" style={{ color: "var(--template-secondary)" }}>
                        {count.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-auto">
                      <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                    </div>
                    <span className="mt-1 text-xs font-medium" style={{ color: "#007600" }}>
                      In Stock
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <span className="flex items-center" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        return (
          <Star
            key={i}
            className="h-3.5 w-3.5"
            style={{
              color: "var(--template-accent, #F0A020)",
              fill: filled ? "var(--template-accent, #F0A020)" : "transparent",
            }}
          />
        );
      })}
    </span>
  );
}
