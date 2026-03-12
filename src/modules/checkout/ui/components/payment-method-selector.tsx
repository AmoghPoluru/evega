"use client";

import { useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Phone, MessageCircle } from "lucide-react";

interface PaymentMethodSelectorProps {
  vendor: {
    stripeAccountId?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    offlinePaymentInstructions?: string | null;
    preferredPaymentMethod?: "stripe" | "offline" | "both";
  };
  selectedMethod: "stripe" | "offline";
  onMethodChange: (method: "stripe" | "offline") => void;
  customerPhone?: string;
  onPhoneChange: (phone: string) => void;
}

export function PaymentMethodSelector({
  vendor,
  selectedMethod,
  onMethodChange,
  customerPhone = "",
  onPhoneChange,
}: PaymentMethodSelectorProps) {
  const hasStripe = !!vendor.stripeAccountId;
  const showStripe = hasStripe && (vendor.preferredPaymentMethod === "stripe" || vendor.preferredPaymentMethod === "both");
  const showOffline = vendor.preferredPaymentMethod === "offline" || vendor.preferredPaymentMethod === "both";

  // If only one option is available, auto-select it (using useEffect to avoid setState during render)
  useEffect(() => {
    if (showStripe && !showOffline && selectedMethod !== "stripe") {
      onMethodChange("stripe");
    } else if (!showStripe && showOffline && selectedMethod !== "offline") {
      onMethodChange("offline");
    }
  }, [showStripe, showOffline, selectedMethod, onMethodChange]);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
      <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
        {showStripe && (
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="stripe" id="stripe" className="mt-1" />
            <Label htmlFor="stripe" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-700" />
                <span className="font-medium">Pay with Credit/Debit Card (Stripe)</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Secure payment processed through Stripe
              </p>
            </Label>
          </div>
        )}
        
        {showOffline && (
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="offline" id="offline" className="mt-1" />
            <Label htmlFor="offline" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-gray-700" />
                <span className="font-medium">Offline Payment - Vendor Will Contact You</span>
              </div>
              {selectedMethod === "offline" && (
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <Label htmlFor="customer-phone" className="text-sm font-medium text-gray-700 mb-1 block">
                      Your Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="customer-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={customerPhone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      The vendor will contact you at this number to complete the payment
                    </p>
                  </div>
                  {vendor.offlinePaymentInstructions && (
                    <div className="mt-2 p-3 bg-gray-50 rounded text-gray-700 border border-gray-200">
                      <p className="font-medium mb-1 text-xs uppercase text-gray-600">Payment Instructions:</p>
                      <p className="text-sm">{vendor.offlinePaymentInstructions}</p>
                    </div>
                  )}
                </div>
              )}
            </Label>
          </div>
        )}
      </RadioGroup>
    </div>
  );
}
