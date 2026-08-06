"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type ProductMediaRatio = "portrait" | "square" | "wide";
export type ProductMediaFit = "contain" | "cover";
export type ProductMediaMat = "surface" | "blur" | "none";

export const PRODUCT_MEDIA_RATIO: Record<ProductMediaRatio, string> = {
  portrait: "4 / 5",
  square: "1 / 1",
  wide: "4 / 3",
};

const PLACEHOLDER = "/placeholder.png";

export interface ProductMediaProps {
  src?: string | null;
  alt: string;
  ratio?: ProductMediaRatio;
  fit?: ProductMediaFit;
  mat?: ProductMediaMat;
  sizes: string;
  priority?: boolean;
  hoverSrc?: string | null;
  className?: string;
  children?: React.ReactNode;
}

export function ProductMedia({
  src,
  alt,
  ratio = "portrait",
  fit = "contain",
  mat = "blur",
  sizes,
  priority,
  hoverSrc,
  className,
  children,
}: ProductMediaProps) {
  const resolvedSrc = src ?? PLACEHOLDER;
  const showBlurMat = mat === "blur" && Boolean(src);
  const showSurfaceMat = mat === "surface" || (mat === "blur" && !src);

  return (
    <div
      data-ratio={ratio}
      className={cn("group relative isolate overflow-hidden", className)}
      style={{ aspectRatio: PRODUCT_MEDIA_RATIO[ratio] }}
    >
      {showBlurMat ? (
        <Image
          src={resolvedSrc}
          alt=""
          fill
          aria-hidden
          sizes={sizes}
          className="scale-110 object-cover opacity-[0.18] saturate-150 blur-2xl"
        />
      ) : null}
      {showSurfaceMat ? (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "color-mix(in srgb, var(--pm-mat, var(--template-card-bg, #fafafa)) 70%, transparent)" }}
        />
      ) : null}
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "relative z-[1] transition-transform duration-500 group-hover:scale-[1.03]",
          fit === "contain" ? "object-contain p-[var(--pm-pad,8%)]" : "object-cover",
        )}
      />
      {hoverSrc ? (
        <Image
          src={hoverSrc}
          alt=""
          fill
          sizes={sizes}
          className="relative z-[2] object-contain p-[var(--pm-pad,8%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      ) : null}
      {children}
    </div>
  );
}

export function ProductMediaSkeleton({ ratio = "portrait" }: { ratio?: ProductMediaRatio }) {
  return (
    <div
      style={{ aspectRatio: PRODUCT_MEDIA_RATIO[ratio] }}
      className="w-full animate-pulse rounded-md bg-neutral-200"
    />
  );
}
