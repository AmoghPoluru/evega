"use client";

import Image from "next/image";
import Link from "next/link";
import type { HappyBannerTile } from "@/lib/happy-banner/types";
import { cn } from "@/lib/utils";

interface HappyBannerTileProps {
  tile: HappyBannerTile;
  size: number;
  spotlight?: boolean;
  className?: string;
}

export function HappyBannerTileView({
  tile,
  size,
  spotlight = false,
  className,
}: HappyBannerTileProps) {
  return (
    <Link
      href={`/products/${tile.slug}`}
      className={cn(
        "hb-tile relative shrink-0 overflow-hidden rounded-full border-2 border-white/20 shadow-lg transition-transform duration-500",
        spotlight && "scale-110 ring-2 ring-white/60",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: tile.color,
      }}
      aria-label={tile.name}
    >
      <Image src={tile.image} alt="" fill sizes={`${size}px`} className="object-cover" />
    </Link>
  );
}
