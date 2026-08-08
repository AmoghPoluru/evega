/**
 * Replace Wingover product images from ~/pictures/evega using name matching.
 *
 * Usage: npx tsx scripts/replace-wingover-product-images.ts
 */
import "dotenv/config";
import { readdir, readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { getPayload } from "payload";
import config from "@payload-config";

const PICTURES_DIR = join(homedir(), "pictures", "evega");

/** Explicit overrides when filename does not follow the default name pattern. */
const PRODUCT_FILE_OVERRIDES: Record<string, string> = {
  "Coral Garden Suit Set": "Coral_Garden_Suit_Set_Dark_model.png",
};

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.png$/i, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function productToDefaultFileName(productName: string): string {
  return `${productName.trim().replace(/\s+/g, "_")}.png`;
}

async function resolveFileName(
  productName: string,
  files: string[],
): Promise<{ fileName: string; path: string } | null> {
  const preferred =
    PRODUCT_FILE_OVERRIDES[productName] ?? productToDefaultFileName(productName);
  const preferredKey = normalizeKey(preferred);

  // Exact (including accidental leading/trailing spaces in Finder names)
  const exact = files.find((f) => f === preferred || f.trim() === preferred);
  if (exact) return { fileName: exact, path: join(PICTURES_DIR, exact) };

  // Normalized match (ignore case, spaces vs underscores)
  const normalized = files.find((f) => normalizeKey(f) === preferredKey);
  if (normalized) return { fileName: normalized, path: join(PICTURES_DIR, normalized) };

  // Soft fallback for Lilac if dark_model is missing: base lilac file
  if (productName === "Lilac Whisper Kurta Set") {
    const fallback = files.find(
      (f) => normalizeKey(f) === normalizeKey("Lilac_Whisper_Kurta_Set.png"),
    );
    if (fallback) {
      console.warn(
        `⚠ "${preferred}" not found — falling back to "${fallback}" for Lilac Whisper Kurta Set`,
      );
      return { fileName: fallback, path: join(PICTURES_DIR, fallback) };
    }
  }

  return null;
}

async function main() {
  const payload = await getPayload({ config });
  const files = await readdir(PICTURES_DIR);

  const vendors = await payload.find({
    collection: "vendors",
    where: { slug: { equals: "wingover" } },
    limit: 1,
    overrideAccess: true,
  });
  const vendor = vendors.docs[0];
  if (!vendor) throw new Error('Vendor "wingover" not found');

  const products = await payload.find({
    collection: "products",
    where: {
      and: [{ vendor: { equals: vendor.id } }, { isArchived: { not_equals: true } }],
    },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  });

  console.log(`Found ${files.length} files in ${PICTURES_DIR}`);
  console.log(`Wingover products: ${products.docs.length}\n`);

  for (const product of products.docs) {
    const resolved = await resolveFileName(product.name, files);
    if (!resolved) {
      console.log(`• Skip (no matching image): ${product.name}`);
      continue;
    }

    const buffer = await readFile(resolved.path);
    const safeName = resolved.fileName.trim().replace(/\s+/g, "_");

    const media = await payload.create({
      collection: "media",
      overrideAccess: true,
      data: { alt: product.name },
      file: {
        data: buffer,
        mimetype: "image/png",
        name: safeName,
        size: buffer.length,
      },
    });

    await payload.update({
      collection: "products",
      id: product.id,
      overrideAccess: true,
      data: { image: media.id },
    });

    console.log(`✅ ${product.name} ← ${resolved.fileName} (${media.id})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
