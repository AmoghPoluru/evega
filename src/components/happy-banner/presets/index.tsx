"use client";

import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import { MarqueeTrack } from "./MarqueeTrack";

export function MarqueeMaxPreset({ banner }: { banner: ResolvedHappyBanner }) {
  const rows = 3;
  const chunk = Math.ceil(banner.tiles.length / rows) || 1;
  const rowTiles = Array.from({ length: rows }, (_, i) =>
    banner.tiles.slice(i * chunk, (i + 1) * chunk),
  ).filter((r) => r.length > 0);

  return (
    <div className="flex flex-col justify-center gap-1">
      {rowTiles.map((tiles, i) => (
        <MarqueeTrack
          key={i}
          tiles={tiles}
          tileSize={banner.geometry.tileSize}
          rowIndex={i}
          reverse={i % 2 === 1}
        />
      ))}
    </div>
  );
}

export function KineticWallPreset({ banner }: { banner: ResolvedHappyBanner }) {
  const rows = 4;
  const chunk = Math.ceil(banner.tiles.length / rows) || 1;
  const rowTiles = Array.from({ length: rows }, (_, i) =>
    banner.tiles.slice(i * chunk, (i + 1) * chunk),
  ).filter((r) => r.length > 0);

  return (
    <div className="flex flex-col gap-0">
      {rowTiles.map((tiles, i) => (
        <MarqueeTrack
          key={i}
          tiles={tiles}
          tileSize={Math.round(banner.geometry.tileSize * 0.85)}
          rowIndex={i}
          reverse={i % 2 === 1}
          gap={8}
        />
      ))}
    </div>
  );
}

export function CrossfirePreset({ banner }: { banner: ResolvedHappyBanner }) {
  const mid = Math.ceil(banner.tiles.length / 2);
  const top = banner.tiles.slice(0, mid);
  const bottom = banner.tiles.slice(mid);

  return (
    <div className="flex flex-col gap-4">
      <MarqueeTrack tiles={top} tileSize={banner.geometry.tileSize} rowIndex={0} />
      <MarqueeTrack tiles={bottom} tileSize={banner.geometry.tileSize} rowIndex={1} reverse />
    </div>
  );
}

export function GravityWellPreset({ banner }: { banner: ResolvedHappyBanner }) {
  return (
    <div className="hb-gravity-well flex justify-center py-6">
      <MarqueeTrack tiles={banner.tiles} tileSize={banner.geometry.tileSize + 16} rowIndex={0} gap={24} />
    </div>
  );
}

export function LiquidRibbonPreset({ banner }: { banner: ResolvedHappyBanner }) {
  return (
    <div className="hb-liquid-ribbon py-8">
      <MarqueeTrack tiles={banner.tiles} tileSize={banner.geometry.tileSize} rowIndex={0} gap={20} />
    </div>
  );
}

export function ConfettiPreset({ banner }: { banner: ResolvedHappyBanner }) {
  return (
    <div className="hb-confetti relative">
      <div className="hb-confetti-layer pointer-events-none absolute inset-0" aria-hidden />
      <MarqueeTrack tiles={banner.tiles} tileSize={banner.geometry.tileSize} rowIndex={0} />
    </div>
  );
}

export function StaticGridPreset({ banner }: { banner: ResolvedHappyBanner }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-6">
      {banner.tiles.slice(0, 12).map((tile) => (
        <div key={tile.id} className="hb-static-tile">
          <img
            src={tile.image}
            alt={tile.name}
            width={banner.geometry.tileSize}
            height={banner.geometry.tileSize}
            className="rounded-full object-cover"
            style={{ width: banner.geometry.tileSize, height: banner.geometry.tileSize }}
          />
        </div>
      ))}
    </div>
  );
}
