import { getPayload } from "payload";
import config from "@payload-config";
// @ts-expect-error - Next.js link module works at runtime with NodeNext resolution
import Link from "next/link";
// @ts-expect-error - Component import works at runtime with NodeNext resolution
import { ProductsList } from "@/components/product-filters";

interface Props {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const payload = await getPayload({ config });

  // Find category by slug
  const categoryData = await payload.find({
    collection: "categories",
    where: {
      slug: {
        equals: category,
      },
    },
    limit: 1,
    depth: 1,
  });

  const categoryDoc = categoryData.docs[0];

  if (!categoryDoc) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
          <p className="text-gray-600">The category "{category}" does not exist.</p>
        </div>
      </div>
    );
  }

  // Fetch products for this category
  const productsData = await payload.find({
    collection: "products",
    where: {
      category: {
        equals: categoryDoc.id,
      },
      isPrivate: {
        equals: false,
      },
      isArchived: {
        equals: false,
      },
    },
    limit: 100,
    depth: 2, // Populate category, subcategory, image, cover relationships
    sort: "name",
  });

  const products = productsData.docs;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link 
            href="/"
            className="text-primary hover:underline"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-600">{categoryDoc.name}</span>
        </nav>

        {/* Products Section with Filters */}
        <ProductsList products={products} title="Products" />
      </div>
    </div>
  );
}
