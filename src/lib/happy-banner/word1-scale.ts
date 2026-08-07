/** Reference character count for headline sizing (e.g. SUMMER = 6). */
export const HAPPY_BANNER_WORD1_REF_LENGTH = 6;

/**
 * Scale factor so short Word 1 (EID) fills similar space as longer defaults (SUMMER).
 * Long words scale down gently; short words scale up (capped).
 */
export function getHappyBannerWord1Scale(word1: string): number {
  const length = Math.max(word1.trim().length, 1);
  const ratio = HAPPY_BANNER_WORD1_REF_LENGTH / length;
  return Math.min(2.5, Math.max(0.75, ratio));
}
