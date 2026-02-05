import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartState {
  productIds: string[];
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  isProductInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      productIds: [],
      addProduct: (productId) =>
        set((state) => {
          // Prevent duplicates
          if (state.productIds.includes(productId)) {
            return state;
          }
          return {
            productIds: [...state.productIds, productId],
          };
        }),
      removeProduct: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
      clearCart: () =>
        set({
          productIds: [],
        }),
      getCartCount: () => get().productIds.length,
      isProductInCart: (productId) => get().productIds.includes(productId),
    }),
    {
      name: "evega-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
