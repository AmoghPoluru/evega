export const STYLE_PRESET_IDS = [
  "minimal",
  "elegant",
  "bold",
  "zen",
  "editorial",
  "warm",
] as const;

export type StylePresetId = (typeof STYLE_PRESET_IDS)[number];

export function isStylePresetId(value: string): value is StylePresetId {
  return STYLE_PRESET_IDS.includes(value as StylePresetId);
}
