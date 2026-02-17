import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  size?: string; // Variant size (XS, S, M, L, XL, XXL)
  color?: string; // Variant color (e.g., Red, Blue, Black)
  quantity?: number; // Quantity for this variant
  variantPrice?: number; // Price for this specific variant (base price + adjustment)
}

interface CartState {
  items: CartItem[];
  productIds: string[]; // Legacy: for backward compatibility
  addProduct: (productId: string, size?: string, color?: string, variantPrice?: number) => void;
  removeProduct: (productId: string, size?: string, color?: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  isProductInCart: (productId: string, size?: string, color?: string) => boolean;
  getCartItems: () => CartItem[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      productIds: [], // Legacy support
      
      addProduct: (productId, size, color, variantPrice) => {
        set((state) => {
          // Check if item already exists (same productId, size, and color)
          const existingItem = state.items.find(
            (item) => 
              item.productId === productId && 
              item.size === size && 
              item.color === color
          );
          
          if (existingItem) {
            // Increment quantity if item exists
            return {
              items: state.items.map((item) =>
                item.productId === productId && 
                item.size === size && 
                item.color === color
                  ? { ...item, quantity: (item.quantity || 1) + 1 }
                  : item
              ),
              productIds: state.productIds.includes(productId)
                ? state.productIds
                : [...state.productIds, productId],
            };
          }
          
          // Add new item
          return {
            items: [
              ...state.items,
              { productId, size, color, variantPrice, quantity: 1 },
            ],
            productIds: state.productIds.includes(productId)
              ? state.productIds
              : [...state.productIds, productId],
          };
        });
      },
      
      removeProduct: (productId, size, color) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => !(
              item.productId === productId && 
              item.size === size && 
              item.color === color
            )
          );
          
          // Update productIds if no variants of this product remain
          const hasOtherVariants = newItems.some(
            (item) => item.productId === productId
          );
          
          return {
            items: newItems,
            productIds: hasOtherVariants
              ? state.productIds
              : state.productIds.filter((id) => id !== productId),
          };
        });
      },
      
      clearCart: () =>
        set({
          items: [],
          productIds: [],
        }),
      
      getCartCount: () => {
        const items = get().items;
        return items.reduce((total, item) => total + (item.quantity || 1), 0);
      },
      
      isProductInCart: (productId, size, color) => {
        const items = get().items;
        return items.some(
          (item) => 
            item.productId === productId && 
            item.size === size && 
            item.color === color
        );
      },
      
      getCartItems: () => get().items,
    }),
    {
      name: "evega-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
