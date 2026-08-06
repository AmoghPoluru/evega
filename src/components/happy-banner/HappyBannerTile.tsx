"use client";

import Image from "next/image";
import Link from "next/link";
import type { HappyBannerTile } from "@/lib/happy-banner/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useMotion } from "./MotionProvider";
import { tileOscillatorStyle } from "./tile-oscillators";

interface HappyBannerTileProps {
  tile: HappyBannerTile;
  size: number;
  spotlight?: boolean;
  /** Duplicated marquee copies are hidden from assistive tech and tab order. */
  decorative?: boolean;
  className?: string;
}

export function HappyBannerTileView({
  tile,
  size,
  spotlight = false,
  decorative = false,
  className,
}: HappyBannerTileProps) {
  const { setSlowed, idleScale, reducedMotion } = useMotion();

  const hold = () => setSlowed(true);
  const release = () => setSlowed(false);

  return (
    <div
      className="hb-tile-slot shrink-0"
      style={reducedMotion ? undefined : tileOscillatorStyle(tile.id, idleScale)}
    >
      <Link
        href={`/products/${tile.slug}`}
        aria-hidden={decorative || undefined}
        tabIndex={decorative ? -1 : undefined}
        onMouseEnter={hold}
        onMouseLeave={release}
        onFocus={hold}
        onBlur={release}
        className={cn(
          "hb-tile group relative block overflow-visible outline-none",
          spotlight && "hb-tile-spotlight",
          className,
        )}
        style={{ width: size, height: size, ["--hb-tile-color" as string]: tile.color }}
        aria-label={decorative ? undefined : tile.name}
      >
        <span className="hb-tile-face relative block h-full w-full overflow-hidden rounded-full border-2 border-white/25 shadow-lg">
          <Image
            src={tile.image}
            alt=""
            fill
            sizes={`${size}px`}
            className="object-cover"
            style={{ backgroundColor: tile.color }}
          />
        </span>

        <span className="hb-tile-pill pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white md:block">
          {tile.name}
          {tile.price != null ? ` · ${formatCurrency(tile.price)}` : ""}
        </span>
      </Link>
    </div>
  );
}
