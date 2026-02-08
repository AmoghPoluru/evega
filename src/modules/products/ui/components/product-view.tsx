"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { CheckIcon, LinkIcon, ChevronDown } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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
  const { data, isLoading, error } = trpc.products.getOne.useQuery({ id: productId });

  const [isCopied, setIsCopied] = useState(false);
  const [quantity, setQuantity] = useState(1);

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
                  <span className="text-sm text-red-700 font-medium">-14%</span>
                  <span className="text-3xl font-normal text-gray-900">
                    {formatCurrency(data.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>List Price:</span>
                  <span className="line-through">{formatCurrency(data.price * 1.14)}</span>
                </div>
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
                <div className="text-3xl font-normal text-gray-900">
                  {formatCurrency(data.price)}
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

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer hover:text-orange-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>Delivering to Nashville 37217 - Update location</span>
                </div>

                {/* Stock Status */}
                <p className="text-lg text-green-700 font-medium">In Stock</p>

                {/* Quantity Selector */}
                <div className="relative">
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer appearance-none pr-8"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        Quantity: {num}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
                </div>

                {/* Add to Cart Button */}
                <CartButton productId={productId} />

                {/* Buy Now Button */}
                <Button 
                  className="w-full bg-orange-400 hover:bg-orange-500 text-gray-900 font-medium rounded-full"
                  size="lg"
                >
                  Buy Now
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
