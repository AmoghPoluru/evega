import Image from "next/image";
import { ProductsList } from "@/components/product-filters/products-list";
import { getMediaUrl } from "@/components/vendor/layouts/utils";
import { formatCurrency } from "@/lib/utils";
import type { SectionProps } from "./types";

type GridVariant = "standard" | "dense-compact" | "compact" | "editorial-rows" | "masonry";

function resolveGridVariant(
  settings: Record<string, unknown>,
  template: SectionProps["template"],
): GridVariant {
  const fromSettings = settings.variant;
  if (typeof fromSettings === "string") return fromSettings as GridVariant;
  const cardStyle = template.templateConfig.components?.productCard?.style;
  if (cardStyle === "compact") return "dense-compact";
  return "standard";
}

function ProductCard({
  product,
  variant,
}: {
  product: SectionProps["products"][number];
  variant: GridVariant;
}) {
  const imageUrl = getMediaUrl(product.image ?? product.cover);
  const isCompact = variant === "dense-compact" || variant === "compact";
  const isPortrait = variant === "editorial-rows";

  return (
    <div
      className={`overflow-hidden ${isPortrait ? "rounded-none border-0" : "rounded-lg border"}`}
      style={{
        backgroundColor: "var(--template-card-bg)",
        borderColor: "var(--template-border)",
        borderRadius: isPortrait ? "0" : "var(--template-card-radius)",
        borderWidth: "var(--template-border-width, 1px)",
      }}
    >
      <div
        className={`relative bg-gray-100 ${isCompact ? "h-24" : isPortrait ? "aspect-[4/5]" : "h-36"}`}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt={product.name} fill className="object-cover" />
        ) : null}
      </div>
      <div className={isCompact ? "p-2" : "p-3"}>
        <p
          className={`font-medium truncate ${isCompact ? "text-xs" : "text-sm"}`}
          style={{ color: "var(--template-text)" }}
        >
          {product.name}
        </p>
        <p
          className={isCompact ? "text-xs" : "text-sm"}
          style={{ color: "var(--template-primary)" }}
        >
          {formatCurrency(product.price)}
        </p>
      </div>
    </div>
  );
}

/**
 * ProductGridSection with variant branches for standard, dense, and editorial grids.
 */
export function ProductGridSection({ settings, products, preview, template }: SectionProps) {
  const variant = resolveGridVariant(settings, template);
  const title = typeof settings.title === "string" ? settings.title : "Products";
  const showCount = settings.showCount !== false;
  const totalDocs = products.length;
  const heading = showCount ? `${title} (${totalDocs})` : title;
  const columns = template.templateConfig.layout?.productGridColumns ?? 3;
  const gridClass =
    variant === "dense-compact" || variant === "compact"
      ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3"
      : variant === "editorial-rows"
        ? "grid grid-cols-1 md:grid-cols-2 gap-8"
        : `grid grid-cols-2 md:grid-cols-${Math.min(columns, 4)} gap-4`;

  return (
    <div
      className="container mx-auto px-4 py-8 vendor-main-container"
      style={{
        maxWidth: "var(--template-container-width)",
        padding: "var(--template-spacing-section)",
      }}
    >
      <div className="mx-auto">
        {products.length === 0 ? (
          <div className="rounded-lg py-12 text-center vendor-info-header">
            <p className="text-lg" style={{ color: "var(--template-text-secondary)" }}>
              This vendor has no products available yet.
            </p>
          </div>
        ) : (
          <div>
            <h2
              className="mb-6 text-2xl font-bold"
              style={{
                color: "var(--template-text)",
                fontFamily: "var(--template-font-heading)",
              }}
            >
              {heading}
            </h2>
            {preview ? (
              <div className={gridClass}>
                {products.slice(0, variant === "dense-compact" ? 10 : 6).map((product) => (
                  <ProductCard key={product.id} product={product} variant={variant} />
                ))}
              </div>
            ) : (
              <ProductsList
                products={products as React.ComponentProps<typeof ProductsList>["products"]}
                title=""
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
