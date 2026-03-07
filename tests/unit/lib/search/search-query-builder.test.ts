import { describe, it, expect } from "vitest";
import { buildSearchQuery } from "@/lib/search/search-query-builder";

describe("Search Query Builder", () => {
  describe("buildSearchQuery", () => {
    it("should build query for 'red dress'", () => {
      const { where, parsedQuery } = buildSearchQuery({ searchTerm: "red dress" });
      
      expect(parsedQuery.color).toBe("red");
      expect(parsedQuery.keywords).toContain("dress");
      expect(where.or).toBeDefined();
      expect(Array.isArray(where.or)).toBe(true);
    });

    it("should build query for 'small red'", () => {
      const { where, parsedQuery } = buildSearchQuery({ searchTerm: "small red" });
      
      expect(parsedQuery.size).toBe("small");
      expect(parsedQuery.color).toBe("red");
      expect(where.or).toBeDefined();
    });

    it("should build query for 'small red silk dress'", () => {
      const { where, parsedQuery } = buildSearchQuery({ searchTerm: "small red silk dress" });
      
      expect(parsedQuery.size).toBe("small");
      expect(parsedQuery.color).toBe("red");
      expect(parsedQuery.material).toBe("silk");
      expect(parsedQuery.keywords).toContain("dress");
      expect(where.or).toBeDefined();
    });

    it("should include variant conditions in OR", () => {
      const { where } = buildSearchQuery({ searchTerm: "red dress" });
      
      // Should have OR conditions for name, tags, description, and variants
      expect(where.or).toBeDefined();
      expect(Array.isArray(where.or)).toBe(true);
      expect(where.or.length).toBeGreaterThan(0);
    });

    it("should handle keyword-only searches", () => {
      const { where, parsedQuery } = buildSearchQuery({ searchTerm: "dress" });
      
      expect(parsedQuery.keywords).toContain("dress");
      expect(where.or).toBeDefined();
    });

    it("should handle variant-only searches", () => {
      const { where, parsedQuery } = buildSearchQuery({ searchTerm: "small red" });
      
      expect(parsedQuery.size).toBe("small");
      expect(parsedQuery.color).toBe("red");
      expect(parsedQuery.keywords).toHaveLength(0);
      expect(where.or).toBeDefined();
    });
  });
});
