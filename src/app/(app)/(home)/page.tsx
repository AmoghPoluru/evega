'use client';

import { trpc } from '@/trpc/client';

type CategoryWithSubcategories = {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
  }>;
};

export default function Home() {
  const { data: categories, isLoading, error } = trpc.categories.useQuery();
  const { data: session } = trpc.auth.session.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error loading categories: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-4xl font-bold">Hello World</h1>
      
      {/* Session Details */}
      <div className="mt-4 p-4 border rounded-lg bg-gray-50 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-2">Session:</h2>
        <pre className="text-sm overflow-auto whitespace-pre-wrap">
          {JSON.stringify(session?.user, null, 2)}
        </pre>
      </div>

      {categories && categories.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Categories ({categories.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category: CategoryWithSubcategories) => (
              <div key={category.id} className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg">{category.name}</h3>
                <p className="text-sm text-gray-600">Slug: {category.slug}</p>
                {category.subcategories && category.subcategories.length > 0 && (
                  <p className="text-sm mt-2">
                    Subcategories: {category.subcategories.length}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
