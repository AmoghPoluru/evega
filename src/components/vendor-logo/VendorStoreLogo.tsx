"use client";

import Image from "next/image";
import type { ResolvedVendorLogoTemplate } from "@/lib/vendor-logo/types";
import { isWordmarkLogoPreset } from "@/lib/vendor-logo/types";
import { VendorLogoMark } from "./VendorLogoDisplay";

type VendorStoreLogoProps = {
  vendorName: string;
  uploadUrl?: string | null;
  templateLogo?: ResolvedVendorLogoTemplate | null;
  size?: number;
  className?: string;
  showFallbackInitial?: boolean;
  /** Prefer wider frame for wordmark presets (default true when wordmark). */
  preferWideTemplate?: boolean;
};

export function VendorStoreLogo({
  vendorName,
  uploadUrl,
  templateLogo,
  size = 48,
  className,
  showFallbackInitial = true,
}: VendorStoreLogoProps) {
  if (templateLogo) {
    const wordmark = isWordmarkLogoPreset(templateLogo.preset);
    return (
      <div className={className}>
        <VendorLogoMark logo={templateLogo} size={wordmark ? Math.max(size, 72) : size} />
      </div>
    );
  }

  if (uploadUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-white border border-white shadow-sm ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        <Image src={uploadUrl} alt={vendorName} fill className="object-contain p-1" sizes={`${size}px`} />
      </div>
    );
  }

  if (!showFallbackInitial) return null;

  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 border border-white shadow-sm ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <span className="text-lg font-bold text-white">{vendorName.charAt(0).toUpperCase()}</span>
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
    <div className={className ?? "h-28 w-28"}>
      <VendorLogoMark logo={templateLogo} size={112} />
    </div>
  );
}
