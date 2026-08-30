/**
 * Shared resolution of vendor-editable word slots (label / hint / default value).
 *
 * Vendor logos and happy banners both store two optional word slots on the design
 * document and fall back through the same ladder: slot override → document default
 * → preset default.
 */

export interface VendorWordSlotConfig {
  label?: string | null;
  hint?: string | null;
  defaultValue?: string | null;
}

export interface VendorWordSlotPreset {
  label: string;
  hint: string;
  defaultValue: string;
}

export type VendorWordSlot = VendorWordSlotPreset;

export function resolveVendorWordSlot(
  slot: VendorWordSlotConfig | null | undefined,
  docDefaultValue: string | null | undefined,
  preset: VendorWordSlotPreset,
): VendorWordSlot {
  return {
    label: slot?.label?.trim() || preset.label,
    hint: slot?.hint?.trim() || preset.hint,
    defaultValue:
      slot?.defaultValue?.trim() || docDefaultValue?.trim() || preset.defaultValue,
  };
}

/** Vendor-entered value wins when non-empty, otherwise the resolved default. */
export function resolveVendorWordValue(
  vendorValue: string | null | undefined,
  defaultValue: string,
): string {
  return vendorValue?.trim() || defaultValue;
}
