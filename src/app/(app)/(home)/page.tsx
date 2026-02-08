import { Suspense } from "react";
import { SubcategoryProductsSection } from "@/components/subcategory-products-section";
import { HeroBannersSection } from "@/components/hero-banners-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-800 to-gray-600">
      {/* Hero Banners with Products - Fetched from database */}
      <div className="w-full bg-white">
        <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse" />}>
          <HeroBannersSection />
        </Suspense>
      </div>

      {/* Product Sections */}
      <div className="w-full bg-gray-50">
        <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse" />}>
          <SubcategoryProductsSection />
        </Suspense>
      </div>
    </div>
  );
}
