"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { InboxIcon, LoaderIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { trpc } from "@/trpc/client";

import { useCart } from "../../hooks/use-cart";
import { CheckoutItem } from "../components/checkout-item";
import { CheckoutSidebar } from "../components/checkout-sidebar";
import { useCheckoutStates } from "../../hooks/use-checkout-states";

export const CheckoutView = () => {
  const router = useRouter();
  const [states, setStates] = useCheckoutStates();
  const { productIds, items, removeProduct, clearCart } = useCart();
  
  const queryClient = useQueryClient();
  // Get unique product IDs from cart items (for backward compatibility)
  const uniqueProductIds = Array.from(new Set(items.map(item => item.productId)));
  const { data, error, isLoading } = trpc.checkout.getProducts.useQuery({
    ids: uniqueProductIds.length > 0 ? uniqueProductIds : productIds,
  });

  const purchase = trpc.checkout.purchase.useMutation({
    onMutate: () => {
      setStates({ success: false, cancel: false });
    },
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.success("Purchase completed successfully");
        setStates({ success: true, cancel: false });
      }
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }

      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (states.success) {
      // Check if this is a "Buy Now" purchase (single product purchase)
      const urlParams = new URLSearchParams(window.location.search);
      const buyNow = urlParams.get('buyNow') === 'true';
      const productIdsParam = urlParams.get('productIds');

      if (buyNow) {
        const cartItemsParam = urlParams.get('cartItems');
        if (cartItemsParam) {
          try {
            // Parse cart items from URL
            const purchasedItems = JSON.parse(decodeURIComponent(cartItemsParam));
            purchasedItems.forEach((item: any) => {
              removeProduct(item.productId, item.size, item.color);
            });
            toast.success("Purchase completed! Item(s) removed from cart.");
          } catch (e) {
            console.error("Failed to parse cartItems:", e);
            clearCart();
            toast.success("Purchase completed! Cart cleared.");
          }
        } else {
          // Fallback: Legacy productIds
          const productIdsParam = urlParams.get('productIds');
          if (productIdsParam) {
            const purchasedProductIds = productIdsParam.split(',');
            purchasedProductIds.forEach((id) => {
              removeProduct(id);
            });
            toast.success("Purchase completed! Item removed from cart.");
          } else {
            clearCart();
            toast.success("Purchase completed! Cart cleared.");
          }
        }
      } else {
        // Regular checkout - clear entire cart
        clearCart();
      }

      setStates({ success: false, cancel: false });
      queryClient.invalidateQueries({ queryKey: [["checkout", "getProducts"]] });
      router.push("/");
    }
  }, [
    states.success, 
    clearCart, 
    removeProduct,
    router, 
    setStates,
    queryClient,
  ]);
  
  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Invalid products found, cart cleared");
    }
  }, [error, clearCart]);

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white border border-gray-300 rounded-lg flex items-center justify-center p-8 flex-col gap-y-4">
            <LoaderIcon className="text-gray-400 animate-spin size-8" />
          </div>
        </div>
      </div>
    );
  }

  if (data?.totalDocs === 0) {
    return (
      <div className="bg-gray-100 min-h-screen py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white border border-gray-300 rounded-lg flex items-center justify-center p-8 flex-col gap-y-4">
            <InboxIcon className="size-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Promotional Banner */}
        <div className="bg-white border border-gray-300 rounded-lg mb-4 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900">
              Get a $150 Gift Card upon approval for Store Card.{" "}
              <a href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
                Find out how
              </a>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Apply and pay only</p>
            <p className="text-gray-400 line-through text-sm">$35.18</p>
            <p className="text-lg font-bold text-gray-900">$0.00</p>
            <p className="text-xs text-gray-600">for this order</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-300">
                <div className="flex items-baseline justify-between">
                  <h1 className="text-2xl font-medium text-gray-900">Shopping Cart</h1>
                  <span className="text-sm text-gray-600 ml-auto mr-6">Price</span>
                </div>
                <button 
                  onClick={clearCart}
                  className="text-sm text-blue-600 hover:text-orange-600 hover:underline mt-1"
                >
                  Deselect all items
                </button>
              </div>

              {/* Cart Items */}
              <div>
                {items.length > 0 ? (
                  // New: Use cart items with variants
                  items.map((cartItem, index) => {
                    const product = data?.docs.find((p) => p.id === cartItem.productId);
                    if (!product) return null;
                    
                    // Use variant price if available, otherwise base price
                    const itemPrice = cartItem.variantPrice ?? product.price;
                    
                    return (
                      <CheckoutItem
                        key={`${cartItem.productId}:${cartItem.size || ''}:${cartItem.color || ''}`}
                        isLast={index === items.length - 1}
                        imageUrl={product.image?.url || undefined}
                        name={product.name}
                        productUrl={`/products/${product.id}`}
                        price={itemPrice}
                        size={cartItem.size}
                        color={cartItem.color}
                        quantity={cartItem.quantity || 1}
                        onRemove={() => removeProduct(cartItem.productId, cartItem.size, cartItem.color)}
                      />
                    );
                  })
                ) : (
                  // Fallback: Legacy productIds (for backward compatibility)
                  data?.docs.map((product, index) => (
                    <CheckoutItem
                      key={product.id}
                      isLast={index === data.docs.length - 1}
                      imageUrl={product.image?.url || undefined}
                      name={product.name}
                      productUrl={`/products/${product.id}`}
                      price={product.price}
                      onRemove={() => removeProduct(product.id)}
                    />
                  ))
                )}
              </div>

              {/* Subtotal Footer */}
              <div className="px-6 py-4 border-t border-gray-300 bg-white">
                <div className="flex justify-end">
                  <p className="text-lg text-gray-900">
                    Subtotal ({items.length > 0 ? items.reduce((acc, item) => acc + (item.quantity || 1), 0) : data?.totalDocs} item{(items.length > 0 ? items.reduce((acc, item) => acc + (item.quantity || 1), 0) : data?.totalDocs) !== 1 ? 's' : ''}): 
                    <span className="font-bold ml-2">
                      ${items.length > 0 
                        ? items.reduce((acc, item) => acc + ((item.variantPrice ?? 0) * (item.quantity || 1)), 0).toFixed(2)
                        : data?.totalPrice?.toFixed(2)
                      }
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CheckoutSidebar
              total={items.length > 0 
                ? items.reduce((acc, item) => acc + ((item.variantPrice ?? 0) * (item.quantity || 1)), 0)
                : (data?.totalPrice || 0)
              }
              itemCount={items.length > 0 
                ? items.reduce((acc, item) => acc + (item.quantity || 1), 0)
                : (data?.totalDocs || 0)
              }
              onPurchase={() => {
                // Use cart items with variant info
                if (items.length > 0) {
                  purchase.mutate({ 
                    cartItems: items.map(item => ({
                      productId: item.productId,
                      size: item.size,
                      color: item.color,
                      quantity: item.quantity || 1,
                      variantPrice: item.variantPrice,
                    })),
                  });
                } else {
                  // Fallback: Legacy productIds
                  purchase.mutate({ 
                    cartItems: productIds.map(id => ({
                      productId: id,
                      quantity: 1,
                    })),
                  });
                }
              }}
              isCanceled={states.cancel || false}
              disabled={purchase.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
