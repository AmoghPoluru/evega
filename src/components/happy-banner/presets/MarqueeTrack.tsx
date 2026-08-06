"use client";

import { useEffect, useRef, useState } from "react";
import type { HappyBannerTile } from "@/lib/happy-banner/types";
import { useMotion } from "../MotionProvider";
import { HappyBannerTileView } from "../HappyBannerTile";

interface MarqueeTrackProps {
  tiles: HappyBannerTile[];
  tileSize: number;
  rowIndex: number;
  reverse?: boolean;
  gap?: number;
}

export function MarqueeTrack({
  tiles,
  tileSize,
  rowIndex,
  reverse = false,
  gap = 16,
}: MarqueeTrackProps) {
  const { subscribe, pxPerSecond, reducedMotion, paused, setPaused } = useMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const [loopWidth, setLoopWidth] = useState(0);
  const doubled = [...tiles, ...tiles];

  useEffect(() => {
    if (!trackRef.current) return;
    const w = trackRef.current.scrollWidth / 2;
    setLoopWidth(w);
  }, [tiles, tileSize, gap]);

  useEffect(() => {
    if (reducedMotion || loopWidth <= 0) return;
    const dir = reverse ? 1 : -1;
    return subscribe((dt) => {
      if (paused) return;
      offsetRef.current += pxPerSecond * dt * dir * (0.85 + rowIndex * 0.08);
      let o = offsetRef.current % loopWidth;
      if (o > 0) o -= loopWidth;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${o}px,0,0)`;
      }
    });
  }, [subscribe, pxPerSecond, reducedMotion, paused, loopWidth, reverse, rowIndex]);

  return (
    <div
      className="hb-track-row overflow-hidden py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={trackRef} className="flex w-max will-change-transform" style={{ gap }}>
        {doubled.map((tile, i) => (
          <HappyBannerTileView key={`${tile.id}-${i}`} tile={tile} size={tileSize} />
        ))}
      </div>
    </div>
  );
}
