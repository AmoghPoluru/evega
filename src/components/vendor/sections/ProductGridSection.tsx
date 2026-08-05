import type { SectionProps } from "./types";
import { ProductGridLayout } from "./ProductGridLayout";
import { ChromeSectionHeader } from "@/components/vendor/chrome/StorefrontChrome";
import { resolveStorefrontChrome } from "@/lib/templates/storefront-chrome";
import { normalizeGridLayout } from "@/lib/templates/product-grid-layouts";

/**
 * Product grid section — renders one of the e-commerce grid layout patterns.
 */
export function ProductGridSection({ settings, products, preview, template }: SectionProps) {
  const layout = normalizeGridLayout(settings.variant);
  const title = typeof settings.title === "string" ? settings.title : "Products";
  const showCount = settings.showCount !== false;
  const totalDocs = products.length;
  const heading = showCount ? `${title} (${totalDocs})` : title;
  const chrome = resolveStorefrontChrome(template.templateConfig);
  const useChromeHeader =
    chrome.enabled === true &&
    Boolean(chrome.content?.sectionLabel || chrome.content?.sectionHeadline);

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
            {useChromeHeader ? (
              <ChromeSectionHeader chrome={template.templateConfig.chrome} />
            ) : (
              <h2 className="template-type-product mb-6 text-2xl font-bold">
                {heading}
              </h2>
            )}
            <ProductGridLayout
              products={products.map((product) => ({
                id: String(product.id),
                name: product.name,
                price: product.price,
                image: product.image,
                cover: product.cover,
                description: product.description,
              }))}
              layout={layout}
              preview={preview}
            />
          </div>
        )}
      </div>
    </div>
  );
}
