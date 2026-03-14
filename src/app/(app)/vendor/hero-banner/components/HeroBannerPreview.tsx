"use client";

import Image from "next/image";
import Link from "next/link";

interface HeroBannerPreviewProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string | null;
  products?: Array<{
    id: string;
    name: string;
    image?: any;
    price: number;
  }>;
}

export function HeroBannerPreview({
  title,
  subtitle,
  backgroundImage,
  products = [],
}: HeroBannerPreviewProps) {
  return (
    <div className="relative w-full overflow-hidden bg-white border rounded-lg">
      {/* Banner Container */}
      <div className="relative">
        {backgroundImage ? (
          <div className="relative h-[300px]">
            <Image
              src={backgroundImage}
              alt="Banner preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
          </div>
        ) : (
          <div className="h-[300px] bg-gradient-to-r from-gray-800 to-gray-600" />
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {/* Title and Subtitle - Top */}
          <div className="px-6 pt-6 pb-4 z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {title}
            </h2>
            {subtitle && (
              <p className="text-base md:text-lg text-white drop-shadow-lg max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Featured Products - Bottom */}
          {products.length > 0 ? (
            <div className="px-6 pb-6">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ height: '200px' }}>
                {products.slice(0, 6).map((product) => {
                  const imageUrl = product.image && typeof product.image === 'object' && product.image.url
                    ? product.image.url
                    : '/placeholder.png';

                  return (
                    <div
                      key={product.id}
                      className="shrink-0 w-[150px] md:w-[180px] h-full"
                    >
                      <div className="border rounded-md bg-white overflow-hidden h-full flex flex-col">
                        <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-50">
                          <Image
                            alt={product.name}
                            fill
                            src={imageUrl}
                            className="object-contain"
                            sizes="150px"
                          />
                        </div>
                        <div className="p-2 bg-white shrink-0 border-t">
                          <h3 className="text-xs font-medium line-clamp-2">{product.name}</h3>
                          <p className="text-xs font-bold text-primary mt-1">${product.price}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6">
              <p className="text-sm text-white/80">No products selected for banner</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
