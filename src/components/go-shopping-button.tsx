import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

const SHOPPING_URL = "https://evegasupplier-ind.vercel.app";

interface GoShoppingButtonProps {
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
}

export function GoShoppingButton({ className, size }: GoShoppingButtonProps) {
  return (
    <Button asChild size={size} className={cn("font-semibold", className)}>
      <a href={SHOPPING_URL} target="_blank" rel="noopener noreferrer">
        <ShoppingBag />
        <span>Go Shopping</span>
      </a>
    </Button>
  );
}
