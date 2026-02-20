"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StarIcon } from "lucide-react";

import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  reviewRating?: number;
  reviewCount?: number;
  price: number;
  vendor?: {
    id: string;
    name?: string;
    slug?: string;
    logo?: { url?: string } | string | null;
  } | string | null;
}

export const ProductCard = ({
  id,
  name,
  imageUrl,
  reviewRating,
  reviewCount,
  price,
  vendor,
}: ProductCardProps) => {
  const router = useRouter();
  const vendorName = typeof vendor === "object" && vendor !== null ? vendor.name : null;
  const vendorSlug = typeof vendor === "object" && vendor !== null ? vendor.slug : null;
  const vendorLogo = typeof vendor === "object" && vendor !== null 
    ? (typeof vendor.logo === "object" && vendor.logo !== null ? vendor.logo.url : null)
    : null;

  const handleVendorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (vendorSlug) {
      router.push(`/vendor/${vendorSlug}`);
    }
  };

  return (
    <Link href={`/products/${id}`}>
      <div className="hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow border rounded-md bg-white overflow-hidden h-full flex flex-col">
        <div className="relative aspect-square">
          <Image
            alt={name}
            fill
            src={imageUrl || "/placeholder.png"}
            className="object-cover"
          />
        </div>
        <div className="p-4 border-y flex flex-col gap-3 flex-1">
          {vendorName && (
            <div className="flex items-center gap-2">
              {vendorLogo && (
                <Image
                  src={vendorLogo}
                  alt={vendorName}
                  width={20}
                  height={20}
                  className="rounded-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={handleVendorClick}
                className="text-xs text-gray-600 hover:text-gray-900 font-medium text-left"
              >
                {vendorName}
              </button>
            </div>
          )}
          <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
          {reviewCount && reviewCount > 0 && reviewRating !== undefined && (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-black" />
              <p className="text-sm font-medium">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="relative px-2 py-1 border bg-pink-400 w-fit">
            <p className="text-sm font-medium">
              {formatCurrency(price)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse" />
  );
};
