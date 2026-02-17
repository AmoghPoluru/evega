import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
  productId: string;
  size?: string;
  color?: string;
  variantPrice?: number;
  isPurchased?: boolean;
  disabled?: boolean;
}

export const CartButton = ({ productId, size, color, variantPrice, isPurchased, disabled }: Props) => {
  const cart = useCart();
  const isInCart = cart.isProductInCart(productId, size, color);

  if (isPurchased) {
    return (
      <Button
        variant="outline"
        asChild
        className="flex-1 font-medium bg-white"
      >
        <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`}>
          View in Library
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="lg"
      disabled={disabled}
      className={cn(
        "w-full font-medium rounded-full",
        isInCart
          ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
          : "bg-orange-400 hover:bg-orange-500 text-gray-900",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => cart.toggleProduct(productId, size, color, variantPrice)}
    >
      {isInCart
        ? "Remove from cart"
        : "Add to cart"}
    </Button>
  );
};
