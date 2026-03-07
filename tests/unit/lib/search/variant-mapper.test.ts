import { describe, it, expect } from "vitest";
import {
  mapToVariantType,
  isSizeTerm,
  isColorTerm,
  isMaterialTerm,
  getNormalizedVariantValue,
} from "@/lib/search/variant-mapper";

describe("Variant Mapper", () => {
  describe("mapToVariantType", () => {
    it("should map color terms correctly", () => {
      expect(mapToVariantType("red")).toEqual({ type: "color", value: "red" });
      expect(mapToVariantType("blue")).toEqual({ type: "color", value: "blue" });
      expect(mapToVariantType("maroon")).toEqual({ type: "color", value: "maroon" });
      expect(mapToVariantType("crimson")).toEqual({ type: "color", value: "red" });
    });

    it("should map size terms correctly", () => {
      expect(mapToVariantType("small")).toEqual({ type: "size", value: "small" });
      expect(mapToVariantType("s")).toEqual({ type: "size", value: "small" });
      expect(mapToVariantType("medium")).toEqual({ type: "size", value: "medium" });
      expect(mapToVariantType("m")).toEqual({ type: "size", value: "medium" });
      expect(mapToVariantType("large")).toEqual({ type: "size", value: "large" });
      expect(mapToVariantType("l")).toEqual({ type: "size", value: "large" });
    });

    it("should map material terms correctly", () => {
      expect(mapToVariantType("silk")).toEqual({ type: "material", value: "silk" });
      expect(mapToVariantType("cotton")).toEqual({ type: "material", value: "cotton" });
      expect(mapToVariantType("georgette")).toEqual({ type: "material", value: "georgette" });
    });

    it("should return null for unknown terms", () => {
      expect(mapToVariantType("unknown")).toBeNull();
      expect(mapToVariantType("xyz")).toBeNull();
    });

    it("should be case insensitive", () => {
      expect(mapToVariantType("RED")).toEqual({ type: "color", value: "red" });
      expect(mapToVariantType("SMALL")).toEqual({ type: "size", value: "small" });
      expect(mapToVariantType("SILK")).toEqual({ type: "material", value: "silk" });
    });
  });

  describe("isSizeTerm", () => {
    it("should identify size terms", () => {
      expect(isSizeTerm("small")).toBe(true);
      expect(isSizeTerm("s")).toBe(true);
      expect(isSizeTerm("medium")).toBe(true);
      expect(isSizeTerm("large")).toBe(true);
      expect(isSizeTerm("xl")).toBe(true);
    });

    it("should reject non-size terms", () => {
      expect(isSizeTerm("red")).toBe(false);
      expect(isSizeTerm("silk")).toBe(false);
      expect(isSizeTerm("dress")).toBe(false);
    });
  });

  describe("isColorTerm", () => {
    it("should identify color terms", () => {
      expect(isColorTerm("red")).toBe(true);
      expect(isColorTerm("blue")).toBe(true);
      expect(isColorTerm("maroon")).toBe(true);
      expect(isColorTerm("crimson")).toBe(true);
    });

    it("should reject non-color terms", () => {
      expect(isColorTerm("small")).toBe(false);
      expect(isColorTerm("silk")).toBe(false);
      expect(isColorTerm("dress")).toBe(false);
    });
  });

  describe("isMaterialTerm", () => {
    it("should identify material terms", () => {
      expect(isMaterialTerm("silk")).toBe(true);
      expect(isMaterialTerm("cotton")).toBe(true);
      expect(isMaterialTerm("georgette")).toBe(true);
    });

    it("should reject non-material terms", () => {
      expect(isMaterialTerm("red")).toBe(false);
      expect(isMaterialTerm("small")).toBe(false);
      expect(isMaterialTerm("dress")).toBe(false);
    });
  });

  describe("getNormalizedVariantValue", () => {
    it("should normalize size values", () => {
      expect(getNormalizedVariantValue("s", "size")).toBe("small");
      expect(getNormalizedVariantValue("small", "size")).toBe("small");
      expect(getNormalizedVariantValue("m", "size")).toBe("medium");
      expect(getNormalizedVariantValue("medium", "size")).toBe("medium");
    });

    it("should normalize color values", () => {
      expect(getNormalizedVariantValue("red", "color")).toBe("red");
      expect(getNormalizedVariantValue("crimson", "color")).toBe("red");
      expect(getNormalizedVariantValue("maroon", "color")).toBe("maroon");
    });

    it("should normalize material values", () => {
      expect(getNormalizedVariantValue("silk", "material")).toBe("silk");
      expect(getNormalizedVariantValue("cotton", "material")).toBe("cotton");
    });

    it("should return null for unknown values", () => {
      expect(getNormalizedVariantValue("unknown", "size")).toBeNull();
      expect(getNormalizedVariantValue("xyz", "color")).toBeNull();
    });
  });
});
