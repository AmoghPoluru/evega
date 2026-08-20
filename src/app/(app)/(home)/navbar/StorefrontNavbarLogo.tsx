"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { VendorStoreLogo } from "@/components/vendor-logo/VendorStoreLogo";
import type { VendorStorefrontBranding } from "@/lib/vendor-logo/storefront-branding";
import Logo from "./Logo";

function getVendorSlugFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  const i = parts.indexOf("vendors");
  if (i >= 0 && parts[i + 1]) return decodeURIComponent(parts[i + 1]);
  return null;
}

function getProductIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  const i = parts.indexOf("products");
  if (i >= 0 && parts[i + 1]) return decodeURIComponent(parts[i + 1]);
  return null;
}

function formatSlugLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Top black navbar brand: Evega on marketplace pages, vendor logo/name on
 * boutique pages and product pages for that boutique.
 */
export function StorefrontNavbarLogo({
  pathname,
  layoutBranding,
}: {
  pathname: string | null;
  layoutBranding: VendorStorefrontBranding | null;
}) {
  const slugFromPath = getVendorSlugFromPath(pathname);
  const productId = getProductIdFromPath(pathname);

  const brandingBySlug = trpc.storefront.getVendorBranding.useQuery(
    { slug: slugFromPath ?? "" },
    { enabled: Boolean(slugFromPath) },
  );
  const brandingByProduct = trpc.storefront.getVendorBrandingByProductId.useQuery(
    { productId: productId ?? "" },
    { enabled: Boolean(productId) && !layoutBranding },
  );

  const branding = layoutBranding ?? brandingBySlug.data ?? brandingByProduct.data;
  const isLoading = slugFromPath
    ? brandingBySlug.isLoading
    : productId && !layoutBranding
      ? brandingByProduct.isLoading
      : false;

  const wantsVendorBrand = Boolean(slugFromPath || productId || layoutBranding);

  if (!wantsVendorBrand) {
    return <Logo />;
  }

  if (!isLoading && !branding) {
    return <Logo />;
  }

  const displayName =
    branding?.vendorName ??
    (slugFromPath ? formatSlugLabel(slugFromPath) : "Store");

  return (
    <Link
      href={branding?.slug ? `/vendors/${branding.slug}` : pathname || "/"}
      className="flex min-w-0 max-w-[min(100%,420px)] items-center gap-3 py-1 hover:opacity-90"
      aria-label={`${displayName} storefront`}
    >
      {isLoading && !branding ? (
        <div className="h-12 w-32 animate-pulse rounded-md bg-white/20" />
      ) : branding?.templateLogo ? (
        <VendorStoreLogo
          vendorName={branding.vendorName}
          templateLogo={branding.templateLogo}
          size={56}
        />
      ) : branding?.uploadLogoUrl ? (
        <VendorStoreLogo
          vendorName={branding.vendorName}
          uploadUrl={branding.uploadLogoUrl}
          size={52}
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/15 text-lg font-bold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <span className="truncate text-base font-bold leading-tight text-white sm:text-lg">
        {displayName}
      </span>
    </Link>
  );
}
