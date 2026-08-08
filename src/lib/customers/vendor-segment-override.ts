import type { CustomerSegmentId } from "@/lib/customers/customer-segments";

export type VendorSegmentOverrideDoc = {
  vendor?: string | { id?: string } | null;
  segment?: CustomerSegmentId | null;
  reason?: string | null;
  setBy?: string | { id?: string } | null;
  setAt?: string | null;
};

export type VendorSegmentOverride = {
  segment: CustomerSegmentId;
  reason: string;
  setBy: string | null;
  setAt: string;
};

function getRelationshipId(value: string | { id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

export function getVendorSegmentOverride(
  customer: { vendorSegmentOverrides?: VendorSegmentOverrideDoc[] | null },
  vendorId: string,
): VendorSegmentOverride | null {
  const overrides = customer.vendorSegmentOverrides ?? [];

  for (const entry of overrides) {
    const entryVendorId = getRelationshipId(entry.vendor ?? null);
    if (entryVendorId !== vendorId || !entry.segment) continue;

    return {
      segment: entry.segment,
      reason: entry.reason?.trim() || "",
      setBy: getRelationshipId(entry.setBy ?? null),
      setAt: entry.setAt ?? new Date().toISOString(),
    };
  }

  return null;
}

export function resolveDisplaySegment(
  systemSegment: CustomerSegmentId | null,
  override: VendorSegmentOverride | null,
): CustomerSegmentId | null {
  return override?.segment ?? systemSegment;
}

export function buildVendorSegmentOverridesUpdate(
  existing: VendorSegmentOverrideDoc[] | null | undefined,
  vendorId: string,
  input:
    | { mode: "automatic" }
    | { mode: "manual"; segment: CustomerSegmentId; reason: string; setBy: string },
): VendorSegmentOverrideDoc[] {
  const remaining = (existing ?? []).filter(
    (entry) => getRelationshipId(entry.vendor ?? null) !== vendorId,
  );

  if (input.mode === "automatic") {
    return remaining;
  }

  return [
    ...remaining,
    {
      vendor: vendorId,
      segment: input.segment,
      reason: input.reason,
      setBy: input.setBy,
      setAt: new Date().toISOString(),
    },
  ];
}
