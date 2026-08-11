import { describe, expect, it } from "vitest";

import {
  formatHexDisplay,
  getContrastRatio,
  isValidHex,
  meetsWcagAaNormalText,
  normalizeHex,
} from "../../../../src/lib/templates/color-utils";

describe("normalizeHex", () => {
  it("expands short hex", () => {
    expect(normalizeHex("#f0a")).toBe("#FF00AA");
  });

  it("normalizes full hex", () => {
    expect(normalizeHex("#ff6b9d")).toBe("#FF6B9D");
  });

  it("rejects invalid values", () => {
    expect(normalizeHex("red")).toBeNull();
    expect(normalizeHex("#gggggg")).toBeNull();
  });
});

describe("contrast helpers", () => {
  it("detects valid hex", () => {
    expect(isValidHex("#FFFFFF")).toBe(true);
    expect(isValidHex("nope")).toBe(false);
  });

  it("computes contrast ratio between black and white", () => {
    expect(getContrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
  });

  it("flags low-contrast pairs", () => {
    expect(meetsWcagAaNormalText("#CCCCCC", "#FFFFFF")).toBe(false);
    expect(meetsWcagAaNormalText("#1A1A1A", "#FFFFFF")).toBe(true);
  });

  it("falls back display hex", () => {
    expect(formatHexDisplay(undefined)).toBe("#000000");
    expect(formatHexDisplay("#abc")).toBe("#AABBCC");
  });
});
