import Image from "next/image";
import { ProductsList } from "@/components/product-filters/products-list";
import { getMediaUrl } from "@/components/vendor/layouts/utils";
import { formatCurrency } from "@/lib/utils";
import type { SectionProps } from "./types";

/**
 * ProductGridSection
 * The filterable product grid extracted from the original DefaultLayout.
 * In the builder preview it renders a static, dependency-free grid instead of
 * the full filter-driven list.
 */
export function ProductGridSection({ settings, products, preview }: SectionProps) {
  const title = typeof settings.title === "string" ? settings.title : "Products";
  const showCount = settings.showCount !== false;
  const totalDocs = products.length;
  const heading = showCount ? `${title} (${totalDocs})` : title;

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
          <div className="text-center py-12 rounded-lg vendor-info-header">
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
              {heading}
            </h2>
            {preview ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.slice(0, 6).map((product) => {
                  const imageUrl = getMediaUrl(product.image ?? product.cover);
                  return (
                    <div
                      key={product.id}
                      className="rounded-lg overflow-hidden border"
                      style={{
                        backgroundColor: "var(--template-card-bg)",
                        borderColor: "var(--template-border)",
                        borderRadius: "var(--template-card-radius)",
                      }}
                    >
                      <div className="relative h-28 bg-gray-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="p-3">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--template-text)" }}
                        >
                          {product.name}
                        </p>
                        <p className="text-sm" style={{ color: "var(--template-primary)" }}>
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ProductsList
                products={products as React.ComponentProps<typeof ProductsList>["products"]}
                title={``}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
