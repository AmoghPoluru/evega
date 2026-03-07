'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { cn } from '@/lib/utils';

// Simple Product Card for Hero Banners - Just image and title
function HeroBannerProductCard({
  id,
  name,
  imageUrl,
}: {
  id: string;
  name: string;
  imageUrl: string | null;
}) {
  return (
    <Link href={`/products/${id}`} className="shrink-0 w-full h-full">
      <div className="hover:shadow-lg transition-shadow border rounded-md bg-white overflow-hidden h-full flex flex-col">
        <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-50">
          <Image
            alt={name}
            fill
            src={imageUrl || '/placeholder.png'}
            className="object-contain"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
        <div className="p-2 md:p-3 bg-white shrink-0 border-t">
          <h3 className="text-xs md:text-sm font-medium line-clamp-2 text-center text-gray-900">{name}</h3>
        </div>
      </div>
    </Link>
  );
}

export function HeroBannersSection() {
  const { data: banners, isLoading, error } = trpc.heroBanners.useQuery();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextSlide = React.useCallback(() => {
    if (!banners || banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners]);

  const prevSlide = React.useCallback(() => {
    if (!banners || banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners]);

  // Auto-play carousel - 3 seconds
  React.useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, [nextSlide, banners]);

  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden h-[500px] bg-gray-200 animate-pulse" />
    );
  }

  if (error) {
    console.error('Error loading hero banners:', error);
    return (
      <div className="px-4 lg:px-12 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Unable to load hero banners</p>
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    console.log('No hero banners found');
    return (
      <div className="relative w-full overflow-hidden bg-white h-[500px] flex items-center justify-center">
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 max-w-md">
          <p className="text-yellow-800 font-bold text-lg mb-2">⚠️ No Hero Banners Found</p>
          <p className="text-yellow-700 text-sm">Please run: <code className="bg-yellow-100 px-2 py-1 rounded">npm run db:seed:hero-banners</code></p>
        </div>
      </div>
    );
  }

  console.log('Hero banners loaded:', banners.length, 'Current index:', currentIndex);
  const currentBanner = banners[currentIndex];
  console.log('Current banner:', currentBanner?.title, 'Products:', currentBanner?.products?.length);

  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* Banner Container */}
      <div className="relative">
        {banners.map((banner: { id: string; title: string; subtitle?: string; backgroundImage?: string; products?: Array<{ id: string; name: string; image: string | null }> }, index: number) => (
          <div
            key={banner.id}
            className={cn(
              'transition-opacity duration-500',
              index === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
            )}
          >
            {/* Background Image (if available) */}
            {banner.backgroundImage ? (
              <div className="relative h-[400px] lg:h-[500px]">
                <Image
                  src={banner.backgroundImage}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              </div>
            ) : (
              <div className="h-[400px] lg:h-[500px] bg-gradient-to-r from-gray-800 to-gray-600" />
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col">
              {/* Title and Subtitle - Top */}
              <div className="px-8 lg:px-16 pt-8 pb-4 z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-lg md:text-xl text-white drop-shadow-lg">
                    {banner.subtitle}
                  </p>
                )}
              </div>

              {/* Products - Full Width across banner at bottom */}
              {banner.products && banner.products.length > 0 ? (() => {
                const productCount = banner.products.length;
                console.log(`Banner "${banner.title}": ${productCount} products, using ${productCount <= 6 ? 'flex' : 'scroll'} mode`);
                
                // Use flex for fewer products (≤6), scroll for more
                const useFlex = productCount <= 6;
                
                if (useFlex) {
                  // Flexbox mode: Products spread evenly across full banner width
                  console.log(`Using flex layout for ${productCount} products to fill full width`);
                  
                  return (
                    <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8">
                      <div className="flex gap-2 md:gap-3 lg:gap-4 w-full" style={{ height: '280px' }}>
                        {banner.products.map((product: { id: string; name: string; image: string | null }) => (
                          <div key={product.id} className="flex-1 min-w-0 h-full">
                            <HeroBannerProductCard
                              id={product.id}
                              name={product.name}
                              imageUrl={product.image}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  } else {
                    // Scroll mode: Horizontal scroll for many products
                    console.log('Using horizontal scroll mode');
                    return (
                      <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8 h-[250px] md:h-[300px] lg:h-[350px]">
                        <div className="flex gap-2 md:gap-3 lg:gap-4 h-full w-full overflow-x-auto scrollbar-hide">
                          {banner.products.map((product: { id: string; name: string; image: string | null }) => (
                            <div key={product.id} className="shrink-0 w-[200px] md:w-[250px] lg:w-[300px] h-full">
                              <HeroBannerProductCard
                                id={product.id}
                                name={product.name}
                                imageUrl={product.image}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                })() : (
                  <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8 p-4 bg-white/20 rounded">
                    <p className="text-white">No products in this banner</p>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {banners.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
