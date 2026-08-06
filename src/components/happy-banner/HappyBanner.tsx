"use client";

import type { ResolvedHappyBanner } from "@/lib/happy-banner/types";
import {
  ConfettiPreset,
  CrossfirePreset,
  GravityWellPreset,
  KineticWallPreset,
  LiquidRibbonPreset,
  MarqueeMaxPreset,
  StaticGridPreset,
} from "./presets";
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
    const stops = bg.palette.map((c, i) => `${c} ${(i / (bg.palette.length - 1 || 1)) * 100}%`).join(", ");
    return (
      <div
        className="absolute inset-0 opacity-90"
        style={{ background: `linear-gradient(120deg, ${stops})` }}
      />
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

export function HappyBanner({ banner }: { banner: ResolvedHappyBanner }) {
  if (!banner.enabled) return null;

  return (
    <section
      className="happy-banner relative w-full overflow-hidden"
      style={{ minHeight: banner.geometry.height }}
      aria-label={banner.header}
    >
      <AtmosphereLayer banner={banner} />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 py-10 text-center md:py-14">
        <h1
          className="template-type-hero-title mb-2 max-w-3xl text-balance text-white drop-shadow-md"
          style={{ textShadow: "var(--template-hero-text-shadow, 2px 2px 8px rgba(0,0,0,.45))" }}
        >
          {banner.header}
        </h1>
        {banner.tagline ? (
          <p
            className="template-type-hero-subtitle mb-8 max-w-2xl text-balance text-white/90"
            style={{ textShadow: "var(--template-hero-text-shadow)" }}
          >
            {banner.tagline}
          </p>
        ) : (
          <div className="mb-8" />
        )}
        <div className="w-full max-w-6xl">
          <MotionProvider intensity={banner.motion.intensity} speedMultiplier={banner.motion.speed}>
            <PresetSwitch banner={banner} />
          </MotionProvider>
        </div>
      </div>
    </section>
  );
}

export function HappyBannerSection({ banner }: { banner: ResolvedHappyBanner }) {
  return <HappyBanner banner={banner} />;
}
