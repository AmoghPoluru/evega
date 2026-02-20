"use client";

import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { InboxIcon, LoaderIcon, ShoppingCart, ChevronDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { trpc } from "@/trpc/client";

import { useCart } from "../../hooks/use-cart";
import { CheckoutItem } from "../components/checkout-item";
import { useCheckoutStates } from "../../hooks/use-checkout-states";
import { DeliverySection } from "../components/delivery-section";
import { PaymentSection } from "../components/payment-section";
import { OrderSummary } from "../components/order-summary";

export const CheckoutView = () => {
  const router = useRouter();
  const [states, setStates] = useCheckoutStates();
  const { items, removeCartItem, clearCart } = useCart();
  
  const queryClient = useQueryClient();
  const productIds = Array.from(new Set(items.map(item => item.productId)));
  
  const { data, error, isLoading } = trpc.checkout.getProducts.useQuery({
    ids: productIds.length > 0 ? productIds : [],
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
      const urlParams = new URLSearchParams(window.location.search);
      const buyNow = urlParams.get('buyNow') === 'true';
      const cartItemsParam = urlParams.get('cartItems');

      if (buyNow && cartItemsParam) {
        try {
          const purchasedCartItems = JSON.parse(decodeURIComponent(cartItemsParam));
          purchasedCartItems.forEach((item: any) => {
            removeCartItem(item.productId, item.size, item.color);
          });
          toast.success("Purchase completed! Item(s) removed from cart.");
        } catch (e) {
          console.error("Failed to parse cartItems from URL:", e);
          clearCart();
          toast.success("Purchase completed! Cart cleared.");
        }
      } else {
        clearCart();
      }

      setStates({ success: false, cancel: false });
      queryClient.invalidateQueries({ queryKey: [["checkout", "getProducts"]] });
      router.push("/");
    }
  }, [
    states.success,
    clearCart,
    removeCartItem,
    router,
    setStates,
    queryClient,
  ]);
  
  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Some products in your cart are invalid or out of stock, cart cleared.");
    } else if (error?.data?.code === "BAD_REQUEST") {
      toast.error(error.message);
    }
  }, [error, clearCart]);

  // Calculate totals
  const orderItems = useMemo(() => {
    if (!data?.docs) return [];
    return items.map(cartItem => {
      const product = data.docs.find(p => p.id === cartItem.productId);
      if (!product) return null;
      const price = cartItem.variantPrice ?? product.price;
      return {
        productId: cartItem.productId,
        name: product.name,
        price: price,
        quantity: cartItem.quantity || 1,
        size: cartItem.size,
        color: cartItem.color,
      };
    }).filter(Boolean) as Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      size?: string;
      color?: string;
    }>;
  }, [items, data?.docs]);

  const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal >= 75 ? 0 : 2.99; // Free shipping over $75
  const tax = subtotal * 0.08; // 8% tax (placeholder - should use actual tax calculation)
  const total = subtotal + shipping + tax;

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

  if (data?.docs.length === 0 || items.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white border border-gray-300 rounded-lg flex items-center justify-center p-8 flex-col gap-y-4">
            <InboxIcon className="size-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
            <Link href="/" className="text-blue-600 hover:text-orange-600 hover:underline">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium">Secure checkout</h1>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Link href="/checkout" className="flex items-center gap-2 hover:text-orange-400">
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Delivery & Payment */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Section */}
            <DeliverySection />

            {/* Payment Section */}
            <PaymentSection />

            {/* Order Items Summary */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order items</h2>
              <div className="space-y-4">
                {items.map((cartItem, index) => {
                  const product = data?.docs.find((p) => p.id === cartItem.productId);
                  if (!product) return null;
                  
                  const itemPrice = cartItem.variantPrice ?? product.price;
                  
                  return (
                    <div key={`${cartItem.productId}:${cartItem.size || ''}:${cartItem.color || ''}`} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <div className="relative w-20 h-20 border border-gray-300 rounded overflow-hidden bg-white shrink-0">
                        <img
                          src={product.image?.url || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${product.id}`} className="text-sm text-blue-600 hover:text-orange-600 hover:underline line-clamp-2">
                          {product.name}
                        </Link>
                        {cartItem.size && (
                          <p className="text-xs text-gray-600 mt-1">Size: {cartItem.size}</p>
                        )}
                        {cartItem.color && (
                          <p className="text-xs text-gray-600">Color: {cartItem.color}</p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">Quantity: {cartItem.quantity}</p>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          ${(itemPrice * (cartItem.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={orderItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              onPlaceOrder={() => {
                purchase.mutate({
                  cartItems: items.map(item => ({
                    productId: item.productId,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity || 1,
                    variantPrice: item.variantPrice,
                  })),
                });
              }}
              isProcessing={purchase.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
