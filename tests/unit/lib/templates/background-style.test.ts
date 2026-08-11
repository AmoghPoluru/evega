import { describe, expect, it } from "vitest";

import { buildBackgroundStyleForType, isGradientCssValue } from "../../../../src/lib/templates/build-background-style-for-type";
import { generateBackgroundCSS } from "../../../../src/lib/templates/css-variables";
import { resolveMergedBackgroundStyle } from "../../../../src/lib/templates/resolve-merged-background-style";
import { buildVendorPageBackgroundStyles } from "../../../../src/lib/templates/template-background-styles";

const brandColors = {
  primary: "#FF6B9D",
  secondary: "#C44569",
  accent: "#FFD93D",
  background: "#FF6B9D",
  cardBackground: "#FFFFFF",
};

const cssVariables = {
  "--template-primary": brandColors.primary,
  "--template-secondary": brandColors.secondary,
  "--template-accent": brandColors.accent,
};

describe("background style rendering", () => {
  it("rejects stale solid hex when type is gradient", () => {
    const resolved = resolveMergedBackgroundStyle(
      { type: "solid", value: "#FF6B9D" },
      { type: "gradient", value: "#FF6B9D" },
      brandColors,
    );

    expect(resolved?.type).toBe("gradient");
    expect(isGradientCssValue(resolved?.value)).toBe(true);
  });

  it("produces distinct CSS for solid, gradient, and mesh", () => {
    const types = ["solid", "gradient", "mesh-gradient"] as const;

    const cssByType = Object.fromEntries(
      types.map((type) => {
        const backgroundStyle = buildBackgroundStyleForType(type, brandColors);
        const css = generateBackgroundCSS(backgroundStyle, cssVariables);
        return [type, css];
      }),
    ) as Record<(typeof types)[number], string>;

    expect(cssByType.solid).toContain("background-color:");
    expect(cssByType.solid).toContain("background-image: none");
    expect(cssByType.gradient).toContain("background-image: linear-gradient");
    expect(cssByType.gradient).toContain("color-mix");
    expect(cssByType["mesh-gradient"]).toContain("radial-gradient");

    expect(cssByType.solid).not.toEqual(cssByType.gradient);
    expect(cssByType.gradient).not.toEqual(cssByType["mesh-gradient"]);
    expect(cssByType.solid).not.toEqual(cssByType["mesh-gradient"]);
  });

  it("upgrades brand-color gradients to the high-contrast recipe", () => {
    const resolved = resolveMergedBackgroundStyle(
      undefined,
      {
        type: "gradient",
        value: "linear-gradient(135deg, #FF6B9D 0%, #C44569 42%, #FFD93D 100%)",
      },
      brandColors,
    );

    expect(resolved?.value).toContain("color-mix");
    expect(resolved?.value).not.toContain("#FF6B9D 0%");
  });

  it("preserves soft preset gradients that omit the brand primary", () => {
    const resolved = resolveMergedBackgroundStyle(
      undefined,
      {
        type: "gradient",
        value: "linear-gradient(135deg, #FDF6F8 0%, #F5E6EC 100%)",
      },
      brandColors,
    );

    expect(resolved?.value).toBe("linear-gradient(135deg, #FDF6F8 0%, #F5E6EC 100%)");
  });

  it("uses mesh CSS instead of solid fallback when colors.background is set", () => {
    const config = {
      colors: brandColors,
      backgroundStyle: resolveMergedBackgroundStyle(
        undefined,
        { type: "mesh-gradient" },
        brandColors,
      ),
    };

    const css = buildVendorPageBackgroundStyles("vendor-page-template", config, cssVariables);

    expect(css).toContain("radial-gradient");
    expect(css).not.toMatch(/background-color: #FF6B9D !important;\s*}/);
  });
});
