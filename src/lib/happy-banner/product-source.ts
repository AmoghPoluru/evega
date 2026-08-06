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

  const sort =
    source === "newest"
      ? ("-createdAt" as const)
      : source === "best-sellers"
        ? ("-createdAt" as const)
        : ("-createdAt" as const);

  const result = await payload.find({
    collection: "products",
    where: baseWhere,
    sort,
    limit: shuffleWindow ? Math.min(maxTiles * 2, 60) : maxTiles,
    depth: 1,
    overrideAccess: true,
  });

  let docs = result.docs as Product[];
  if (shuffleWindow && docs.length > maxTiles) {
    docs = fisherYatesShuffle([...docs]).slice(0, maxTiles);
  }

  const tiles = docs.map(toTile).filter((t): t is HappyBannerTile => t !== null);
  return { tiles, total: result.totalDocs };
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
