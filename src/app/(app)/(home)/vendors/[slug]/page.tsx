import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { resolveVendorTemplate } from "@/lib/templates/template-engine";
import { cssVariablesToString } from "@/lib/templates/css-variables";
import { VendorStorefront } from "@/components/vendor/VendorStorefront";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function VendorPage({ params }: Props) {
  const { slug } = await params;

  const payload = await getPayload({ config });

  // Find vendor by slug with depth to populate heroBanner relationships
  const vendorsResult = await payload.find({
    collection: "vendors",
    where: {
      slug: { equals: slug },
      status: { equals: "approved" },
      isActive: { equals: true },
    },
    limit: 1,
    depth: 2, // Populate heroBanner.products and heroBanner.backgroundImage
  });

  if (vendorsResult.docs.length === 0) {
    notFound();
  }

  const vendor = vendorsResult.docs[0];

  // Fetch products for this vendor directly from Payload
  const productsData = await payload.find({
    collection: "products",
    where: {
      vendor: { equals: vendor.id },
      isPrivate: { equals: false },
      isArchived: { equals: false },
    },
    limit: 100,
    depth: 2, // Populate image, category, vendor relationships
    sort: "-createdAt",
  });

  // Resolve vendor template
  let resolvedTemplate;
  try {
    resolvedTemplate = await resolveVendorTemplate(vendor.id, payload);
  } catch (error) {
    console.error("❌ Error resolving vendor template:", error);
    // Fallback: continue without template
    resolvedTemplate = null;
  }

  // Generate CSS variables (injected globally so descendant layouts can use them)
  const cssVariables = resolvedTemplate
    ? cssVariablesToString(resolvedTemplate.cssVariables)
    : "";

  return (
    <>
      {cssVariables && (
        <style>{`:root {
          ${cssVariables}
        }`}</style>
      )}
      <VendorStorefront
        vendor={vendor}
        template={resolvedTemplate}
        products={productsData.docs}
      />
    </>
  );
}
