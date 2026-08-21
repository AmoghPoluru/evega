'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import logoImage from './Logo.png';

/**
 * Marketplace brand mark in the top navbar (home).
 * Wide horizontal wordmark — no frame so the name stays clear.
 */
export default function Logo() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.push('/')}
      className="h-auto max-w-[min(92vw,560px)] shrink-0 p-0 hover:bg-transparent flex items-center"
      aria-label="Zvastra home"
    >
      <Image
        className="h-14 w-auto max-h-14 cursor-pointer object-contain object-left sm:h-16 sm:max-h-16"
        src={logoImage}
        alt="Zvastra — Ethnic Fusion, Jewellery, Home"
        height={72}
        width={560}
        priority
        style={{ width: 'auto', maxWidth: 'min(92vw, 560px)' }}
      />
    </Button>
  );
}
