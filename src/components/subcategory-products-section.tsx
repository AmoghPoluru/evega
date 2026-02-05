'use client';

import { SubcategoryProductCard } from './subcategory-product-card';
import { trpc } from '@/trpc/client';

interface SubcategoryProductsSectionProps {
  categorySlug?: string;
}

export function SubcategoryProductsSection({ 
  categorySlug 
}: SubcategoryProductsSectionProps) {
  const { data: categoriesData, isLoading: categoriesLoading, error } = trpc.categories.useQuery();

  return (
    <div className="container mx-auto px-4 py-8">

      {categoriesLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-600 font-medium">Loading categories...</p>
          <div className="space-y-4 mt-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-red-500 font-medium">Error loading categories: {error.message}</div>
        </div>
      )}

      {!categoriesLoading && !error && (!categoriesData || categoriesData.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="text-yellow-700 font-medium">No categories found</div>
        </div>
      )}

      {!categoriesLoading && !error && categoriesData && categoriesData.length > 0 && (() => {
        // Filter categories if categorySlug is provided
        const categories = categorySlug
          ? categoriesData.filter((cat) => cat.slug === categorySlug)
          : categoriesData;
        
        console.log('Categories data:', categoriesData);
        console.log('Filtered categories:', categories);
        
        return (
          <div className="space-y-8">
            {categories.map((category) => {
        // Get subcategories for this category
        const subcategories = Array.isArray(category.subcategories)
          ? category.subcategories
          : ((category.subcategories as any)?.docs || []);

        // If no subcategories, show products grouped by category
        if (subcategories.length === 0) {
          return (
            <CategoryProductsCard
              key={category.id}
              categorySlug={category.slug}
              categoryName={category.name}
            />
          );
        }

        // If subcategories exist, show products grouped by subcategory
        return subcategories.map((subcategory: any) => (
          <SubcategoryProductsCard
            key={subcategory.id}
            categorySlug={category.slug}
            subcategory={subcategory}
          />
        ));
      })}
          </div>
        );
      })()}
    </div>
  );
}

// Component to fetch and display products for a category (when no subcategories)
function CategoryProductsCard({
  categorySlug,
  categoryName,
}: {
  categorySlug: string;
  categoryName: string;
}) {
  const { data: productsData, isLoading, error } = trpc.products.getMany.useQuery({
    category: categorySlug,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
    );
  }

  if (error) {
    console.error('Products error:', error);
    return (
      <div className="h-64 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-red-500 text-sm">Error loading products</div>
      </div>
    );
  }

  if (!productsData || productsData.docs.length === 0) {
    console.log(`No products found for category: ${categorySlug}`);
    return null;
  }

  console.log(`Products for ${categorySlug}:`, productsData.docs.length);

  // Transform products to match the component's expected format
  const formattedProducts = productsData.docs.map((product: any) => ({
    id: product.id,
    name: product.name,
    image: typeof product.image === 'object' && product.image !== null
      ? { url: product.image.url || null }
      : null,
    price: product.price,
    slug: product.slug,
  }));

  return (
    <SubcategoryProductCard
      title={categoryName}
      products={formattedProducts}
      categorySlug={categorySlug}
    />
  );
}

// Component to fetch and display products for a specific subcategory
function SubcategoryProductsCard({
  categorySlug,
  subcategory,
}: {
  categorySlug: string;
  subcategory: { id: string; name: string; slug: string };
}) {
  const { data: productsData, isLoading } = trpc.products.getMany.useQuery({
    category: categorySlug,
    limit: 50, // Get more products to filter by subcategory
  });

  if (isLoading) {
    return (
      <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
    );
  }

  // Filter products for this specific subcategory
  const subcategoryProducts = productsData?.docs.filter((product: any) => {
    const productSubcategory = product.subcategory;
    if (typeof productSubcategory === 'string') {
      return productSubcategory === subcategory.id;
    }
    return productSubcategory?.slug === subcategory.slug || 
           productSubcategory?.id === subcategory.id;
  }) || [];

  if (subcategoryProducts.length === 0) {
    return null;
  }

  // Transform products to match the component's expected format
  const formattedProducts = subcategoryProducts.map((product: any) => ({
    id: product.id,
    name: product.name,
    image: typeof product.image === 'object' && product.image !== null
      ? { url: product.image.url || null }
      : null,
    price: product.price,
    slug: product.slug,
  }));

  return (
    <SubcategoryProductCard
      title={subcategory.name}
      products={formattedProducts}
      categorySlug={categorySlug}
      subcategorySlug={subcategory.slug}
    />
  );
}
