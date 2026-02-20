"use client";

import Link from "next/link";
import { CreditCard, ChevronDown } from "lucide-react";

export function PaymentSection() {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Paying with
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-medium">Credit or Debit Card</p>
            <p className="text-gray-600">Card ending in ••••</p>
          </div>
        </div>
        <Link
          href="#"
          className="text-blue-600 hover:text-orange-600 hover:underline text-sm font-medium"
        >
          Change
        </Link>
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-200">
        <Link
          href="#"
          className="text-sm text-blue-600 hover:text-orange-600 hover:underline block"
        >
          Select a payment plan
        </Link>
        <Link
          href="#"
          className="text-sm text-blue-600 hover:text-orange-600 hover:underline flex items-center gap-1"
        >
          Use gift card, voucher, or promo code
        </Link>
      </div>
    </div>
  );
}
