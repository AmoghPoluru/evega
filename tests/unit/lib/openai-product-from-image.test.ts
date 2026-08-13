import { describe, expect, it } from "vitest";

import {
  isOpenAIConfigured,
  resolveOpenAIApiKey,
} from "@/lib/openai-product-from-image";
import { getVendorOpenAiApiKey } from "@/lib/vendor-openai-config";

describe("resolveOpenAIApiKey", () => {
  it("uses vendor key when provided", () => {
    expect(resolveOpenAIApiKey("sk-test")).toBe("sk-test");
  });

  it("returns empty when no vendor key", () => {
    expect(resolveOpenAIApiKey("")).toBe("");
    expect(isOpenAIConfigured(null)).toBe(false);
  });
});

describe("getVendorOpenAiApiKey", () => {
  it("reads trimmed key from vendor openaiConfig", () => {
    expect(getVendorOpenAiApiKey({ openaiConfig: { apiKey: "  sk-vendor  " } })).toBe(
      "sk-vendor",
    );
  });
});
