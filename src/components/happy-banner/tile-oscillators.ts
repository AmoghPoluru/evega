import type { CSSProperties } from "react";

/** Deterministic 32-bit hash so a product always gets the same motion phase. */
function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Per-tile idle motion, expressed as CSS custom properties so the three
 * oscillators run on the compositor instead of the animation loop.
 *
 * Durations are coprime-ish and delays are negative, so tiles start mid-cycle
 * and never appear synchronized.
 */
export function tileOscillatorStyle(id: string, amplitudeScale: number): CSSProperties {
  const random = mulberry32(hashString(id));

  const bobDuration = 3 + random() * 2;
  const rotDuration = 4 + random() * 3;
  const breatheDuration = 5 + random() * 3;

  return {
    "--hb-bob-dur": `${bobDuration.toFixed(2)}s`,
    "--hb-bob-delay": `${(-random() * bobDuration).toFixed(2)}s`,
    "--hb-bob-amp": `${(6 * amplitudeScale).toFixed(2)}px`,
    "--hb-rot-dur": `${rotDuration.toFixed(2)}s`,
    "--hb-rot-delay": `${(-random() * rotDuration).toFixed(2)}s`,
    "--hb-rot-amp": `${(2.5 * amplitudeScale).toFixed(2)}deg`,
    "--hb-breathe-dur": `${breatheDuration.toFixed(2)}s`,
    "--hb-breathe-delay": `${(-random() * breatheDuration).toFixed(2)}s`,
    "--hb-breathe-amp": `${(0.02 * amplitudeScale).toFixed(3)}`,
  } as CSSProperties;
}
