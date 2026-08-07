"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { VendorLayoutProps } from "./types";
import { getCategoryName, getMediaUrl, getPseudoRating } from "./utils";
import { VendorStoreLogo } from "@/components/vendor-logo/VendorStoreLogo";

/**
 * EmporiumLayout
 * A dense catalog storefront: a persistent top search bar, a left category /
 * filter rail and a rating-heavy product grid. Search and category filtering
 * run client-side over the vendor's products.
 */
export function EmporiumLayout({ vendor, template, products, resolvedLogoTemplate }: VendorLayoutProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);

  const logoUrl = getMediaUrl(vendor.logo);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const name = getCategoryName(p.category);
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name?.toLowerCase().includes(q)) return false;
      if (activeCategory && getCategoryName(p.category) !== activeCategory) return false;
      if (minRating > 0) {
        const { rating } = getPseudoRating(p.id);
        if (rating < minRating) return false;
      }
      return true;
    });
  }, [products, query, activeCategory, minRating]);

  return (
    <div
      className="emporium-layout min-h-screen"
      style={{
        ...(template.cssVariables as React.CSSProperties),
        backgroundColor: "var(--template-background, #EAEDED)",
        color: "var(--template-text, #0F1111)",
        fontFamily: "var(--template-font-body)",
      }}
    >
      {/* Top bar with search */}
      <header
        className="sticky top-0 z-30"
        style={{ backgroundColor: "var(--template-primary, #131921)" }}
      >
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <VendorStoreLogo
              vendorName={vendor.name}
              uploadUrl={logoUrl}
              templateLogo={resolvedLogoTemplate}
              size={36}
            />
            <span
              className="hidden text-lg font-bold text-white sm:block"
              style={{ fontFamily: "var(--template-font-heading)" }}
            >
              {vendor.name}
            </span>
          </div>

          <div className="flex flex-1 items-stretch overflow-hidden rounded">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${vendor.name}`}
              className="min-w-0 flex-1 px-3 py-2 text-sm text-gray-900 outline-none"
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
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <div
            className="rounded-md border bg-white p-4"
            style={{ borderColor: "var(--template-border)" }}
          >
            <h2 className="mb-2 text-sm font-bold">Departments</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={`text-left hover:underline ${activeCategory === null ? "font-bold" : ""}`}
                  style={{ color: activeCategory === null ? "var(--template-text)" : "var(--template-text-secondary)" }}
                >
                  All departments
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`text-left hover:underline ${activeCategory === cat ? "font-bold" : ""}`}
                    style={{ color: activeCategory === cat ? "var(--template-text)" : "var(--template-text-secondary)" }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
              {categories.length === 0 && (
                <li style={{ color: "var(--template-text-secondary)" }}>No categories</li>
              )}
            </ul>

            <h2 className="mb-2 mt-5 text-sm font-bold">Customer reviews</h2>
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

        {/* Product grid */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-baseline justify-between border-b pb-2" style={{ borderColor: "var(--template-border)" }}>
            <h1 className="text-xl font-bold" style={{ fontFamily: "var(--template-font-heading)" }}>
              {activeCategory ?? "All products"}
            </h1>
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
                    className="flex flex-col rounded-md border bg-white p-3 transition-shadow hover:shadow-md"
                    style={{ borderColor: "var(--template-border)" }}
                  >
                    <div className="relative mb-3 aspect-square">
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
