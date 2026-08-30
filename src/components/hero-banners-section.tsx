'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { inferRouterOutputs } from '@trpc/server';

import { BannerCarousel } from '@/components/banner-carousel';
import { trpc } from '@/trpc/client';
import type { AppRouter } from '@/trpc/routers/_app';

type HeroBanner = inferRouterOutputs<AppRouter>['heroBanners'][number];
type HeroBannerProduct = HeroBanner['products'][number];

// Simple Product Card for Hero Banners - Just image and title
function HeroBannerProductCard({ product }: { product: HeroBannerProduct }) {
  return (
    <Link href={`/products/${product.id}`} className="shrink-0 w-full h-full">
      <div className="hover:shadow-lg transition-shadow border rounded-md bg-white overflow-hidden h-full flex flex-col">
        <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-50">
          <Image
            alt={product.name}
            fill
            src={product.image || '/placeholder.png'}
            className="object-contain"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
        <div className="p-2 md:p-3 bg-white shrink-0 border-t">
          <h3 className="text-xs md:text-sm font-medium line-clamp-2 text-center text-gray-900">
            {product.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export function HeroBannersSection() {
  const { data: banners, isLoading, error } = trpc.heroBanners.useQuery();

  if (isLoading) {
    return <div className="relative w-full overflow-hidden h-[500px] bg-gray-200 animate-pulse" />;
  }

  if (error) {
    return (
      <div className="px-4 lg:px-12 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Unable to load hero banners</p>
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <BannerCarousel<HeroBannerProduct>
      banners={banners}
      getProductKey={(product) => product.id}
      renderProductCard={(product) => <HeroBannerProductCard product={product} />}
      classNames={{
        background: 'h-[400px] lg:h-[500px]',
        flexRow: 'h-[280px]',
        flexItem: 'h-full',
        scrollRegion: 'h-[250px] md:h-[300px] lg:h-[350px]',
        scrollRow: 'h-full',
        scrollItem: 'w-[200px] md:w-[250px] lg:w-[300px] h-full',
      }}
      emptyProducts={
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8 p-4 bg-white/20 rounded">
          <p className="text-white">No products in this banner</p>
        </div>
      }
    />
  );
}
