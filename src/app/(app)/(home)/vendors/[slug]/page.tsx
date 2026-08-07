import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { cssVariablesToString } from "@/lib/templates/css-variables";
import { canPreviewVendorTemplate } from "@/lib/templates/template-preview-auth";
import {
  loadApprovedVendorBySlug,
  loadVendorStorefrontPageData,
} from "@/lib/templates/load-vendor-storefront-page";
import { VendorStorefront } from "@/components/vendor/VendorStorefront";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ previewTemplate?: string }>;
}

export default async function VendorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { previewTemplate } = await searchParams;

  const payload = await getPayload({ config });
  const vendor = await loadApprovedVendorBySlug(payload, slug);

  if (!vendor) {
    notFound();
  }

  const previewAllowed =
    Boolean(previewTemplate) && (await canPreviewVendorTemplate(payload, vendor.id));

  const storefront = await loadVendorStorefrontPageData(payload, vendor, {
    previewTemplateId: previewAllowed ? previewTemplate : undefined,
  });

  const cssVariables = cssVariablesToString(storefront.resolvedTemplate.cssVariables);

  return (
    <>
      {storefront.previewMode ? (
        <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          Template preview — this layout is not saved until you click Select.
        </div>
      ) : null}
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
    </>
  );
}
