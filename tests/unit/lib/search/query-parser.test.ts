import { describe, it, expect } from "vitest";
import { parseQuery } from "@/lib/search/query-parser";

describe("Query Parser", () => {
  describe("Basic Color + Type Queries", () => {
    it("should parse 'red dress' correctly", () => {
      const result = parseQuery("red dress");
      expect(result.color).toBe("red");
      expect(result.keywords).toContain("dress");
      expect(result.size).toBeUndefined();
    });

    it("should parse 'blue kurta' correctly", () => {
      const result = parseQuery("blue kurta");
      expect(result.color).toBe("blue");
      expect(result.keywords).toContain("kurta");
    });

    it("should parse 'green saree' correctly", () => {
      const result = parseQuery("green saree");
      expect(result.color).toBe("green");
      expect(result.keywords).toContain("saree");
    });
  });

  describe("Size + Color Queries", () => {
    it("should parse 'small red' correctly", () => {
      const result = parseQuery("small red");
      expect(result.size).toBe("small");
      expect(result.color).toBe("red");
      expect(result.keywords).toHaveLength(0);
    });

    it("should parse 's red' abbreviation correctly", () => {
      const result = parseQuery("s red");
      expect(result.size).toBe("small");
      expect(result.color).toBe("red");
    });

    it("should parse 'medium blue' correctly", () => {
      const result = parseQuery("medium blue");
      expect(result.size).toBe("medium");
      expect(result.color).toBe("blue");
    });
  });

  describe("Complete Queries", () => {
    it("should parse 'red dress size small' correctly", () => {
      const result = parseQuery("red dress size small");
      expect(result.color).toBe("red");
      expect(result.size).toBe("small");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'small red dress' correctly", () => {
      const result = parseQuery("small red dress");
      expect(result.size).toBe("small");
      expect(result.color).toBe("red");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'size small red dress' correctly", () => {
      const result = parseQuery("size small red dress");
      expect(result.size).toBe("small");
      expect(result.color).toBe("red");
      expect(result.keywords).toContain("dress");
    });
  });

  describe("Material Queries", () => {
    it("should parse 'silk dress' correctly", () => {
      const result = parseQuery("silk dress");
      expect(result.material).toBe("silk");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'silk red dress' correctly", () => {
      const result = parseQuery("silk red dress");
      expect(result.material).toBe("silk");
      expect(result.color).toBe("red");
      expect(result.keywords).toContain("dress");
    });
  });

  describe("Complex Combinations", () => {
    it("should parse 'small red silk dress' correctly", () => {
      const result = parseQuery("small red silk dress");
      expect(result.size).toBe("small");
      expect(result.color).toBe("red");
      expect(result.material).toBe("silk");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'red dress size small silk' correctly", () => {
      const result = parseQuery("red dress size small silk");
      expect(result.color).toBe("red");
      expect(result.size).toBe("small");
      expect(result.material).toBe("silk");
      expect(result.keywords).toContain("dress");
    });
  });

  describe("Price Queries", () => {
    it("should parse 'dress under 500' correctly", () => {
      const result = parseQuery("dress under 500");
      expect(result.maxPrice).toBe("500");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'dress less than 500' correctly", () => {
      const result = parseQuery("dress less than 500");
      expect(result.maxPrice).toBe("500");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'dress below 500' correctly", () => {
      const result = parseQuery("dress below 500");
      expect(result.maxPrice).toBe("500");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'dress under 100$' correctly", () => {
      const result = parseQuery("dress under 100$");
      expect(result.maxPrice).toBe("100");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'dress over 1000' correctly", () => {
      const result = parseQuery("dress over 1000");
      expect(result.minPrice).toBe("1000");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'dress more than 1000' correctly", () => {
      const result = parseQuery("dress more than 1000");
      expect(result.minPrice).toBe("1000");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'red dress under 500' correctly", () => {
      const result = parseQuery("red dress under 500");
      expect(result.color).toBe("red");
      expect(result.maxPrice).toBe("500");
      expect(result.keywords).toContain("dress");
    });

    it("should parse 'small red dress under 500' correctly", () => {
      const result = parseQuery("small red dress under 500");
      expect(result.size).toBe("small");
      expect(result.color).toBe("red");
      expect(result.maxPrice).toBe("500");
      expect(result.keywords).toContain("dress");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty query", () => {
      const result = parseQuery("");
      expect(result.keywords).toHaveLength(0);
      expect(result.color).toBeUndefined();
      expect(result.size).toBeUndefined();
      expect(result.minPrice).toBeUndefined();
      expect(result.maxPrice).toBeUndefined();
    });

    it("should handle case insensitive queries", () => {
      const result1 = parseQuery("RED DRESS");
      const result2 = parseQuery("red dress");
      expect(result1.color).toBe(result2.color);
      expect(result1.keywords).toEqual(result2.keywords);
    });

    it("should ignore stop words", () => {
      const result = parseQuery("a red dress");
      expect(result.color).toBe("red");
      expect(result.keywords).toContain("dress");
      expect(result.keywords).not.toContain("a");
    });
  });
});
