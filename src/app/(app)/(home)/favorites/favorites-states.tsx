import { Heart } from "lucide-react";

import { ProductCardSkeleton } from "@/modules/products/ui/components/product-card";

export function FavoritesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6 text-pink-500 fill-current" />
        <h1 className="text-2xl font-medium text-gray-900">My Favorites</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
