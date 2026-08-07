import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import type { TemplateCustomization } from "@/types/template-customization";
import {
  resolveVendorTemplate,
  resolveVendorTemplatePreview,
} from "@/lib/templates/template-engine";
import { buildFallbackResolvedTemplate } from "@/lib/templates/default-template";
import { cssVariablesToString } from "@/lib/templates/css-variables";
import { canPreviewVendorTemplate } from "@/lib/templates/template-preview-auth";
import { resolveHappyBannerForVendor } from "@/lib/happy-banner/resolve";
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

  const vendorsResult = await payload.find({
    collection: "vendors",
    where: {
      slug: { equals: slug },
      status: { equals: "approved" },
      isActive: { equals: true },
    },
    limit: 1,
    depth: 2,
  });

  if (vendorsResult.docs.length === 0) {
    notFound();
  }

  const vendor = vendorsResult.docs[0];

  const productsData = await payload.find({
    collection: "products",
    where: {
      vendor: { equals: vendor.id },
      isPrivate: { equals: false },
      isArchived: { equals: false },
    },
    limit: 100,
    depth: 2,
    sort: "-createdAt",
  });

  const previewAllowed =
    Boolean(previewTemplate) && (await canPreviewVendorTemplate(payload, vendor.id));

  let resolvedTemplate;
  try {
    if (previewAllowed && previewTemplate) {
      resolvedTemplate = await resolveVendorTemplatePreview(
        vendor.id,
        previewTemplate,
        payload,
      );
    } else {
      resolvedTemplate = await resolveVendorTemplate(vendor.id, payload);
    }
  } catch (error) {
    console.error("❌ Error resolving vendor template:", error);
    const customization =
      (vendor.templateCustomization as TemplateCustomization) || {};
    resolvedTemplate = buildFallbackResolvedTemplate(customization);
  }

  const cssVariables = cssVariablesToString(resolvedTemplate.cssVariables);
  const happyBanner = await resolveHappyBannerForVendor(payload, vendor);

  return (
    <>
      {previewAllowed ? (
        <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          Template preview — this layout is not saved until you click Select.
        </div>
      ) : null}
      <style>{`:root {
          ${cssVariables}
        }`}</style>
      <VendorStorefront
        vendor={vendor}
        template={resolvedTemplate}
        products={productsData.docs}
        happyBanner={happyBanner}
      />
    </>
  );
}
