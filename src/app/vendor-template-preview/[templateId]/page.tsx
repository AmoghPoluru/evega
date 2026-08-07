import { notFound } from "next/navigation";
import { getCachedPayload } from "@/lib/payload-client";
import { requireVendor } from "@/lib/middleware/vendor-auth";
import { loadVendorStorefrontPageData } from "@/lib/templates/load-vendor-storefront-page";
import { cssVariablesToString } from "@/lib/templates/css-variables";
import { VendorStorefront } from "@/components/vendor/VendorStorefront";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ templateId: string }>;
}

/** Authenticated iframe-friendly template preview for the vendor portal. */
export default async function VendorTemplatePreviewPage({ params }: Props) {
  const { templateId } = await params;
  const { vendor } = await requireVendor();

  if (!vendor.slug) {
    notFound();
  }

  const payload = await getCachedPayload();

  let storefront;
  try {
    storefront = await loadVendorStorefrontPageData(payload, vendor, {
      previewTemplateId: templateId,
    });
  } catch {
    notFound();
  }

  const cssVariables = cssVariablesToString(storefront.resolvedTemplate.cssVariables);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
        Template preview — this layout is not saved until you click Select.
      </div>
      <style>{`:root {
          ${cssVariables}
        }`}</style>
      <VendorStorefront
        vendor={storefront.vendor}
        template={storefront.resolvedTemplate}
        products={storefront.products}
        happyBanner={storefront.happyBanner}
        resolvedLogoTemplate={storefront.resolvedLogoTemplate}
      />
    </div>
  );
}
