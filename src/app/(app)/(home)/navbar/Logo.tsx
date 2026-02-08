'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import logoImage from './Logo.png';

/**
 * Logo Component
 * 
 * Displays the Evega logo as a clickable button that navigates to the home page.
 * Uses Next.js Image component for optimized image loading.
 * This is used in the navbar to navigate to the home page.
 */
export default function Logo() {
  // Get router instance for programmatic navigation
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.push('/')} // Navigate to home page on click
      className="p-0 h-auto hover:bg-transparent flex items-center"
    >
      {/* Logo image - 80x80px with max size constraints */}
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
