import type { BasePayload } from "payload";
import type { Media, User } from "@/payload-types";
import { payloadReqFromUser } from "@/lib/payload-req";

export type CreateMediaFromBlobInput = {
  url: string;
  filename: string;
  mimeType?: string;
  filesize?: number;
  alt?: string;
};

/**
 * Create a `media` document from an existing Blob URL (server-side upload path).
 * Uses overrideAccess so staff and vendors can upload in production.
 */
export async function createMediaFromBlobUrl(
  payload: BasePayload,
  user: User,
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

  return payload.create({
    collection: "media",
    data,
    overrideAccess: true,
    req: payloadReqFromUser(user),
  });
}
