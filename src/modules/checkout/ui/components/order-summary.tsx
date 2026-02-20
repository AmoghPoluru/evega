"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  onPlaceOrder: () => void;
  isProcessing?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
  onPlaceOrder,
  isProcessing = false,
}: OrderSummaryProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 sticky top-4">
      {/* Place Order Button */}
      <Button
        onClick={onPlaceOrder}
        disabled={isProcessing}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3 text-base mb-4"
      >
        {isProcessing ? "Processing..." : "Place your order"}
      </Button>

      {/* Legal Text */}
      <p className="text-xs text-gray-600 mb-4">
        By placing your order, you agree to Evega's{" "}
        <Link href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
          privacy notice
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
          conditions of use
        </Link>
        .
      </p>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Items ({items.reduce((acc, item) => acc + item.quantity, 0)}):</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-700">
          <span>Shipping & handling:</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        
        {shipping > 0 && (
          <div className="flex justify-between text-sm text-green-700">
            <span>Free Shipping:</span>
            <span>-${shipping.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm text-gray-700">
          <span>Estimated tax to be collected:</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-300 pt-2 mt-2">
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Order total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
