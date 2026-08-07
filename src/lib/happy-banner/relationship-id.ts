/** Normalize a Payload relationship field to a document id string. */
export function getHappyBannerRelationshipId(
  value: string | { id: string } | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
