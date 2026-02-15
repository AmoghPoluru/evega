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
  const { productIds, removeProduct, clearCart } = useCart();
  
  const queryClient = useQueryClient();
  const { data, error, isLoading } = trpc.checkout.getProducts.useQuery({
    ids: productIds,
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

      if (buyNow && productIdsParam) {
        // This was a "Buy Now" purchase - remove only the purchased product(s) from cart
        // This happens after successful payment and order creation via webhook
        const purchasedProductIds = productIdsParam.split(',');
        purchasedProductIds.forEach((id) => {
          removeProduct(id);
        });
        toast.success("Purchase completed! Item removed from cart.");
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
                {data?.docs.map((product, index) => (
                  <CheckoutItem
                    key={product.id}
                    isLast={index === data.docs.length - 1}
                    imageUrl={product.image?.url || undefined}
                    name={product.name}
                    productUrl={`/products/${product.id}`}
                    price={product.price}
                    onRemove={() => removeProduct(product.id)}
                  />
                ))}
              </div>

              {/* Subtotal Footer */}
              <div className="px-6 py-4 border-t border-gray-300 bg-white">
                <div className="flex justify-end">
                  <p className="text-lg text-gray-900">
                    Subtotal ({data?.totalDocs} item{data?.totalDocs !== 1 ? 's' : ''}): 
                    <span className="font-bold ml-2">${data?.totalPrice?.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CheckoutSidebar
              total={data?.totalPrice || 0}
              itemCount={data?.totalDocs || 0}
              onPurchase={() => purchase.mutate({ productIds })}
              isCanceled={states.cancel || false}
              disabled={purchase.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
