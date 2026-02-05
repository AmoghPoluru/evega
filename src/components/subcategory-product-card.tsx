'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  image?: {
    url?: string | null;
  } | null;
  price?: number;
  slug?: string;
}

interface SubcategoryProductCardProps {
  title: string;
  products: Product[];
  className?: string;
  subcategorySlug?: string;
  categorySlug?: string;
}

export function SubcategoryProductCard({
  title,
  products,
  className,
  subcategorySlug,
  categorySlug,
}: SubcategoryProductCardProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScrollButtons = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [checkScrollButtons, products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      const newScrollLeft =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(checkScrollButtons, 300);
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          onScroll={checkScrollButtons}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map((product) => {
            const productUrl = subcategorySlug && categorySlug
              ? `/${categorySlug}/${subcategorySlug}/products/${product.id}`
              : `/products/${product.id}`;

            return (
              <Link
                key={product.id}
                href={productUrl}
                className="flex-none w-[200px] group cursor-pointer"
              >
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={product.image?.url || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h3 className="text-sm font-medium line-clamp-2 mb-1">
                  {product.name}
                </h3>
                {product.price && (
                  <p className="text-lg font-semibold text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
