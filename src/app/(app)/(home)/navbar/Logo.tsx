'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import logoImage from './Logo.png';

export default function Logo() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.push('/')}
      className="p-0 h-auto hover:bg-transparent flex items-center"
    >
      <Image
        className="cursor-pointer object-contain"
        src={logoImage}
        height={80}
        width={80}
        alt="Evega Logo"
        style={{ maxHeight: '80px', maxWidth: '80px' }}
      />
    </Button>
  );
}
