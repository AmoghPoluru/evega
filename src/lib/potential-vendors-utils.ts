/** One prospect name per line in staff UI; stored as array in Payload. */
export function potentialVendorsToTextarea(
  items: { name?: string | null; id?: string | null }[] | null | undefined
): string {
  if (!items?.length) return "";
  return items
    .map((item) => (item.name ?? "").trim())
    .filter(Boolean)
    .join("\n");
}

export function textareaToPotentialVendors(text: string): { name: string }[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}
