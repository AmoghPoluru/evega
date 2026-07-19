import { Suspense } from "react";
import { SubcategoryProductsSection } from "@/components/subcategory-products-section";
import { HeroBannersSection } from "@/components/hero-banners-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Banners with Products - Fetched from database */}
      <div className="w-full bg-card">
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse" />}>
          <HeroBannersSection />
        </Suspense>
      </div>

      {/* Product Sections */}
      <div className="w-full bg-muted">
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse" />}>
          <SubcategoryProductsSection />
        </Suspense>
      </div>
    </div>
  );
}
