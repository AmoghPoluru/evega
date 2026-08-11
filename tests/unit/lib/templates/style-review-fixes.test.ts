import { describe, expect, it } from "vitest";

import {
  mixHexWithWhite,
  resolvePageBackgroundContrastHex,
} from "../../../../src/lib/templates/resolve-contrast-surface";
import {
  customizationMatchesPreset,
  resolveStylePresetIdForSave,
} from "../../../../src/lib/templates/style-preset-match";
import { STYLE_PRESETS } from "../../../../src/lib/templates/style-presets";

describe("resolvePageBackgroundContrastHex", () => {
  it("uses solid fill for solid backgrounds", () => {
    const hex = resolvePageBackgroundContrastHex({
      colors: { primary: "#FF6B9D", background: "#FF6B9D" },
      backgroundStyle: { type: "solid", value: "#FF6B9D" },
    });

    expect(hex).toBe("#FF6B9D");
  });

  it("uses a lightened primary for gradient backgrounds", () => {
    const hex = resolvePageBackgroundContrastHex({
      colors: { primary: "#FF6B9D" },
      backgroundStyle: { type: "gradient", source: "generated" },
    });

    expect(hex).toBe(mixHexWithWhite("#FF6B9D", 0.35));
    expect(hex).not.toBe("#FF6B9D");
  });
});

describe("style preset tracking", () => {
  it("matches a full preset customization", () => {
    const bold = STYLE_PRESETS.find((preset) => preset.id === "bold");
    expect(bold).toBeDefined();
    expect(customizationMatchesPreset(bold!.customization, "bold")).toBe(true);
  });

  it("clears preset id when colors diverge", () => {
    const bold = STYLE_PRESETS.find((preset) => preset.id === "bold")!;
    const edited = {
      ...bold.customization,
      stylePresetId: "bold" as const,
      colors: { ...bold.customization.colors, primary: "#000000" },
    };

    expect(resolveStylePresetIdForSave(edited)).toBeNull();
  });

  it("keeps preset id while customization still matches", () => {
    const elegant = STYLE_PRESETS.find((preset) => preset.id === "elegant")!;
    const values = { ...elegant.customization, stylePresetId: "elegant" as const };

    expect(resolveStylePresetIdForSave(values)).toBe("elegant");
  });
});
