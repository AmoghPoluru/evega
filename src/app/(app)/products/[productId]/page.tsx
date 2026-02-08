import { ProductView, ProductViewSkeleton } from "@/modules/products/ui/components/product-view";
import { Suspense } from "react";

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductPage({ params }: Props) {
  const { productId } = await params;

  return (
    <div className="container mx-auto">
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} />
      </Suspense>
    </div>
  );
}
