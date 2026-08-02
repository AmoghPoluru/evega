import { Suspense } from "react";
import { LoaderIcon } from "lucide-react";

import { CheckoutView } from "@/modules/checkout/ui/views/checkout-view";

function CheckoutFallback() {
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutView />
    </Suspense>
  );
}
