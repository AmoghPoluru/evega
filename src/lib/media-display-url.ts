/**
 * Resolve a public HTTPS URL for media (required for OpenAI Vision).
 */
export type MediaLike = Record<string, unknown>;

function isAbsoluteBlobUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    const host = new URL(value).hostname.toLowerCase();
    return (
      host.endsWith(".public.blob.vercel-storage.com") ||
      host.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export function resolveMediaDisplayUrl(media: MediaLike | null | undefined): string | null {
  if (!media) return null;

  const raw = media.url;
  if (typeof raw === "string" && raw.trim() !== "") {
    const url = raw.trim();
    if (isAbsoluteBlobUrl(url)) return url;
    if (/^https?:\/\//i.test(url)) return url;
  }

  const sizes = media.sizes as Record<string, { url?: string | null } | undefined> | undefined;
  if (sizes && typeof sizes === "object") {
    for (const key of ["card", "desktop", "tablet", "thumbnail"] as const) {
      const candidate = sizes[key]?.url;
      if (typeof candidate === "string" && candidate.trim() !== "") {
        const url = candidate.trim();
        if (isAbsoluteBlobUrl(url) || /^https?:\/\//i.test(url)) return url;
      }
    }
  }

  return null;
}
