import { ProductListView } from "@/modules/products/ui/components/product-list-view";
import { getPayload } from "payload";
import config from "@payload-config";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const searchTerm = params.search || "";
  const categorySlug = params.category || undefined;

  // Get category name if category slug is provided
  let categoryName: string | undefined;
  if (categorySlug) {
    try {
      const payload = await getPayload({ config });
      const categoryData = await payload.find({
        collection: "categories",
        where: {
          slug: {
            equals: categorySlug,
          },
        },
        limit: 1,
      });
      categoryName = categoryData.docs[0]?.name;
    } catch (error) {
      // If category lookup fails, just use the slug
      console.error("Error fetching category:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 lg:px-12 py-8">
        {searchTerm && (
          <h1 className="text-3xl font-bold mb-8">
            Search Results for "{searchTerm}"
            {categoryName && ` in ${categoryName}`}
          </h1>
        )}
        <ProductListView category={categorySlug} />
      </div>
    </div>
  );
}
