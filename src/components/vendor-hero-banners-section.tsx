"use client";

import Image from "next/image";
import Link from "next/link";
import type { inferRouterOutputs } from "@trpc/server";

import { BannerCarousel } from "@/components/banner-carousel";
import { VENDOR_HEAD_BANNER_ENABLED } from "@/lib/templates/vendor-storefront-flags";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

type VendorHeroBanner = inferRouterOutputs<AppRouter>["vendorHeroBanners"][number];
type VendorHeroBannerProduct = VendorHeroBanner["products"][number];

function VendorHeroBannerProductCard({ product }: { product: VendorHeroBannerProduct }) {
  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      <div className="relative h-full w-full rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
        {product.image ? (
          <div className="relative w-full h-3/4">
            <Image src={product.image} alt={product.name} fill className="object-contain p-2" />
          </div>
        ) : (
          <div className="w-full h-3/4 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-xs">No Image</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white text-xs font-semibold line-clamp-2 drop-shadow-lg group-hover:underline">
            {product.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}

interface VendorHeroBannersSectionProps {
  vendorSlug: string;
  /** When true, render regardless of the global VENDOR_HEAD_BANNER_ENABLED flag. */
  enabled?: boolean;
}

export function VendorHeroBannersSection({
  vendorSlug,
  enabled,
}: VendorHeroBannersSectionProps) {
  const isEnabled = enabled ?? VENDOR_HEAD_BANNER_ENABLED;
  const {
    data: banners,
    isLoading,
    error,
  } = trpc.vendorHeroBanners.useQuery({ vendorSlug }, { enabled: isEnabled });

  if (!isEnabled) return null;

  if (isLoading) {
    return (
      <div
        data-template-hero-banner
        className="relative w-full overflow-hidden bg-gray-200 animate-pulse"
      />
    );
  }

  // Fail silently on error or with no banners, falling back to the default vendor display.
  if (error || !banners || banners.length === 0) {
    return null;
  }

  return (
    <BannerCarousel<VendorHeroBannerProduct>
      banners={banners}
      titleAs="h1"
      templateSized
      getProductKey={(product) => product.id}
      renderProductCard={(product) => <VendorHeroBannerProductCard product={product} />}
      classNames={{
        flexRow: "h-[280px]",
        scrollRow: "h-[280px]",
        scrollItem: "w-[200px]",
      }}
    />
  );
}
