"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, LinkIcon, ChevronDown } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import { ShippingAddressDisplay } from "./shipping-address-display";

const CartButton = dynamic(
  () => import("./cart-button").then(
    (mod) => mod.CartButton,
  ),
  {
    ssr: false,
    loading: () => <Button disabled className="w-full bg-pink-400">Add to cart</Button>
  },
);

interface ProductViewProps {
  productId: string;
}

export const ProductView = ({ productId }: ProductViewProps) => {
  const router = useRouter();
  const { removeProduct, addProduct } = useCart();
  const { data, isLoading, error } = trpc.products.getOne.useQuery({ id: productId });

  const [isCopied, setIsCopied] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  
  // Check if product has variants
  const hasVariants = data?.variants && Array.isArray(data.variants) && data.variants.length > 0;
  
  // Get unique sizes - show all sizes that exist (standalone or with any color)
  const availableSizes = hasVariants && data?.variants
    ? Array.from(new Set(
        data.variants
          .filter((v: any) => v.size && v.stock > 0)
          .map((v: any) => v.size)
      ))
    : [];
  
  // Get unique colors - show all colors that exist (standalone or with any size)
  const availableColors = hasVariants && data?.variants
    ? Array.from(new Set(
        data.variants
          .filter((v: any) => v.color && v.stock > 0)
          .map((v: any) => v.color)
      ))
    : [];
  
  // Get selected variant - exact match: both size AND color must match if both are selected
  // Priority: exact match (size+color) > size-only > color-only
  const selectedVariant = hasVariants && data?.variants
    ? data.variants.find((v: any) => {
        if (selectedSize && selectedColor) {
          // Both selected: must match exactly (size+color combination)
          return v.size === selectedSize && v.color === selectedColor;
        } else if (selectedSize) {
          // Only size selected: prefer size-only variant, but also accept size+any color if no size-only exists
          const sizeOnly = v.size === selectedSize && !v.color;
          if (sizeOnly) return true;
          // If no size-only variant, accept any size variant (will use first one found)
          return v.size === selectedSize;
        } else if (selectedColor) {
          // Only color selected: prefer color-only variant, but also accept any size+color if no color-only exists
          const colorOnly = v.color === selectedColor && !v.size;
          if (colorOnly) return true;
          // If no color-only variant, accept any color variant (will use first one found)
          return v.color === selectedColor;
        }
        return false;
      })
    : null;
  
  const stockForSelectedVariant = selectedVariant?.stock || 0;
  
  // Price is determined by color selection only (sizes don't affect price)
  // If color is selected, use color variant price, otherwise use base price
  const variantPrice = selectedColor && selectedVariant && (selectedVariant as any).price !== undefined && (selectedVariant as any).price !== null
    ? (selectedVariant as any).price
    : (data?.price || 0);

  // Handle Buy Now - add to cart and navigate to checkout page
  const handleBuyNow = () => {
    if (hasVariants) {
      if (availableSizes.length > 0 && !selectedSize) {
        toast.error("Please select a size");
        return;
      }
      if (availableColors.length > 0 && !selectedColor) {
        toast.error("Please select a color");
        return;
      }
      if (stockForSelectedVariant === 0) {
        toast.error("Product is out of stock");
        return;
      }
    }

    setIsBuyNowLoading(true);
    
    // Add product to cart with selected variants and quantity
    // Add the product multiple times to match selected quantity
    for (let i = 0; i < quantity; i++) {
      addProduct(
        productId,
        selectedSize,
        selectedColor,
        variantPrice
      );
    }

    // Navigate to checkout page
    router.push("/checkout");
    
    setIsBuyNowLoading(false);
    toast.success("Added to cart. Redirecting to checkout...");
  };


  if (isLoading) {
    return <ProductViewSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="px-4 lg:px-12 py-10">
        <div className="text-center">
          <p className="text-lg text-red-600">Error loading product</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              {/* Main Image */}
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-white mb-4">
                <div className="relative aspect-square">
                  <Image
                    src={data.image?.url || "/placeholder.png"}
                    alt={data.name}
                    fill
                    className="object-contain p-8"
                  />
                </div>
              </div>

              {/* Thumbnail Images (if you have multiple images) */}
              <div className="grid grid-cols-6 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="border border-gray-300 rounded-md overflow-hidden cursor-pointer hover:border-orange-500 transition-colors aspect-square"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={data.image?.url || "/placeholder.png"}
                        alt={`${data.name} thumbnail ${i + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Product Details */}
          <div className="lg:col-span-4">
            <div className="space-y-4">
              {/* Product Title */}
              <h1 className="text-2xl font-normal text-gray-900 leading-tight">
                {data.name}
              </h1>

              {/* Visit Store Link */}
              <Link href="#" className="text-sm text-blue-600 hover:text-orange-600 hover:underline">
                Visit the Store
              </Link>

              {/* Vendor Information */}
              {data?.vendor && (
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  {typeof data.vendor === "object" && data.vendor !== null && (
                    <>
                      {data.vendor.logo && typeof data.vendor.logo === "object" && data.vendor.logo.url && (
                        <Image
                          src={data.vendor.logo.url}
                          alt={data.vendor.name || "Vendor"}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Sold by</span>
                        <Link
                          href={data.vendor.slug ? `/vendor/${data.vendor.slug}` : "#"}
                          className="text-sm font-medium text-blue-600 hover:text-orange-600 hover:underline"
                        >
                          {data.vendor.name || "Vendor"}
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-1">4.8</span>
                  <div className="flex text-orange-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <ChevronDown className="w-4 h-4 ml-1 text-gray-600" />
                </div>
                <span className="text-sm text-blue-600">(18,613)</span>
              </div>

              {/* Best Choice Badge */}
              <div className="inline-block">
                <div className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded">
                  Best Choice
                </div>
              </div>

              {/* Sustainability Badge */}
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span className="text-gray-700">1 sustainability feature</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>

              {/* Popularity */}
              <p className="text-sm text-gray-700">10K+ bought in past month</p>

              {/* Horizontal Divider */}
              <hr className="border-gray-300" />

              {/* Price Section */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-normal text-gray-900">
                    {formatCurrency(variantPrice)}
                  </span>
                </div>
                {selectedVariant && selectedVariant.price !== undefined && selectedVariant.price !== null && selectedVariant.price !== data?.price && data && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Base Price:</span>
                    <span className="line-through">{formatCurrency(data.price)}</span>
                  </div>
                )}
              </div>

              {/* Free Returns */}
              <div className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:text-orange-600">
                <span className="font-medium">FREE Returns</span>
                <ChevronDown className="w-4 h-4" />
              </div>

              {/* Payment Option */}
              <p className="text-sm text-gray-700">
                Get $60 off instantly: Pay $239.99 upon approval for the Store Card.
              </p>

              {/* Other Sellers */}
              <p className="text-sm text-gray-700">
                Available at a lower price from{" "}
                <Link href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
                  other sellers
                </Link>{" "}
                that may not offer free shipping.
              </p>

              {/* Horizontal Divider */}
              <hr className="border-gray-300" />

              {/* Product Description */}
              <div className="prose prose-sm max-w-none text-gray-700">
                {data.description ? (
                  <RichText data={data.description} />
                ) : (
                  <p className="font-medium text-gray-400 italic">
                    No description provided
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Box */}
          <div className="lg:col-span-3">
            <div className="border border-gray-300 rounded-lg p-4 bg-white sticky top-6">
              <div className="space-y-4">
                {/* Price */}
                <div className="space-y-1">
                  <div className="text-3xl font-normal text-gray-900">
                    {formatCurrency(variantPrice)}
                  </div>
                  {selectedVariant && (selectedVariant as any).price !== undefined && (selectedVariant as any).price !== null && (selectedVariant as any).price !== data?.price && data && (
                    <div className="text-sm text-gray-600">
                      Base: {formatCurrency(data.price)}
                    </div>
                  )}
                </div>

                {/* Premium Badge */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-blue-400 font-bold text-lg">premium</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">FREE delivery</span>{" "}
                    <span className="font-bold">Friday, February 13</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">FREE delivery Tomorrow, February 9</span> for premium members. 
                    Order within <span className="text-green-700 font-medium">12 hrs 57 mins</span>.
                  </p>
                </div>

                {/* Shipping Address */}
                <ShippingAddressDisplay />

                {/* Size Selector (if product has variants with sizes) */}
                {hasVariants && availableSizes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Size: {selectedSize || "Select a size"}
                      </label>
                      {selectedSize && stockForSelectedVariant > 0 && (
                        <span className="text-xs text-gray-500">
                          {stockForSelectedVariant} in stock
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size: string) => {
                        // Find variant: if color is selected, prefer size+color combo, otherwise size-only
                        let variant = null;
                        if (selectedColor) {
                          // Color selected: look for size+color combination first
                          variant = data?.variants?.find((v: any) => v.size === size && v.color === selectedColor);
                          // If no combination exists, check if size exists at all (standalone)
                          if (!variant) {
                            variant = data?.variants?.find((v: any) => v.size === size && !v.color);
                          }
                        } else {
                          // No color selected: prefer size-only variant
                          variant = data?.variants?.find((v: any) => v.size === size && !v.color);
                          // If no size-only exists, use any size variant (first one found)
                          if (!variant) {
                            variant = data?.variants?.find((v: any) => v.size === size);
                          }
                        }
                        
                        const isOutOfStock = !variant || variant.stock === 0;
                        const isSelected = selectedSize === size;
                        const stockCount = variant?.stock || 0;
                        
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            disabled={!variant || isOutOfStock}
                            className={`
                              px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all relative
                              ${isSelected
                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                              }
                              ${(!variant || isOutOfStock)
                                ? "opacity-50 cursor-not-allowed line-through"
                                : "cursor-pointer"
                              }
                            `}
                          >
                            <div className="flex flex-col items-center">
                              <span>{size}</span>
                              {variant && !isOutOfStock && (
                                <span className="text-xs text-gray-600 font-medium">
                                  {stockCount} in stock
                                </span>
                              )}
                            </div>
                            {(!variant || isOutOfStock) && <span className="text-xs">(Out of Stock)</span>}
                          </button>
                        );
                      })}
                    </div>
                    {!selectedSize && (
                      <p className="text-xs text-red-600">Please select a size</p>
                    )}
                  </div>
                )}

                {/* Color Selector (if product has variants with colors) */}
                {hasVariants && availableColors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Color: {selectedColor || "Select a color"}
                      </label>
                      {selectedColor && stockForSelectedVariant > 0 && (
                        <span className="text-xs text-gray-500">
                          {stockForSelectedVariant} in stock
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color: string) => {
                        // Find variant: if size is selected, prefer size+color combo, otherwise color-only
                        let variant = null;
                        if (selectedSize) {
                          // Size selected: look for size+color combination first
                          variant = data?.variants?.find((v: any) => v.color === color && v.size === selectedSize);
                          // If no combination exists, check if color exists at all (standalone)
                          if (!variant) {
                            variant = data?.variants?.find((v: any) => v.color === color && !v.size);
                          }
                        } else {
                          // No size selected: prefer color-only variant
                          variant = data?.variants?.find((v: any) => v.color === color && !v.size);
                          // If no color-only exists, use any color variant (first one found)
                          if (!variant) {
                            variant = data?.variants?.find((v: any) => v.color === color);
                          }
                        }
                        
                        const isOutOfStock = !variant || variant.stock === 0;
                        const isSelected = selectedColor === color;
                        // Colors always have their own price (or use base price if no color-specific price)
                        const colorPrice = variant && (variant as any)?.price !== undefined && (variant as any).price !== null 
                          ? (variant as any).price 
                          : (data?.price || 0);
                        
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            disabled={!variant || isOutOfStock}
                            className={`
                              px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all
                              ${isSelected
                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                              }
                              ${(!variant || isOutOfStock)
                                ? "opacity-50 cursor-not-allowed line-through"
                                : "cursor-pointer"
                              }
                            `}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-semibold">{color}</span>
                              {variant && !isOutOfStock && (
                                <span className="text-sm font-bold text-gray-900">
                                  {formatCurrency(colorPrice)}
                                </span>
                              )}
                            </div>
                            {(!variant || isOutOfStock) && <span className="text-xs">(Out of Stock)</span>}
                          </button>
                        );
                      })}
                    </div>
                    {!selectedColor && (
                      <p className="text-xs text-red-600">Please select a color</p>
                    )}
                  </div>
                )}

                {/* Stock Status */}
                {hasVariants ? (
                  (selectedSize || selectedColor) ? (
                    stockForSelectedVariant > 0 ? (
                      <p className="text-lg text-green-700 font-medium">In Stock</p>
                    ) : (
                      <p className="text-lg text-red-700 font-medium">Out of Stock</p>
                    )
                  ) : (
                    <p className="text-sm text-gray-500">Select {availableSizes.length > 0 && availableColors.length > 0 ? 'size and color' : availableSizes.length > 0 ? 'a size' : 'a color'} to see availability</p>
                  )
                ) : (
                  <p className="text-lg text-green-700 font-medium">In Stock</p>
                )}

                {/* Quantity Selector */}
                <div className="relative">
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    disabled={Boolean(hasVariants && ((availableSizes.length > 0 && !selectedSize) || (availableColors.length > 0 && !selectedColor) || stockForSelectedVariant === 0))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {Array.from({ length: Math.min(10, stockForSelectedVariant || 10) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        Quantity: {num}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
                </div>

                {/* Add to Cart Button */}
                <CartButton 
                  productId={productId} 
                  size={hasVariants && availableSizes.length > 0 ? selectedSize : undefined}
                  color={hasVariants && availableColors.length > 0 ? selectedColor : undefined}
                  variantPrice={selectedVariant ? variantPrice : undefined}
                  disabled={Boolean(hasVariants && ((availableSizes.length > 0 && !selectedSize) || (availableColors.length > 0 && !selectedColor) || stockForSelectedVariant === 0))}
                />

                {/* Buy Now Button */}
                <Button 
                  onClick={handleBuyNow}
                  disabled={Boolean(isBuyNowLoading || (hasVariants && ((availableSizes.length > 0 && !selectedSize) || (availableColors.length > 0 && !selectedColor) || stockForSelectedVariant === 0)))}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-gray-900 font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isBuyNowLoading ? "Processing..." : "Buy Now"}
                </Button>

                {/* Share Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-blue-600 hover:text-orange-600 hover:bg-transparent"
                  onClick={() => {
                    setIsCopied(true);
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("URL copied to clipboard");

                    setTimeout(() => {
                      setIsCopied(false);
                    }, 1000);
                  }}
                >
                  {isCopied ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Share
                    </>
                  )}
                </Button>

                <hr className="border-gray-200" />

                {/* Additional Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipper / Seller</span>
                    <Link href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
                      Evega Store
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returns</span>
                    <Link href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
                      {data.refundPolicy === "no-refunds"
                        ? "No refunds"
                        : `FREE 15-day refund/replacement`
                      }
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Support</span>
                    <Link href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
                      Product support included
                    </Link>
                  </div>
                </div>

                {/* See More */}
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                  <ChevronDown className="w-4 h-4" />
                  <span>See more</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductViewSkeleton = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 animate-pulse">
              <div className="aspect-square" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
