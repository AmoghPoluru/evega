import { getCachedPayload } from "@/lib/payload-client";
import { getVendorStorefrontBrandingForProduct } from "@/lib/vendor-logo/storefront-branding";
import { StorefrontNavBrandingSync } from "./storefront-nav-branding-sync";

export const dynamic = "force-dynamic";

export default async function ProductPageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const payload = await getCachedPayload();
  const branding = await getVendorStorefrontBrandingForProduct(payload, productId);

  return (
    <>
      <StorefrontNavBrandingSync branding={branding} />
      {children}
    </>
  );
}
