import { describe, expect, it } from "vitest";

import { resolveSectionCustomizationFields } from "../../../../src/lib/templates/resolve-section-customization";
import { buildVendorSectionStyles } from "../../../../src/lib/templates/template-section-styles";

describe("resolveSectionCustomizationFields", () => {
  it("prefers vendor overrides over base template", () => {
    const fields = resolveSectionCustomizationFields(
      {
        layout: { showBanner: true },
        components: {
          heroBanner: { height: "400px" },
          productCard: { borderRadius: "0px" },
        },
      } as never,
      {
        layout: { showBanner: false },
        components: {
          heroBanner: { height: "560px" },
          productCard: { borderRadius: "16px" },
        },
      },
    );

    expect(fields.layout?.showBanner).toBe(false);
    expect(fields.components?.heroBanner?.height).toBe("560px");
    expect(fields.components?.productCard?.borderRadius).toBe("16px");
  });
});

describe("buildVendorSectionStyles", () => {
  it("emits hero height and card radius rules", () => {
    const css = buildVendorSectionStyles("collection-layout");
    expect(css).toContain("[data-template-hero-banner]");
    expect(css).toContain("--template-banner-height");
    expect(css).toContain("[data-template-product-card]");
    expect(css).toContain("--template-card-radius");
  });
});
