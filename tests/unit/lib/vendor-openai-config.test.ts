import { describe, expect, it } from "vitest";

import {
  buildOpenAiConfigUpdate,
  hasStoredOpenAiKey,
} from "@/lib/vendor-openai-config";
import { openAiConfigInputSchema } from "@/modules/marketing/openai-config-trpc";

describe("buildOpenAiConfigUpdate", () => {
  it("stores a new api key", () => {
    const result = buildOpenAiConfigUpdate(null, { apiKey: "sk-test-key" });
    expect(result.apiKey).toBe("sk-test-key");
  });

  it("keeps existing key when input is blank", () => {
    const result = buildOpenAiConfigUpdate({ apiKey: "sk-existing" }, { apiKey: "" });
    expect(result.apiKey).toBe("sk-existing");
  });
});

describe("hasStoredOpenAiKey", () => {
  it("returns true when a key is stored", () => {
    expect(hasStoredOpenAiKey({ apiKey: "sk-test" })).toBe(true);
  });

  it("returns false when no key is stored", () => {
    expect(hasStoredOpenAiKey({ apiKey: "" })).toBe(false);
  });
});

describe("openAiConfigInputSchema", () => {
  it("accepts blank updates", () => {
    expect(openAiConfigInputSchema.safeParse({}).success).toBe(true);
  });

  it("rejects keys that do not start with sk-", () => {
    expect(openAiConfigInputSchema.safeParse({ apiKey: "bad-key" }).success).toBe(false);
  });
});
