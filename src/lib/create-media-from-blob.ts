import type { BasePayload } from "payload";
import type { Media, User } from "@/payload-types";

export type CreateMediaFromBlobInput = {
  url: string;
  filename: string;
  mimeType?: string;
  filesize?: number;
  alt?: string;
};

/**
 * Create a `media` document from an existing Blob URL (server-side upload path).
 * Uses the DB adapter directly so Payload does not mkdir/write local files (required on Vercel).
 */
export async function createMediaFromBlobUrl(
  payload: BasePayload,
  _user: User,
  input: CreateMediaFromBlobInput,
) {
  const alt =
    input.alt?.trim() ||
    input.filename.trim() ||
    input.url.split("/").pop() ||
    "uploaded-file";

  const data = {
    alt,
    filename: input.filename,
    url: input.url,
    ...(input.mimeType ? { mimeType: input.mimeType } : {}),
    ...(input.filesize && input.filesize > 0 ? { filesize: input.filesize } : {}),
  } satisfies Pick<Media, "alt" | "filename" | "url"> &
    Partial<Pick<Media, "mimeType" | "filesize">>;

  const result = await payload.db.create({
    collection: "media",
    data,
  });

  if (!result?.id) {
    throw new Error("Failed to create media document: No ID returned from database");
  }

  const media = await payload.findByID({
    collection: "media",
    id: result.id,
    overrideAccess: true,
  });

  return media;
}
