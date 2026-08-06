"use client";

import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import { MarqueeTrack } from "./MarqueeTrack";

/** Split tiles into `rows` interleaved groups so each row shows a varied mix. */
function splitRows(tiles: ResolvedHappyBanner["tiles"], rows: number) {
  return Array.from({ length: rows }, (_, row) =>
    tiles.filter((_tile, index) => index % rows === row),
  ).filter((group) => group.length > 0);
}

/**
 * Three overlapping depth rows: a small blurred back row, a mid row, and a
 * crisp front row, each with its own speed, direction and parallax depth.
 */
export function MarqueeMaxPreset({ banner }: { banner: ResolvedHappyBanner }) {
  const rows = splitRows(banner.tiles, 3);
  const { tileSize } = banner.geometry;

  const rowStyles = [
    { scale: 0.44, opacity: 0.4, blur: "blur-[2px]", speed: 0.42, depth: 0.3, reverse: false },
    { scale: 0.7, opacity: 0.78, blur: "blur-[1px]", speed: 0.65, depth: 0.6, reverse: true },
    { scale: 1, opacity: 1, blur: "", speed: 1, depth: 1, reverse: false },
  ];

  return (
    <div className="relative flex flex-col justify-center">
      {rows.map((tiles, index) => {
        const style = rowStyles[index] ?? rowStyles[rowStyles.length - 1];
        return (
          <div
            key={index}
            className={style.blur}
            style={{
              opacity: style.opacity,
              zIndex: index,
              marginTop: index === 0 ? 0 : `-${Math.round(tileSize * style.scale * 0.25)}px`,
            }}
          >
            <MarqueeTrack
              tiles={tiles}
              tileSize={Math.round(tileSize * style.scale)}
              rowIndex={index}
              reverse={style.reverse}
              depth={style.depth}
              speedFactor={style.speed}
            />
          </div>
        );
      })}
    </div>
  );
}

export function KineticWallPreset({ banner }: { banner: ResolvedHappyBanner }) {
  const rows = splitRows(banner.tiles, 4);

  return (
    <div className="flex flex-col gap-0">
      {rows.map((tiles, index) => (
        <MarqueeTrack
          key={index}
          tiles={tiles}
          tileSize={Math.round(banner.geometry.tileSize * 0.85)}
          rowIndex={index}
          reverse={index % 2 === 1}
          gap={8}
          depth={0.4 + index * 0.2}
          speedFactor={0.6 + index * 0.15}
        />
      ))}
    </div>
  );
}

export function CrossfirePreset({ banner }: { banner: ResolvedHappyBanner }) {
  const [top = [], bottom = []] = splitRows(banner.tiles, 2);

  return (
    <div className="flex flex-col gap-4">
      <div style={{ transform: "rotate(-8deg)" }}>
        <MarqueeTrack
          tiles={top}
          tileSize={banner.geometry.tileSize}
          rowIndex={0}
          depth={0.7}
          speedFactor={1.1}
        />
      </div>
      <div style={{ transform: "rotate(6deg)" }}>
        <MarqueeTrack
          tiles={bottom}
          tileSize={Math.round(banner.geometry.tileSize * 0.8)}
          rowIndex={1}
          reverse
          depth={1}
          speedFactor={0.7}
        />
      </div>
    </div>
  );
}

export function GravityWellPreset({ banner }: { banner: ResolvedHappyBanner }) {
  return (
    <div className="hb-gravity-well flex justify-center py-6">
      <MarqueeTrack
        tiles={banner.tiles}
        tileSize={banner.geometry.tileSize + 16}
        rowIndex={0}
        gap={24}
        depth={1.2}
      />
    </div>
  );
}

export function LiquidRibbonPreset({ banner }: { banner: ResolvedHappyBanner }) {
  return (
    <div className="hb-liquid-ribbon py-8">
      <MarqueeTrack
        tiles={banner.tiles}
        tileSize={banner.geometry.tileSize}
        rowIndex={0}
        gap={20}
        speedFactor={0.8}
      />
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
        <a
          key={tile.id}
          href={`/products/${tile.slug}`}
          className="hb-static-tile relative block overflow-hidden rounded-full"
          style={{ width: banner.geometry.tileSize, height: banner.geometry.tileSize }}
          aria-label={tile.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tile.image}
            alt=""
            width={banner.geometry.tileSize}
            height={banner.geometry.tileSize}
            className="h-full w-full rounded-full object-cover"
          />
        </a>
      ))}
    </div>
  );
}
