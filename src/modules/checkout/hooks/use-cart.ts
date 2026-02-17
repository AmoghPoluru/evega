import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCartStore, type CartItem } from "../store/use-cart-store";

export const useCart = () => {
  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartCount = useCartStore((state) => state.getCartCount);
  const isProductInCart = useCartStore((state) => state.isProductInCart);
  const getCartItems = useCartStore((state) => state.getCartItems);

  const productIds = useCartStore(useShallow((state) => state.productIds));
  const items = useCartStore(useShallow((state) => state.items));

  const toggleProduct = useCallback(
    (productId: string, size?: string, color?: string, variantPrice?: number) => {
      if (isProductInCart(productId, size, color)) {
        removeProduct(productId, size, color);
      } else {
        addProduct(productId, size, color, variantPrice);
      }
    },
    [addProduct, removeProduct, isProductInCart]
  );

  const handleAddProduct = useCallback(
    (productId: string, size?: string, color?: string, variantPrice?: number) => {
      addProduct(productId, size, color, variantPrice);
    },
    [addProduct]
  );

  const handleRemoveProduct = useCallback(
    (productId: string, size?: string, color?: string) => {
      removeProduct(productId, size, color);
    },
    [removeProduct]
  );

  const checkProductInCart = useCallback(
    (productId: string, size?: string, color?: string) => {
      return isProductInCart(productId, size, color);
    },
    [isProductInCart]
  );

  return {
    productIds, // Legacy support
    items, // New: cart items with variants
    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    clearCart,
    toggleProduct,
    isProductInCart: checkProductInCart,
    totalItems: productIds.length, // Legacy
    cartCount: getCartCount(),
    getCartItems,
  };
};
