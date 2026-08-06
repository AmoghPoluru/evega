"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HappyBannerTile } from "@/lib/happy-banner/types";
import { formatCurrency } from "@/lib/utils";
import { useMotion } from "../MotionProvider";

interface SpotlightLayerProps {
  tiles: HappyBannerTile[];
  intervalMs: number;
}

const HOLD_MS = 3000;

/**
 * Periodically features one product as a hero card, cycling round-robin so the
 * whole catalog window gets screen time. Driven by a timer rather than the
 * animation clock — it changes every few seconds, not every frame.
 */
export function SpotlightLayer({ tiles, intervalMs }: SpotlightLayerProps) {
  const { reducedMotion, playing } = useMotion();
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    if (reducedMotion || !playing || tiles.length === 0) return;

    let hideTimer: ReturnType<typeof setTimeout>;
    const cycle = setInterval(() => {
      setIndex((prev) => (prev + 1) % tiles.length);
      hideTimer = setTimeout(() => setIndex(-1), HOLD_MS);
    }, Math.max(intervalMs, HOLD_MS + 1000));

    return () => {
      clearInterval(cycle);
      clearTimeout(hideTimer);
    };
  }, [reducedMotion, playing, tiles.length, intervalMs]);

  const tile = index >= 0 ? tiles[index] : null;
  if (!tile) return null;

  return (
    <Link
      href={`/products/${tile.slug}`}
      className="hb-spotlight absolute bottom-4 right-4 z-30 flex max-w-[16rem] items-center gap-3 rounded-2xl bg-black/70 p-3 text-left backdrop-blur-sm"
      style={{ boxShadow: `0 0 40px -8px ${tile.color}` }}
    >
      <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        <Image src={tile.image} alt="" fill sizes="56px" className="object-cover" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-white">{tile.name}</span>
        {tile.price != null ? (
          <span className="block text-xs text-white/70">{formatCurrency(tile.price)}</span>
        ) : null}
      </span>
    </Link>
  );
}
