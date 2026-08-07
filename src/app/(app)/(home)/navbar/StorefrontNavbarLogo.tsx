"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "@/trpc/client";
import { VendorStoreLogo } from "@/components/vendor-logo/VendorStoreLogo";
import Logo from "./Logo";

function getVendorSlugFromPath(pathname: string | null): string | null {
  if (!pathname?.startsWith("/vendors/")) return null;
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "vendors" || !parts[1]) return null;
  return parts[1];
}

function formatSlugLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Top black navbar brand: Evega on marketplace pages, vendor logo/name on /vendors/[slug].
 */
export function StorefrontNavbarLogo() {
  const pathname = usePathname();
  const slug = getVendorSlugFromPath(pathname);
  const isVendorStorefront = Boolean(slug);

  const { data: branding, isLoading } = trpc.storefront.getVendorBranding.useQuery(
    { slug: slug ?? "" },
    { enabled: isVendorStorefront },
  );

  if (!isVendorStorefront) {
    return <Logo />;
  }

  const displayName = branding?.vendorName ?? formatSlugLabel(slug!);

  return (
    <Link
      href={`/vendors/${branding?.slug ?? slug}`}
      className="flex min-w-0 max-w-[min(100%,420px)] items-center gap-3 py-1 hover:opacity-90"
      aria-label={`${displayName} storefront`}
    >
      {isLoading ? (
        <div className="h-12 w-32 animate-pulse rounded-md bg-white/20" />
      ) : branding?.templateLogo ? (
        <VendorStoreLogo
          vendorName={branding.vendorName}
          templateLogo={branding.templateLogo}
          size={52}
          preferWideTemplate
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
