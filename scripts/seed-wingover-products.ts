/**
 * Create 5 sample products for Wingover using existing media IDs.
 *
 * Usage: npx tsx scripts/seed-wingover-products.ts
 */
import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

const WINGOVER_SLUG = "wingover";

function lexicalParagraph(text: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          children: [
            {
              type: "text",
              detail: 0,
              format: 0,
              mode: "normal" as const,
              style: "",
              text,
              version: 1,
            },
          ],
        },
      ],
    },
  };
}

/** Existing media document IDs from the local DB (reuse, do not re-upload). */
const PRODUCTS: Array<{
  name: string;
  price: number;
  imageId: string;
  description: ReturnType<typeof lexicalParagraph>;
}> = [
  {
    name: "Sunlit Linen Midi Dress",
    price: 68,
    imageId: "6a11b11f09ce226d49da0bd6",
    description: lexicalParagraph("Light midi dress with soft drape — everyday elegant."),
  },
  {
    name: "Coral Garden Suit Set",
    price: 72,
    imageId: "6a11b2cf09ce226d49da0cdc",
    description: lexicalParagraph("Coordinated suit set in warm coral tones."),
  },
  {
    name: "Lilac Whisper Kurta Set",
    price: 64,
    imageId: "6a11b0b009ce226d49da0b8a",
    description: lexicalParagraph("Soft lilac kurta set with delicate detailing."),
  },
  {
    name: "Mehfil Motif Kurta",
    price: 58,
    imageId: "6a11b01e09ce226d49da0b2a",
    description: lexicalParagraph("Statement kurta with festive motif accents."),
  },
  {
    name: "Royal Gulnaar Ensemble",
    price: 84,
    imageId: "6a11b25409ce226d49da0c36",
    description: lexicalParagraph("Rich embroidered ensemble for special evenings."),
  },
];

async function main() {
  const payload = await getPayload({ config });

  const vendors = await payload.find({
    collection: "vendors",
    where: { slug: { equals: WINGOVER_SLUG } },
    limit: 1,
  });
  const vendor = vendors.docs[0];
  if (!vendor) {
    throw new Error(`Vendor "${WINGOVER_SLUG}" not found`);
  }

  console.log(`Creating products for ${vendor.name} (${vendor.id})...`);

  for (const item of PRODUCTS) {
    const media = await payload.findByID({
      collection: "media",
      id: item.imageId,
      depth: 0,
    }).catch(() => null);

    if (!media) {
      console.warn(`⚠ Skipping "${item.name}" — media ${item.imageId} not found`);
      continue;
    }

    const existing = await payload.find({
      collection: "products",
      where: {
        and: [
          { vendor: { equals: vendor.id } },
          { name: { equals: item.name } },
        ],
      },
      limit: 1,
    });

    if (existing.docs[0]) {
      console.log(`• Already exists: ${item.name}`);
      continue;
    }

    const product = await payload.create({
      collection: "products",
      overrideAccess: true,
      data: {
        name: item.name,
        price: item.price,
        vendor: vendor.id,
        image: item.imageId,
        description: item.description,
        isPrivate: false,
        isArchived: false,
        refundPolicy: "30-day",
        variants: [
          {
            variantData: { size: "M" },
            stock: 12,
            price: item.price,
          },
        ],
      },
    });

    console.log(`✅ Created: ${product.name} (${product.id})`);
  }

  const count = await payload.find({
    collection: "products",
    where: {
      and: [
        { vendor: { equals: vendor.id } },
        { isArchived: { not_equals: true } },
      ],
    },
    limit: 1,
  });
  console.log(`\nWingover public products now: ${count.totalDocs}`);
  console.log("View storefront: /vendors/wingover");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
