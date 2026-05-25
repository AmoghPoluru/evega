import type { BasePayload } from "payload";
import type { User } from "@/payload-types";
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

  const data: Record<string, unknown> = {
    alt,
    filename: input.filename,
    url: input.url,
  };

  if (input.mimeType) {
    data.mimeType = input.mimeType;
  }
  if (input.filesize && input.filesize > 0) {
    data.filesize = input.filesize;
  }

  return payload.create({
    collection: "media",
    data,
    overrideAccess: true,
    req: payloadReqFromUser(user),
  });
}
