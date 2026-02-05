import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
  productId: string;
  isPurchased?: boolean;
}

export const CartButton = ({ productId, isPurchased }: Props) => {
  const cart = useCart();

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
      variant={cart.isProductInCart(productId) ? "outline" : "default"}
      className={cn(
        "flex-1",
        cart.isProductInCart(productId)
          ? "bg-gray-200 border-gray-400 text-gray-600 hover:bg-gray-300"
          : "bg-pink-400 hover:bg-pink-500"
      )}
      onClick={() => cart.toggleProduct(productId)}
    >
      {cart.isProductInCart(productId)
        ? "Remove from cart"
        : "Add to cart"}
    </Button>
  );
};
