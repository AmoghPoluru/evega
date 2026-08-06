"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HappyBannerTile } from "@/lib/happy-banner/types";
import { useMotion } from "../MotionProvider";
import { HappyBannerTileView } from "../HappyBannerTile";

interface MarqueeTrackProps {
  tiles: HappyBannerTile[];
  tileSize: number;
  rowIndex: number;
  reverse?: boolean;
  gap?: number;
  /** Parallax depth multiplier — back rows move less than front rows. */
  depth?: number;
  speedFactor?: number;
}

/** Never render more than this many tiles per row, whatever the catalog size. */
const MAX_TILES_PER_ROW = 40;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function MarqueeTrack({
  tiles,
  tileSize,
  rowIndex,
  reverse = false,
  gap = 16,
  depth = 1,
  speedFactor = 1,
}: MarqueeTrackProps) {
  const { subscribe, pxPerSecond, reducedMotion, direction, parallax, pointerRef } = useMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const [copies, setCopies] = useState(2);

  // Duplicate just enough to cover twice the viewport, instead of a fixed
  // multiplier that explodes the node count for large catalogs.
  useIsomorphicLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || tiles.length === 0) return;

    const measure = () => {
      const sequenceWidth = tiles.length * (tileSize + gap);
      const needed = Math.ceil((viewport.clientWidth * 2) / Math.max(sequenceWidth, 1));
      const capped = Math.min(Math.max(needed, 2), Math.ceil(MAX_TILES_PER_ROW / tiles.length) || 2);
      setCopies(Math.max(capped, 2));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [tiles.length, tileSize, gap]);

  useEffect(() => {
    if (reducedMotion || tiles.length === 0) return;

    const dirSign = (reverse ? 1 : -1) * (direction === "rtl" ? -1 : 1);

    return subscribe((dt) => {
      const track = trackRef.current;
      if (!track) return;

      const loopWidth = track.scrollWidth / 2;
      if (loopWidth <= 0) return;

      offsetRef.current += pxPerSecond * speedFactor * dt * dirSign;
      let offset = offsetRef.current % loopWidth;
      if (offset > 0) offset -= loopWidth;

      const drift = pointerRef.current.x * parallax * depth;
      track.style.transform = `translate3d(${offset + drift}px,0,0)`;
    });
  }, [
    subscribe,
    pxPerSecond,
    speedFactor,
    reducedMotion,
    reverse,
    direction,
    parallax,
    depth,
    pointerRef,
    tiles.length,
  ]);

  if (tiles.length === 0) return null;

  // The first copy carries the real links; the rest are visual filler.
  const sequence = Array.from({ length: copies * 2 }, (_, copyIndex) =>
    tiles.map((tile) => ({ tile, decorative: copyIndex > 0 })),
  ).flat();

  return (
    <div ref={viewportRef} className="hb-track-row overflow-hidden py-2" data-row={rowIndex}>
      <div ref={trackRef} className="flex w-max will-change-transform" style={{ gap }}>
        {sequence.map(({ tile, decorative }, index) => (
          <HappyBannerTileView
            key={`${tile.id}-${index}`}
            tile={tile}
            size={tileSize}
            decorative={decorative}
          />
        ))}
      </div>
    </div>
  );
}
