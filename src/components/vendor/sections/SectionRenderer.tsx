import { createElement } from "react";
import { getSection } from "@/lib/templates/component-registry";
import type { VendorLayoutProps } from "@/components/vendor/layouts/types";
import { DEFAULT_SECTIONS, normalizeStorefrontSections, type StorefrontSection } from "@/types/template-sections";

interface SectionRendererProps extends VendorLayoutProps {
  sections?: StorefrontSection[] | null;
  preview?: boolean;
}

/**
 * SectionRenderer
 * Renders the enabled storefront sections in `order`, resolving each section
 * type through the section registry. Unknown section types are skipped.
 */
export function SectionRenderer({
  sections,
  vendor,
  products,
  template,
  preview,
}: SectionRendererProps) {
  const list = normalizeStorefrontSections(sections);

  const ordered = [...list]
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {ordered.map((section) => {
        const Section = getSection(section.type);
        if (!Section) return null;

        return createElement(Section, {
          key: section.id,
          settings: section.settings ?? {},
          vendor,
          products,
          template,
          preview,
        });
      })}
    </>
  );
}
