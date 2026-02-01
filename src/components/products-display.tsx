"use client";

import { trpc } from "@/trpc/client";

export function ProductsDisplay() {
  const { data: products, isLoading, error } = trpc.products.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error loading products</h3>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No products found.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <div
            key={product.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
          >
            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            {product.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {typeof product.description === 'string' 
                  ? product.description 
                  : 'Product description'}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-blue-600">
                ${product.price}
              </p>
              {product.category && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {typeof product.category === 'object' 
                    ? product.category.name 
                    : 'Category'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
