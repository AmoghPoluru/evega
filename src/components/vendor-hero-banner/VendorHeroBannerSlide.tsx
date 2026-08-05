"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

import {
  resolveProductImageUrl,
  type VendorHeroBannerProduct,
  type VendorHeroBannerSlideData,
} from "./types";

const CIRCLE_SIZE = 96;
const SCROLL_SPEED_PX = 0.6;

interface VendorHeroBannerSlideProps extends VendorHeroBannerSlideData {
  className?: string;
  bannerHeight?: number;
  interactive?: boolean;
}

function ProductCircle({
  product,
  interactive,
  size,
}: {
  product: VendorHeroBannerProduct;
  interactive: boolean;
  size: number;
}) {
  const imageUrl = resolveProductImageUrl(product.image);
  if (!imageUrl) return null;

  const circle = (
    <div
      className="shrink-0 overflow-hidden rounded-full shadow-md ring-2 ring-white/90"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={product.name}
        draggable={false}
        className="h-full w-full select-none object-cover"
      />
    </div>
  );

  if (interactive && product.slug) {
    return (
      <Link href={`/products/${product.slug}`} className="shrink-0">
        {circle}
      </Link>
    );
  }

  return circle;
}

function ScrollingProductImages({
  products,
  interactive,
  circleSize = CIRCLE_SIZE,
}: {
  products: VendorHeroBannerProduct[];
  interactive: boolean;
  circleSize?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  const withImages = useMemo(
    () => products.filter((product) => resolveProductImageUrl(product.image)),
    [products],
  );

  const loopItems = useMemo(() => {
    if (withImages.length === 0) return [];
    const copies = Math.max(6, Math.ceil(16 / withImages.length));
    const sequence = Array.from({ length: copies }, () => withImages).flat();
    return [...sequence, ...sequence];
  }, [withImages]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || loopItems.length === 0) return;

    let frameId = 0;
    let paused = false;

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };

    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);

    const tick = () => {
      if (!paused) {
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0) {
          offsetRef.current += SCROLL_SPEED_PX;
          if (offsetRef.current >= halfWidth) {
            offsetRef.current = 0;
          }
          track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
        }
      }
      frameId = window.requestAnimationFrame(tick);
    };

    const start = () => {
      frameId = window.requestAnimationFrame(tick);
    };

    const images = track.querySelectorAll("img");
    if (images.length === 0) {
      start();
      return () => {
        window.cancelAnimationFrame(frameId);
        track.removeEventListener("mouseenter", onEnter);
        track.removeEventListener("mouseleave", onLeave);
      };
    }

    let ready = 0;
    let started = false;
    const onReady = () => {
      ready += 1;
      if (!started && ready >= images.length) {
        started = true;
        start();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        onReady();
      } else {
        img.addEventListener("load", onReady, { once: true });
        img.addEventListener("error", onReady, { once: true });
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
      images.forEach((img) => {
        img.removeEventListener("load", onReady);
        img.removeEventListener("error", onReady);
      });
    };
  }, [loopItems]);

  if (loopItems.length === 0) return null;

  return (
    <div className="w-full overflow-hidden" style={{ height: circleSize }}>
      <div ref={trackRef} className="flex w-max items-center gap-4 will-change-transform">
        {loopItems.map((product, index) => (
          <ProductCircle
            key={`${product.id}-${index}`}
            product={product}
            interactive={interactive}
            size={circleSize}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Canonical vendor hero banner layout — shared by the vendor admin preview and live storefront.
 */
export function VendorHeroBannerSlide({
  title,
  subtitle,
  backgroundImage,
  products = [],
  className,
  bannerHeight = 300,
  interactive = false,
}: VendorHeroBannerSlideProps) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-white", className)}>
      <div className="relative" style={{ height: bannerHeight }}>
        {backgroundImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImage}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-600" />
        )}

        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="z-10 px-6 pb-4 pt-6">
            <h2 className="mb-2 text-2xl font-bold text-white drop-shadow-lg md:text-3xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="max-w-2xl text-base text-white drop-shadow-lg md:text-lg">{subtitle}</p>
            ) : null}
          </div>

          {products.length > 0 ? (
            <div className="z-10 w-full px-2 pb-5">
              <ScrollingProductImages products={products} interactive={interactive} />
            </div>
          ) : (
            <div className="px-6 pb-6">
              <p className="text-sm text-white/80">No products selected for banner</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
