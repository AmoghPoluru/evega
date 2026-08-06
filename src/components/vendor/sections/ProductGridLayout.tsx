"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ProductMedia } from "@/components/product-media";
import { getMediaUrl } from "@/components/vendor/layouts/utils";
import type { EcommerceGridLayout } from "@/lib/templates/product-grid-layouts";
import { gridLayoutMediaRatio } from "@/lib/templates/product-grid-layouts";
import { cn } from "@/lib/utils";

export interface GridProduct {
  id: string;
  name: string;
  price: number;
  image?: unknown;
  cover?: unknown;
  description?: unknown;
}

interface ProductGridLayoutProps {
  products: GridProduct[];
  layout: EcommerceGridLayout;
  preview?: boolean;
}

function getImageUrl(product: GridProduct): string | null {
  return getMediaUrl(product.image ?? product.cover);
}

function ProductPrice({ price, compact = false }: { price: number; compact?: boolean }) {
  return (
    <span
      className={cn(
        "template-type-price inline-block rounded-md font-bold",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs sm:text-sm",
      )}
    >
      {formatCurrency(price)}
    </span>
  );
}

function GridProductCard({
  product,
  compact = false,
  featured = false,
  listMode = false,
  mediaRatio = "portrait" as "portrait" | "square" | "wide",
}: {
  product: GridProduct;
  compact?: boolean;
  featured?: boolean;
  listMode?: boolean;
  mediaRatio?: "portrait" | "square" | "wide";
}) {
  const imageUrl = getImageUrl(product);
  const href = `/products/${product.id}`;

  if (listMode) {
    return (
      <Link
        href={href}
        className="flex gap-4 overflow-hidden rounded-lg border p-3 transition-shadow hover:shadow-md"
        style={{
          backgroundColor: "var(--template-card-bg)",
          borderColor: "var(--template-border)",
        }}
      >
      <ProductMedia
        src={imageUrl}
        alt={product.name}
        ratio="square"
        fit="cover"
        mat="blur"
        sizes="80px"
        className="h-20 w-20 shrink-0 rounded-md"
      />
        <div className="min-w-0 flex-1">
          <p
            className="template-type-product truncate font-medium"
          >
            {product.name}
          </p>
          <ProductPrice price={product.price} compact />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden border transition-shadow hover:shadow-md",
        featured ? "rounded-xl" : "rounded-lg",
      )}
      style={{
        backgroundColor: "var(--template-card-bg)",
        borderColor: "var(--template-border)",
        borderRadius: featured ? "12px" : "var(--template-card-radius, 8px)",
      }}
    >
      <ProductMedia
        src={imageUrl}
        alt={product.name}
        ratio={mediaRatio}
        fit="contain"
        mat="blur"
        sizes={compact ? "(max-width: 768px) 50vw, 20vw" : "(max-width: 768px) 50vw, 25vw"}
        className={cn(compact && "max-h-24")}
      >
        {featured ? (
          <span
            className="absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: "var(--template-accent)", color: "var(--template-text)" }}
          >
            Featured
          </span>
        ) : null}
      </ProductMedia>
      <div className={cn("space-y-0.5", compact ? "p-2" : "p-3")}>
        <p
          className={cn("template-type-product truncate font-medium", compact ? "text-xs" : "text-sm")}
        >
          {product.name}
        </p>
        <ProductPrice price={product.price} compact={compact} />
      </div>
    </Link>
  );
}

function PromoCard({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center md:col-span-2 md:row-span-2"
      style={{
        borderColor: "var(--template-border)",
        backgroundColor: "var(--template-card-bg)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--template-secondary)" }}>
        Promo
      </p>
      <p className="mt-2 text-lg font-semibold" style={{ color: "var(--template-text)" }}>
        {label}
      </p>
    </div>
  );
}

function HybridGridList({
  products,
  preview,
  mediaRatio,
}: {
  products: GridProduct[];
  preview?: boolean;
  mediaRatio: "portrait" | "square" | "wide";
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const slice = preview ? products.slice(0, 6) : products;

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant={view === "grid" ? "default" : "outline"}
          onClick={() => setView("grid")}
        >
          <LayoutGrid className="mr-1.5 h-4 w-4" />
          Grid
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === "list" ? "default" : "outline"}
          onClick={() => setView("list")}
        >
          <List className="mr-1.5 h-4 w-4" />
          List
        </Button>
      </div>
      {view === "list" ? (
        <div className="flex flex-col gap-3">
          {slice.map((product) => (
            <GridProductCard key={product.id} product={product} listMode mediaRatio={mediaRatio} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slice.map((product) => (
            <GridProductCard key={product.id} product={product} mediaRatio={mediaRatio} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductGridLayout({ products, layout, preview }: ProductGridLayoutProps) {
  const mediaRatio = gridLayoutMediaRatio(layout);
  const slice = preview ? products.slice(0, layout === "dense-multi" ? 12 : 8) : products;

  if (layout === "hybrid-toggle") {
    return <HybridGridList products={slice} preview={preview} mediaRatio={mediaRatio} />;
  }

  if (layout === "masonry") {
    return (
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {slice.map((product) => (
          <div key={product.id} className="mb-4 break-inside-avoid">
            <GridProductCard product={product} mediaRatio={mediaRatio} />
          </div>
        ))}
      </div>
    );
  }

  if (layout === "bento") {
    return (
      <div className="grid auto-rows-[minmax(140px,auto)] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {slice.map((product, index) => (
          <div
            key={product.id}
            className={cn(index === 0 ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2" : "")}
          >
            <GridProductCard product={product} featured={index === 0} compact={index > 4} mediaRatio={mediaRatio} />
          </div>
        ))}
      </div>
    );
  }

  if (layout === "hierarchical-promo") {
    const cells: Array<{ type: "product"; product: GridProduct } | { type: "promo"; label: string }> = [];
    slice.forEach((product, index) => {
      if (index > 0 && index % 5 === 0) {
        cells.push({ type: "promo", label: "Shop the edit" });
      }
      cells.push({ type: "product", product });
    });

    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {cells.map((cell, index) =>
          cell.type === "promo" ? (
            <PromoCard key={`promo-${index}`} label={cell.label} />
          ) : (
            <GridProductCard key={cell.product.id} product={cell.product} compact mediaRatio={mediaRatio} />
          ),
        )}
      </div>
    );
  }

  if (layout === "two-column") {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {slice.map((product) => (
          <GridProductCard key={product.id} product={product} mediaRatio={mediaRatio} />
        ))}
      </div>
    );
  }

  if (layout === "dense-multi") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {slice.map((product) => (
          <GridProductCard key={product.id} product={product} compact mediaRatio={mediaRatio} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {slice.map((product) => (
        <GridProductCard key={product.id} product={product} mediaRatio={mediaRatio} />
      ))}
    </div>
  );
}
