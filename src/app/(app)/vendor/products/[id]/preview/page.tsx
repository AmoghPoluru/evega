import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { ProductView } from "@/modules/products/ui/components/product-view";
import { Suspense } from "react";
import { ProductViewSkeleton } from "@/modules/products/ui/components/product-view";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPreviewPage({ params }: Props) {
  const { id } = await params;

  try {
    // Verify the product belongs to the vendor
    const product = await caller.vendor.products.getOne({ id });

    return (
      <div className="container mx-auto">
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Preview Mode:</strong> You are viewing this product as it would appear on the public storefront.
            {product.isPrivate && (
              <span className="block mt-1">
                This product is currently a draft and not visible to customers.
              </span>
            )}
          </p>
        </div>
        {/* Use the public product view - it should work since we're authenticated as vendor */}
        <Suspense fallback={<ProductViewSkeleton />}>
          <ProductView productId={id} />
        </Suspense>
      </div>
    );
  } catch (error) {
    redirect("/vendor/products");
  }
}
