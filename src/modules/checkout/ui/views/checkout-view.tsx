"use client";

import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { InboxIcon, LoaderIcon, ShoppingCart, ChevronDown, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { trpc } from "@/trpc/client";
import { Media } from "@/payload-types";

import { useCart } from "../../hooks/use-cart";
import { useCheckoutStates } from "../../hooks/use-checkout-states";
import { DeliverySection } from "../components/delivery-section";
import { GuestCheckoutForm, type GuestCheckoutFormRef } from "../components/guest-checkout-form";
import { PaymentSection } from "../components/payment-section";
import { PaymentMethodSelector } from "../components/payment-method-selector";
import { OrderSummary } from "../components/order-summary";

export const CheckoutView = () => {
  const router = useRouter();
  const guestFormRef = useRef<GuestCheckoutFormRef>(null);
  const [states, setStates] = useCheckoutStates();
  const { items, removeProduct, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "offline">("stripe");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  
  const queryClient = useQueryClient();
  const productIds = Array.from(new Set(items.map(item => item.productId)));

  const { data: session } = trpc.auth.session.useQuery();
  const isLoggedIn = !!session?.user;
  
  const { data, error, isLoading } = trpc.checkout.getProducts.useQuery({
    ids: productIds.length > 0 ? productIds : [],
  });

  const vendorId = useMemo(() => {
    if (!data?.docs || data.docs.length === 0) return null;
    const vendor = data.docs[0].vendor;
    return typeof vendor === "string" ? vendor : vendor?.id;
  }, [data]);

  const { data: vendorData } = trpc.vendor.getOne.useQuery(
    { id: vendorId! },
    { enabled: !!vendorId }
  );

  const { data: userAddresses } = trpc.addresses.getUserAddresses.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  const hasShippingAddress =
    isLoggedIn &&
    !!userAddresses?.shippingAddresses &&
    userAddresses.shippingAddresses.length > 0;

  const canPlaceOrder = isLoggedIn ? hasShippingAddress : true;

  const purchase = trpc.checkout.purchase.useMutation({
    onMutate: () => {
      setStates({ success: false, cancel: false });
    },
    onSuccess: (data) => {
      if (data.paymentMethod === "offline" && data.orderId) {
        clearCart();
        toast.success("Order placed! Please contact vendor to complete payment.");
        const guestQuery =
          "guestEmail" in data && data.guestEmail
            ? `&email=${encodeURIComponent(data.guestEmail)}`
            : "";
        router.push(`/orders/${data.orderId}?payment=pending${guestQuery}`);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        clearCart();
        toast.success("Purchase completed successfully");
        setStates({ success: true, cancel: false });
      }
    },
    onError: (error) => {
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
          purchasedCartItems.forEach((item: { productId: string; size?: string; color?: string }) => {
            removeProduct(item.productId, item.size, item.color);
          });
          toast.success("Purchase completed! Item(s) removed from cart.");
        } catch {
          clearCart();
          toast.success("Purchase completed! Cart cleared.");
        }
      } else {
        clearCart();
        toast.success("Order placed successfully! Cart cleared.");
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
      toast.warning("Some products in your cart are invalid or out of stock, cart cleared.");
    } else if (error?.data?.code === "BAD_REQUEST") {
      toast.error(error.message);
    }
  }, [error, clearCart]);

  const orderItems = useMemo(() => {
    if (!data?.docs) return [];
    return items.map(cartItem => {
      const product = data.docs.find((p: { id: string; price: number; name: string }) => p.id === cartItem.productId);
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
  const shipping = subtotal >= 75 ? 0 : 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (isLoggedIn && !hasShippingAddress) {
      toast.error("Please add a shipping address before placing your order");
      router.push("/account?tab=addresses");
      return;
    }

    let guestPayload: { guestEmail: string; guestShippingAddress: import("@/modules/checkout/guest-checkout-schema").GuestShippingAddress } | undefined;

    if (!isLoggedIn) {
      const guestData = await guestFormRef.current?.validate();
      if (!guestData) {
        toast.error("Please complete your contact and delivery details");
        return;
      }
      guestPayload = guestData;
    }

    if (isLoggedIn && paymentMethod === "offline" && !customerPhone.trim()) {
      toast.error("Please enter your phone number for offline payment. The vendor will contact you.");
      return;
    }

    purchase.mutate({
      cartItems: items.map(item => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity || 1,
        variantPrice: item.variantPrice,
      })),
      paymentMethod,
      customerPhone: isLoggedIn && paymentMethod === "offline" ? customerPhone.trim() : undefined,
      ...guestPayload,
    });
  };

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
          <div className="lg:col-span-2 space-y-4">
            {isLoggedIn ? <DeliverySection /> : <GuestCheckoutForm ref={guestFormRef} />}

            {vendorData ? (
              <PaymentMethodSelector
                vendor={vendorData}
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                customerPhone={customerPhone}
                onPhoneChange={setCustomerPhone}
                hideCustomerPhone={!isLoggedIn}
              />
            ) : (
              <PaymentSection />
            )}

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order items</h2>
              <div className="space-y-4">
                {items.map((cartItem) => {
                  const product = data?.docs.find((p: { id: string; price: number; name: string; image?: Media | null }) => p.id === cartItem.productId);
                  if (!product) return null;
                  
                  const itemPrice = cartItem.variantPrice ?? product.price;
                  
                  return (
                    <div key={`${cartItem.productId}:${cartItem.size || ''}:${cartItem.color || ''}`} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 relative group">
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
                      <button
                        onClick={() => {
                          removeProduct(cartItem.productId, cartItem.size, cartItem.color);
                          toast.success("Item removed from cart");
                        }}
                        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label="Remove item from cart"
                        title="Remove item"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              items={orderItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              canPlaceOrder={canPlaceOrder}
              isGuest={!isLoggedIn}
              onPlaceOrder={handlePlaceOrder}
              isProcessing={purchase.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
