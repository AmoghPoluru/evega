"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { User, MapPin } from "lucide-react";
import { AddressesView } from "./addresses-view";

type Tab = "profile" | "addresses";

export function AccountView({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === "profile" ? "profile" : "addresses"
  );

  useEffect(() => {
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else if (tabParam === "addresses") {
      setActiveTab("addresses");
    }
  }, [tabParam]);

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-medium text-gray-900 mb-8">My Account</h1>

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "profile"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile Information
              </div>
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "addresses"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Addresses
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          {activeTab === "profile" && (
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-4">Profile Information</h2>
              <p className="text-gray-600">Profile settings coming soon...</p>
            </div>
          )}

          {activeTab === "addresses" && <AddressesView userId={userId} />}
        </div>
      </div>
    </div>
  );
}
