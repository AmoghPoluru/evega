import type { MotionIntensity } from "./types";

export const INTENSITY = {
  calm: {
    speed: 0.6,
    idle: 0.5,
    parallax: 0,
    spotlight: null as number | null,
    particles: false,
    pxPerSecond: 28,
  },
  lively: {
    speed: 1.0,
    idle: 1.0,
    parallax: 16,
    spotlight: 8000,
    particles: true,
    pxPerSecond: 48,
  },
  showcase: {
    speed: 1.5,
    idle: 1.6,
    parallax: 36,
    spotlight: 5000,
    particles: true,
    pxPerSecond: 72,
  },
} as const satisfies Record<
  MotionIntensity,
  {
    speed: number;
    idle: number;
    parallax: number;
    spotlight: number | null;
    particles: boolean;
    pxPerSecond: number;
  }
>;

export function effectiveIntensity(
  requested: MotionIntensity,
  reducedMotion: boolean,
  lowPower: boolean,
): MotionIntensity {
  if (reducedMotion || lowPower) return "calm";
  return requested;
}
