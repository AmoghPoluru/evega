import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import Image from "next/image";
import { ProductsList } from "@/components/product-filters/products-list";
import { VendorHeroBannersSection } from "@/components/vendor-hero-banners-section";
import { Suspense } from "react";

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

  // Helper function to extract text from rich text description
  const getDescriptionText = (description: any): string | null => {
    if (!description) return null;
    if (typeof description === 'string') return description;
    if (typeof description === 'object' && 'root' in description) {
      // Lexical rich text format - extract plain text
      const extractText = (node: any): string => {
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) {
          return node.map(extractText).join(' ');
        }
        if (node && typeof node === 'object') {
          if (node.text) return node.text;
          if (node.children) return extractText(node.children);
        }
        return '';
      };
      return extractText(description.root?.children || []).trim() || null;
    }
    return null;
  };

  const descriptionText = getDescriptionText(vendor.description);

  // Fallback banner data (if no vendor hero banners exist)
  const fallbackBannerTitle = vendor.name;
  const fallbackBannerSubtitle = descriptionText;
  const fallbackBackgroundImageUrl = vendor.coverImage && typeof vendor.coverImage === 'object' && vendor.coverImage.url
    ? vendor.coverImage.url
    : null;
  const fallbackFeaturedProducts = productsData.docs.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <Link 
              href="/"
              className="text-primary hover:underline"
            >
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-600">Vendors</span>
            <span>/</span>
            <span className="text-gray-600">{vendor.name}</span>
          </nav>

          {/* Prominent Vendor Details Section */}
          <div className="mb-8 bg-white rounded-lg border-2 border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                {/* Vendor Logo */}
                {vendor.logo && typeof vendor.logo === 'object' && vendor.logo.url ? (
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg border-4 border-white shadow-lg overflow-hidden bg-white">
                      <Image
                        src={vendor.logo.url}
                        alt={vendor.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-2xl md:text-3xl font-bold">
                        {vendor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                    {vendor.name}
                  </h1>
                  
                  {descriptionText && (
                    <p className="text-gray-700 text-base md:text-lg mb-4 line-clamp-3">
                      {descriptionText}
                    </p>
                  )}

                  {/* Contact Information */}
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm font-medium">Email:</span>
                        <a 
                          href={`mailto:${vendor.email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm md:text-base"
                        >
                          {vendor.email}
                        </a>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm font-medium">Phone:</span>
                        <a 
                          href={`tel:${vendor.phone}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm md:text-base"
                        >
                          {vendor.phone}
                        </a>
                      </div>
                    )}
                    {vendor.website && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm font-medium">Website:</span>
                        <a 
                          href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm md:text-base"
                        >
                          {vendor.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Product Count Badge */}
                  {productsData.totalDocs > 0 && (
                    <div className="mt-4 inline-block">
                      <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                        {productsData.totalDocs} {productsData.totalDocs === 1 ? 'Product' : 'Products'} Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner - Try vendor hero banners first, fallback to default */}
      <Suspense fallback={
        <div className="relative w-full overflow-hidden bg-white">
          {fallbackBackgroundImageUrl ? (
            <div className="relative h-[400px] lg:h-[500px]">
              <Image
                src={fallbackBackgroundImageUrl}
                alt={fallbackBannerTitle}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </div>
          ) : (
            <div className="h-[400px] lg:h-[500px] bg-gradient-to-r from-gray-800 to-gray-600" />
          )}
        </div>
      }>
        <VendorHeroBannersSection vendorSlug={slug} />
      </Suspense>

      {/* Fallback Banner (if no vendor hero banners) */}
      {!fallbackBackgroundImageUrl && fallbackFeaturedProducts.length === 0 && (
        <div className="relative w-full overflow-hidden bg-white">
          <div className="h-[400px] lg:h-[500px] bg-gradient-to-r from-gray-800 to-gray-600 flex items-center justify-center">
            <div className="text-center px-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                {fallbackBannerTitle}
              </h1>
              {fallbackBannerSubtitle && (
                <p className="text-lg md:text-xl text-white drop-shadow-lg">
                  {fallbackBannerSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {productsData.docs.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-500 text-lg">This vendor has no products available yet.</p>
            </div>
          ) : (
            <ProductsList 
              products={productsData.docs as any} 
              title={`Products (${productsData.totalDocs})`} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
