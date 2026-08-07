"use client";

import Image from "next/image";
import type { ResolvedVendorLogoTemplate } from "@/lib/vendor-logo/types";
import { VendorLogoDisplay, VendorLogoMark } from "./VendorLogoDisplay";

type VendorStoreLogoProps = {
  vendorName: string;
  uploadUrl?: string | null;
  templateLogo?: ResolvedVendorLogoTemplate | null;
  size?: number;
  className?: string;
  showFallbackInitial?: boolean;
  /** Use full wordmark for template logos (navbar / header). */
  preferWideTemplate?: boolean;
};

export function VendorStoreLogo({
  vendorName,
  uploadUrl,
  templateLogo,
  size = 40,
  className,
  showFallbackInitial = true,
  preferWideTemplate = false,
}: VendorStoreLogoProps) {
  if (templateLogo) {
    if (preferWideTemplate) {
      return (
        <div
          className={`overflow-hidden rounded-md bg-white/95 px-2 py-1 ${className ?? ""}`}
          style={{ height: size, maxWidth: Math.max(size * 4, 160) }}
        >
          <VendorLogoDisplay logo={templateLogo} className="h-full w-full" />
        </div>
      );
    }

    return (
      <div className={className} style={{ width: size, height: size }}>
        <VendorLogoMark logo={templateLogo} size={size} />
      </div>
    );
  }

  if (uploadUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded bg-white border border-white shadow-sm ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        <Image src={uploadUrl} alt={vendorName} fill className="object-contain p-1" sizes={`${size}px`} />
      </div>
    );
  }

  if (!showFallbackInitial) return null;

  return (
    <div
      className={`flex items-center justify-center rounded bg-gradient-to-br from-blue-400 to-purple-500 border border-white shadow-sm ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <span className="text-sm font-bold text-white">{vendorName.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export function VendorStoreLogoWide({
  templateLogo,
  className,
}: {
  templateLogo: ResolvedVendorLogoTemplate;
  className?: string;
}) {
  return (
    <div className={className ?? "h-24 w-full max-w-xs"}>
      <VendorLogoDisplay logo={templateLogo} />
    </div>
  );
}
