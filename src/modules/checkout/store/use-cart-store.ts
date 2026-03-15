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
  userId?: string; // Track which user owns this cart
  addProduct: (productId: string, size?: string, color?: string, variantPrice?: number) => void;
  removeProduct: (productId: string, size?: string, color?: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  isProductInCart: (productId: string, size?: string, color?: string) => boolean;
  getCartItems: () => CartItem[];
  setUserId: (userId: string | undefined) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      productIds: [], // Legacy support
      userId: undefined,
      
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
      
      clearCart: () => {
        // Clear from state first
        set({
          items: [],
          productIds: [],
          userId: undefined,
        });
        // Then clear localStorage to ensure it's removed
        // This needs to happen after set() so Zustand persist middleware can sync
        if (typeof window !== 'undefined') {
          try {
            // Use setTimeout to ensure state update happens first
            setTimeout(() => {
              localStorage.removeItem('evega-cart');
              // Force a state update to trigger re-render
              const store = get();
              if (store.items.length > 0 || store.productIds.length > 0) {
                // If items still exist, clear again (defensive)
                set({
                  items: [],
                  productIds: [],
                  userId: undefined,
                });
              }
            }, 0);
          } catch (e) {
            console.error('Failed to clear cart from localStorage:', e);
          }
        }
      },
      
      setUserId: (userId: string | undefined) => {
        const currentUserId = get().userId;
        // If user changed, clear the cart
        if (currentUserId && currentUserId !== userId) {
          // Clear localStorage first
          if (typeof window !== 'undefined') {
            localStorage.removeItem('evega-cart');
          }
          // Then set new state with cleared cart and new userId
          set({
            items: [],
            productIds: [],
            userId,
          });
        } else {
          set({ userId });
        }
      },
      
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
