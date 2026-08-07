import { ProductListView } from "@/modules/products/ui/components/product-list-view";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const searchTerm = params.search || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 lg:px-12 py-8">
        {searchTerm && (
          <h1 className="text-3xl font-bold mb-8">
            Search Results for &quot;{searchTerm}&quot;
          </h1>
        )}
        <ProductListView />
      </div>
    </div>
  );
}
