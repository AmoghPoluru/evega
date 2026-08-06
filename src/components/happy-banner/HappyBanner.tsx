"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import { cn } from "@/lib/utils";
import {
  ConfettiPreset,
  CrossfirePreset,
  GravityWellPreset,
  KineticWallPreset,
  LiquidRibbonPreset,
  MarqueeMaxPreset,
  StaticGridPreset,
} from "./presets";
import { SpotlightLayer } from "./layers/SpotlightLayer";
import { MotionProvider, useMotion } from "./MotionProvider";
import "./happy-banner.css";

function PresetSwitch({ banner }: { banner: ResolvedHappyBanner }) {
  const { reducedMotion } = useMotion();

  if (reducedMotion) {
    return <StaticGridPreset banner={banner} />;
  }

  switch (banner.preset) {
    case "kinetic-wall":
      return <KineticWallPreset banner={banner} />;
    case "crossfire":
      return <CrossfirePreset banner={banner} />;
    case "gravity-well":
      return <GravityWellPreset banner={banner} />;
    case "confetti":
      return <ConfettiPreset banner={banner} />;
    case "liquid-ribbon":
      return <LiquidRibbonPreset banner={banner} />;
    case "marquee-max":
    default:
      return <MarqueeMaxPreset banner={banner} />;
  }
}

function AtmosphereLayer({ banner }: { banner: ResolvedHappyBanner }) {
  const bg = banner.background;

  if (bg.mode === "image") {
    return (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg.url})` }}
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: bg.scrim }} />
      </>
    );
  }

  if (bg.mode === "gradient") {
    return (
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }}
      />
    );
  }

  if (bg.mode === "auto-palette" && bg.palette.length > 0) {
    // Blobs drift on their own long, unequal loops so the background colour
    // keeps shifting with the products currently on screen.
    const blobs = bg.palette.slice(0, 5);
    return (
      <div className="absolute inset-0 overflow-hidden bg-neutral-900">
        {blobs.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="hb-blob"
            style={{
              backgroundColor: color,
              width: `${34 + index * 8}%`,
              height: `${70 + index * 10}%`,
              left: `${(index * 23) % 80}%`,
              top: `${((index * 37) % 60) - 20}%`,
              ["--hb-blob-dur" as string]: `${18 + index * 3}s`,
              ["--hb-blob-delay" as string]: `${-index * 4}s`,
            }}
          />
        ))}
        <span className="hb-sweep pointer-events-none" aria-hidden />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, var(--template-accent, #6366f1), var(--template-primary, #312e81))",
      }}
    />
  );
}

function PauseControl() {
  const { playing, togglePlaying, reducedMotion } = useMotion();
  if (reducedMotion) return null;

  return (
    <button
      type="button"
      onClick={togglePlaying}
      aria-pressed={!playing}
      aria-label={playing ? "Pause banner motion" : "Play banner motion"}
      className="absolute bottom-4 left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
    >
      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
    </button>
  );
}

/** Screen readers get every product exactly once, without the marquee copies. */
function ProductListForAssistiveTech({ banner }: { banner: ResolvedHappyBanner }) {
  return (
    <ul className="sr-only">
      {banner.tiles.map((tile) => (
        <li key={tile.id}>
          <Link href={`/products/${tile.slug}`}>{tile.name}</Link>
        </li>
      ))}
    </ul>
  );
}

function BannerShell({ banner }: { banner: ResolvedHappyBanner }) {
  const { rootRef, playing, reducedMotion } = useMotion();

  return (
    <section
      ref={rootRef}
      className={cn("happy-banner relative w-full overflow-hidden", !playing && "hb-paused")}
      style={{ minHeight: banner.geometry.height }}
      aria-label={banner.header}
    >
      <AtmosphereLayer banner={banner} />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 py-10 text-center md:py-14">
        <h1
          className="template-type-hero-title hb-entrance mb-2 max-w-3xl text-balance text-white drop-shadow-md"
          style={{ textShadow: "var(--template-hero-text-shadow, 2px 2px 8px rgba(0,0,0,.45))" }}
        >
          {banner.header}
        </h1>
        {banner.tagline ? (
          <p
            className="template-type-hero-subtitle hb-entrance mb-8 max-w-2xl text-balance text-white/90"
            style={{ textShadow: "var(--template-hero-text-shadow)", animationDelay: "80ms" }}
          >
            {banner.tagline}
          </p>
        ) : (
          <div className="mb-8" />
        )}

        <div className={cn("hb-field w-full max-w-6xl", !reducedMotion && "hb-entrance")}>
          <PresetSwitch banner={banner} />
        </div>
      </div>

      <ProductListForAssistiveTech banner={banner} />
      {banner.motion.spotlight.enabled ? (
        <SpotlightLayer tiles={banner.tiles} intervalMs={banner.motion.spotlight.intervalMs} />
      ) : null}
      <PauseControl />
    </section>
  );
}

export function HappyBanner({ banner }: { banner: ResolvedHappyBanner }) {
  if (!banner.enabled || banner.tiles.length === 0) return null;

  return (
    <MotionProvider
      intensity={banner.motion.intensity}
      speedMultiplier={banner.motion.speed}
      direction={banner.motion.direction}
    >
      <BannerShell banner={banner} />
    </MotionProvider>
  );
}

export function HappyBannerSection({ banner }: { banner: ResolvedHappyBanner }) {
  return <HappyBanner banner={banner} />;
}
