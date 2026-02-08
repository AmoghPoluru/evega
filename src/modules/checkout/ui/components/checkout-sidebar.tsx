"use client";

import { Button } from "@/components/ui/button";

interface CheckoutSidebarProps {
  total: number;
  itemCount?: number;
  onPurchase: () => void;
  isCanceled: boolean;
  disabled: boolean;
}

export const CheckoutSidebar = ({
  total,
  itemCount = 1,
  onPurchase,
  isCanceled,
  disabled,
}: CheckoutSidebarProps) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 sticky top-4">
      <div className="space-y-4">
        {/* Gift Checkbox */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded cursor-pointer
                     checked:bg-blue-600 checked:border-blue-600 flex-shrink-0"
          />
          <span className="text-sm text-gray-700">This order contains a gift</span>
        </label>

        {/* Subtotal */}
        <div className="pt-2">
          <p className="text-lg text-gray-900">
            Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''}): 
            <span className="font-bold ml-2">${total.toFixed(2)}</span>
          </p>
        </div>

        {/* Proceed to Checkout Button */}
        <Button
          onClick={onPurchase}
          disabled={disabled || isCanceled}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-full py-3 text-sm shadow-sm"
        >
          {disabled ? "Processing..." : "Proceed to checkout"}
        </Button>

        {/* Related Products Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Related products with fast delivery
          </h3>

          {/* Related Product */}
          <div className="space-y-4">
            <div className="flex gap-3">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <div className="relative w-20 h-20 border border-gray-300 rounded overflow-hidden bg-white">
                  <img
                    src="/placeholder.png"
                    alt="Related product"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <a href="#" className="text-sm text-blue-600 hover:text-orange-600 hover:underline line-clamp-2">
                  Related Product
                </a>
                <p className="text-xs text-gray-600 mt-0.5">by Evega Store</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex text-orange-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">254</span>
                </div>

                <p className="text-xs text-gray-600 mt-0.5">Paperback</p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-medium text-gray-900">$31.61</span>
                </div>
                <p className="text-xs text-gray-600">32 pts</p>

                {/* Premium Delivery */}
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-blue-400 font-bold text-xs">✓premium</span>
                  <span className="text-xs text-gray-700 font-medium">FREE Delivery</span>
                </div>
                <p className="text-xs text-gray-700 font-bold">Tomorrow, Feb 9</p>

                {/* Add to Cart Button */}
                <Button
                  className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-full py-1 text-xs h-auto"
                >
                  Add to cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
