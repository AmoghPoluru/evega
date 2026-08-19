import OpenAI, { toFile } from "openai";
import sharp from "sharp";

import { uploadToBlob } from "@/lib/vercel-blob-storage";

const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";

function looksLikeHtml(bytes: Buffer): boolean {
  const head = bytes.subarray(0, 32).toString("utf8").trim().toLowerCase();
  return head.startsWith("<!doctype") || head.startsWith("<html") || head.startsWith("<?xml");
}

async function fetchImageBytes(imageUrl: string): Promise<Buffer> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error("Could not load the product image to generate a banner.");
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length < 32 || looksLikeHtml(bytes)) {
    throw new Error(
      "The product image URL did not return a real image. Use a public product photo (Vercel Blob), then try again."
    );
  }
  return bytes;
}

async function toOpenaiJpeg(bytes: Buffer): Promise<Buffer> {
  try {
    return await sharp(bytes)
      .rotate()
      .toColorspace("srgb")
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch {
    throw new Error(
      "This product photo format is not supported. Upload a JPEG or PNG on the product, then generate the banner."
    );
  }
}

function buildBannerPrompt(args: {
  prompt: string;
  productName: string;
  priceLabel: string;
}): string {
  return [
    "Create a professional Instagram promotional banner in a portrait layout.",
    "Use the attached photo as the real product photography. Do not replace it with a different product.",
    "Place the product clearly in the composition (typically one side or center). Add campaign copy, brand styling, and decorative frames as the user requests.",
    "Keep all text sharp, spelled correctly, and readable on a phone. Premium boutique aesthetic unless the user asks otherwise.",
    `Product name: ${args.productName}. Price: ${args.priceLabel}.`,
    `Vendor brief: ${args.prompt.trim()}`,
  ].join(" ");
}

function openaiEditError(error: unknown): Error {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message)
        : "OpenAI image request failed.";
  if (/invalid_image_file|Invalid image file/i.test(message)) {
    return new Error(
      "OpenAI could not read this product photo. Upload a JPEG or PNG (not HEIC/WebP-only), then generate again."
    );
  }
  if (/401|invalid api key|incorrect api key/i.test(message)) {
    return new Error(
      "Your OpenAI API key is invalid. Paste a key from platform.openai.com/api-keys on the vendor dashboard."
    );
  }
  if (/429|rate limit|quota/i.test(message)) {
    return new Error(
      "OpenAI rate limit or quota exceeded. Check billing at platform.openai.com."
    );
  }
  return new Error(message);
}

export async function generateInstagramBanner(args: {
  apiKey: string;
  sourceImageUrl: string;
  prompt: string;
  productName: string;
  priceLabel: string;
  vendorId: string;
  productId: string;
}): Promise<{ imageUrl: string }> {
  const source = await fetchImageBytes(args.sourceImageUrl);
  const jpeg = await toOpenaiJpeg(source);
  const image = await toFile(jpeg, "product.jpg", { type: "image/jpeg" });

  const client = new OpenAI({ apiKey: args.apiKey });
  let result;
  try {
    result = await client.images.edit({
      model: OPENAI_IMAGE_MODEL,
      image,
      prompt: buildBannerPrompt(args),
      size: "1024x1536",
      quality: "high",
    });
  } catch (error) {
    console.error("[instagram.banner] OpenAI error", error);
    throw openaiEditError(error);
  }

  const b64 = result.data?.[0]?.b64_json;
  const remoteUrl = result.data?.[0]?.url;
  let png: Buffer;

  if (b64) {
    png = Buffer.from(b64, "base64");
  } else if (remoteUrl) {
    const imgRes = await fetch(remoteUrl);
    if (!imgRes.ok) {
      throw new Error("OpenAI returned an image URL that could not be downloaded.");
    }
    png = Buffer.from(await imgRes.arrayBuffer());
  } else {
    throw new Error("OpenAI did not return an image. Try a shorter prompt.");
  }

  const uploaded = await uploadToBlob(
    png,
    `instagram-banners/${args.vendorId}/${args.productId}.png`,
    "image/png",
    { overwrite: true, cacheControlMaxAge: 60 }
  );
  return { imageUrl: uploaded.url };
}
