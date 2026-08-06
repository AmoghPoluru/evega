import type { Payload } from "payload";
import type { Media, Product } from "@/payload-types";
import type { HappyBannerTile, ProductSourceMode } from "./types";

const DEFAULT_TILE_COLOR = "#6366f1";

function mediaUrl(media: string | Media | null | undefined): string | null {
  if (!media) return null;
  if (typeof media === "string") return null;
  return media.url ?? null;
}

function tileColorFromMedia(media: Media | null | undefined): string {
  const doc = media as Media & { dominantColor?: string | null };
  if (doc?.dominantColor && typeof doc.dominantColor === "string") {
    return doc.dominantColor;
  }
  return DEFAULT_TILE_COLOR;
}

function toTile(product: Product): HappyBannerTile | null {
  const imageMedia =
    product.image && typeof product.image === "object" ? (product.image as Media) : null;
  const image = mediaUrl(imageMedia);
  if (!image) return null;

  return {
    id: product.id,
    name: product.name,
    // Product detail routes are keyed by id (`/products/[id]`).
    slug: product.id,
    price: product.price != null ? Number(product.price) : null,
    image,
    blurDataURL: null,
    color: tileColorFromMedia(imageMedia),
    badge: null,
  };
}

export async function fetchHappyBannerProducts(
  payload: Payload,
  vendorId: string,
  source: ProductSourceMode,
  manualIds: string[],
  maxTiles: number,
  shuffleWindow: boolean,
): Promise<{ tiles: HappyBannerTile[]; total: number }> {
  const baseWhere = {
    vendor: { equals: vendorId },
    isPrivate: { equals: false },
    isArchived: { equals: false },
  };

  if (source === "manual" && manualIds.length > 0) {
    const result = await payload.find({
      collection: "products",
      where: {
        and: [baseWhere, { id: { in: manualIds } }],
      },
      limit: maxTiles,
      depth: 1,
      overrideAccess: true,
    });
    const order = new Map(manualIds.map((id, i) => [id, i]));
    const sorted = [...result.docs].sort(
      (a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999),
    );
    const tiles = sorted.map((p) => toTile(p as Product)).filter((t): t is HappyBannerTile => t !== null);
    return { tiles, total: tiles.length };
  }

  // `best-sellers` has no order-count aggregation yet and falls back to recency.
  const sort = "-createdAt" as const;

  const { totalDocs: total } = await payload.count({
    collection: "products",
    where: baseWhere,
    overrideAccess: true,
  });

  // Rotate the visible window once per day so the whole catalog gets exposure
  // while keeping the response deterministic — a random window would break
  // caching and cause SSR/CSR hydration mismatches.
  const page =
    shuffleWindow && total > maxTiles ? (dayIndex() % Math.ceil(total / maxTiles)) + 1 : 1;

  const result = await payload.find({
    collection: "products",
    where: baseWhere,
    sort,
    limit: maxTiles,
    page,
    depth: 1,
    overrideAccess: true,
  });

  const tiles = (result.docs as Product[])
    .map(toTile)
    .filter((t): t is HappyBannerTile => t !== null);

  return { tiles, total };
}

/** Whole days since the Unix epoch — stable for a calendar day in UTC. */
function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}
