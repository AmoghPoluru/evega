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
      variant="default"
      size="lg"
      className={cn(
        "w-full font-medium rounded-full",
        cart.isProductInCart(productId)
          ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
          : "bg-orange-400 hover:bg-orange-500 text-gray-900"
      )}
      onClick={() => cart.toggleProduct(productId)}
    >
      {cart.isProductInCart(productId)
        ? "Remove from cart"
        : "Add to cart"}
    </Button>
  );
};
