"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useCart } from "../../hooks/use-cart";

interface CheckoutButtonProps {
  className?: string;
  hideIfEmpty?: boolean;
}

export const CheckoutButton = ({
  className,
  hideIfEmpty,
}: CheckoutButtonProps) => {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" asChild className={cn("bg-white", className)}>
        <Link href="/checkout">
          <ShoppingCartIcon />
        </Link>
      </Button>
    );
  }

  if (hideIfEmpty && totalItems === 0) return null;

  return (
    <Button variant="outline" asChild className={cn("bg-white", className)}>
      <Link href="/checkout">
        <ShoppingCartIcon /> {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};
