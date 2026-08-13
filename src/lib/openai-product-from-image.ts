/**
 * OpenAI Vision → product name, description, and retail price for photo import.
 * Uses the vendor's stored OpenAI API key (openaiConfig.apiKey).
 */

export type ProductCopyFromImage = {
  name: string;
  description: string;
  price: number | null;
};

export function resolveOpenAIApiKey(vendorKey?: string | null): string {
  const fromVendor = typeof vendorKey === "string" ? vendorKey.trim() : "";
  return fromVendor;
}

export function isOpenAIConfigured(vendorKey?: string | null): boolean {
  return resolveOpenAIApiKey(vendorKey).length > 0;
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value * 100) / 100;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed * 100) / 100;
  }
  return null;
}

export async function suggestProductCopyFromImageUrl(
  imageUrl: string,
  fallbackName: string,
  options: { apiKey: string },
): Promise<ProductCopyFromImage> {
  const key = resolveOpenAIApiKey(options.apiKey);
  if (!key) {
    return { name: fallbackName, description: "", price: null };
  }

  const model = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You write e-commerce product listings for a fashion and lifestyle marketplace. Return JSON only with keys "name" (short product name, max 80 chars), "description" (2–4 sentences: materials, style, occasion, notable features), and "price" (number: estimated retail price in USD; null if you cannot reasonably estimate). Be factual from the image; do not invent brand names or certifications you cannot see. price must be a plain number or null.',
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Suggest a product name, description, and retail price (USD) for this photo. Fallback name if unclear: ${fallbackName}`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl, detail: "low" },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("OpenAI vision error:", res.status, errText.slice(0, 400));
    throw new Error(
      `OpenAI request failed (${res.status}). Check your API key and billing on the dashboard.`,
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = extractJsonObject(content);
  const nameRaw = typeof parsed?.name === "string" ? parsed.name.trim() : "";
  const descRaw = typeof parsed?.description === "string" ? parsed.description.trim() : "";
  const price = parsePrice(parsed?.price ?? parsed?.unitPrice ?? parsed?.unit_price);

  return {
    name: nameRaw || fallbackName,
    description: descRaw,
    price,
  };
}
