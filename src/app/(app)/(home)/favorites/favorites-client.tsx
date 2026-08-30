"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { trpc } from "@/trpc/client";
import { ProductCard, ProductCardSkeleton } from "@/modules/products/ui/components/product-card";
import type { Favorite, Product, Media } from "@/payload-types";

const getImageUrl = (image: Product["image"]): string | null => {
  if (image && typeof image === "object" && "url" in image) {
    return (image as Media).url ?? null;
  }
  return null;
};

export function FavoritesClient() {
  const { data: session, isLoading: isSessionLoading } = trpc.auth.session.useQuery();
  const { data, isLoading } = trpc.productInteractions.favorites.list.useQuery(undefined, {
    enabled: !!session?.user,
  });

  if (!isSessionLoading && !session?.user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Heart className="mx-auto h-10 w-10 text-gray-300" />
        <h1 className="mt-4 text-2xl font-medium text-gray-900">Your favorites</h1>
        <p className="mt-2 text-gray-600">
          <Link href="/sign-in?redirect=/favorites" className="text-blue-600 hover:text-orange-600 hover:underline font-medium">
            Sign in
          </Link>{" "}
          to view and manage the products you&apos;ve favorited.
        </p>
      </div>
    );
  }

  const favorites = (data?.docs ?? []).filter(
    (fav: Favorite): fav is Favorite & { product: Product } =>
      typeof fav.product === "object" && fav.product !== null
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6 text-pink-500 fill-current" />
        <h1 className="text-2xl font-medium text-gray-900">My Favorites</h1>
        {data && (
          <span className="text-gray-500">({data.totalDocs})</span>
        )}
      </div>

      {isLoading || isSessionLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 text-gray-600">You haven&apos;t favorited any products yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-orange-600 hover:underline font-medium"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((fav: Favorite & { product: Product }) => {
            const product = fav.product;
            const vendor =
              typeof product.vendor === "object" && product.vendor !== null
                ? {
                    id: product.vendor.id,
                    name: product.vendor.name ?? undefined,
                    slug: product.vendor.slug ?? undefined,
                    logo:
                      typeof product.vendor.logo === "object" && product.vendor.logo !== null
                        ? { url: product.vendor.logo.url ?? undefined }
                        : undefined,
                  }
                : undefined;
            return (
              <ProductCard
                key={fav.id}
                id={product.id}
                name={product.name}
                imageUrl={getImageUrl(product.image)}
                price={product.price}
                vendor={vendor}
                reviewRating={0}
                reviewCount={0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
