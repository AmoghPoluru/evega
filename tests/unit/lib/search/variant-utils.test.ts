import { describe, it, expect } from "vitest";
import {
  extractVariantValues,
  normalizeVariantValue,
  matchesVariantValue,
  hasMatchingVariant,
} from "@/lib/search/variant-utils";

describe("Variant Utils", () => {
  const mockVariants = [
    {
      variantData: {
        size: "Small",
        color: "Red",
        material: "Silk",
      },
      stock: 10,
    },
    {
      variantData: {
        size: "Medium",
        color: "Red",
        material: "Cotton",
      },
      stock: 5,
    },
  ];

  describe("extractVariantValues", () => {
    it("should extract all variant values as searchable string", () => {
      const result = extractVariantValues(mockVariants);
      expect(result).toContain("small");
      expect(result).toContain("red");
      expect(result).toContain("silk");
      expect(result).toContain("medium");
      expect(result).toContain("cotton");
    });

    it("should return empty string for null/undefined variants", () => {
      expect(extractVariantValues(null)).toBe("");
      expect(extractVariantValues(undefined)).toBe("");
      expect(extractVariantValues([])).toBe("");
    });
  });

  describe("normalizeVariantValue", () => {
    it("should normalize to lowercase and trim", () => {
      expect(normalizeVariantValue("Red")).toBe("red");
      expect(normalizeVariantValue("  Small  ")).toBe("small");
      expect(normalizeVariantValue("SILK")).toBe("silk");
    });
  });

  describe("matchesVariantValue", () => {
    it("should match exact values", () => {
      expect(matchesVariantValue("Red", "red")).toBe(true);
      expect(matchesVariantValue("Small", "small")).toBe(true);
    });

    it("should match case-insensitive", () => {
      expect(matchesVariantValue("RED", "red")).toBe(true);
      expect(matchesVariantValue("red", "RED")).toBe(true);
    });

    it("should match partial strings", () => {
      expect(matchesVariantValue("Small", "sm")).toBe(true);
      expect(matchesVariantValue("Red", "re")).toBe(true);
    });
  });

  describe("hasMatchingVariant", () => {
    it("should find matching color variant", () => {
      expect(hasMatchingVariant(mockVariants, "color", "red")).toBe(true);
      expect(hasMatchingVariant(mockVariants, "color", "Red")).toBe(true);
      expect(hasMatchingVariant(mockVariants, "color", "blue")).toBe(false);
    });

    it("should find matching size variant", () => {
      expect(hasMatchingVariant(mockVariants, "size", "small")).toBe(true);
      expect(hasMatchingVariant(mockVariants, "size", "Small")).toBe(true);
      expect(hasMatchingVariant(mockVariants, "size", "large")).toBe(false);
    });

    it("should find matching material variant", () => {
      expect(hasMatchingVariant(mockVariants, "material", "silk")).toBe(true);
      expect(hasMatchingVariant(mockVariants, "material", "cotton")).toBe(true);
      expect(hasMatchingVariant(mockVariants, "material", "georgette")).toBe(false);
    });

    it("should return false for null/undefined variants", () => {
      expect(hasMatchingVariant(null, "color", "red")).toBe(false);
      expect(hasMatchingVariant(undefined, "color", "red")).toBe(false);
      expect(hasMatchingVariant([], "color", "red")).toBe(false);
    });
  });
});
