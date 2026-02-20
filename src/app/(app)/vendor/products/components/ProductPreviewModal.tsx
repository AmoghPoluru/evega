"use client";

import { trpc } from "@/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductViewSkeleton } from "@/modules/products/ui/components/product-view";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { formatCurrency } from "@/lib/utils";

interface ProductPreviewModalProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductPreviewModal({
  productId,
  open,
  onOpenChange,
}: ProductPreviewModalProps) {
  // Always call the hook with the same parameters to maintain hook order
  // Disable the query when modal is closed or productId is missing
  // Use a fallback empty string to ensure hook is always called with same type
  const { data: product, isLoading } = trpc.vendor.products.getOne.useQuery(
    { id: productId || "" },
    { 
      enabled: open && !!productId && productId.length > 0,
      retry: false,
    }
  );

  const imageUrl =
    product?.image && typeof product.image === "object"
      ? product.image.url
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Product Preview</DialogTitle>
              <DialogDescription>
                Preview how your product will appear to customers
              </DialogDescription>
            </div>
            {product && (
              <Badge variant={product.isPrivate ? "outline" : "default"}>
                {product.isPrivate ? "Draft" : "Published"}
              </Badge>
            )}
          </div>
        </DialogHeader>
        <div className="mt-4">
          {product?.isPrivate && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This product is currently a draft and not visible to customers.
              </p>
            </div>
          )}
          {isLoading ? (
            <ProductViewSkeleton />
          ) : product ? (
            <div className="space-y-6">
              {/* Product Image */}
              {imageUrl && (
                <div className="relative aspect-square w-full max-w-md mx-auto">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  <p className="text-2xl font-semibold mt-2">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="prose max-w-none">
                    <RichText data={product.description} />
                  </div>
                )}

                {/* Variants */}
                {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Available Variants</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {product.variants.map((variant: any, index: number) => (
                        <div key={index} className="border p-2 rounded">
                          <div className="text-sm">
                            {variant.size && <span>Size: {variant.size}</span>}
                            {variant.size && variant.color && <span> • </span>}
                            {variant.color && <span>Color: {variant.color}</span>}
                          </div>
                          <div className="text-sm text-gray-600">
                            Stock: {variant.stock}
                          </div>
                          {variant.price && (
                            <div className="text-sm font-medium">
                              Price: {formatCurrency(variant.price)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refund Policy */}
                {product.refundPolicy && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      Refund Policy: {product.refundPolicy}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
