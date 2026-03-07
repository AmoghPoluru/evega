"use client";

import { trpc } from "@/trpc/client";
import { OrderCard } from "../components/order-card";
import { LoaderIcon, Package } from "lucide-react";
import Link from "next/link";
import type { Order } from "@/payload-types";

interface OrdersViewProps {
  userId: string;
}

export function OrdersView({ userId }: OrdersViewProps) {
  const { data, isLoading, error } = trpc.orders.getByUser.useQuery({});

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <LoaderIcon className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>
          <div className="bg-white border border-red-300 rounded-lg p-8 text-center">
            <p className="text-red-600 mb-4">Error loading orders</p>
            <p className="text-sm text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.docs || data.docs.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>
          <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No orders yet</p>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              href="/"
              className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            You have {data.totalDocs} order{data.totalDocs !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-4">
          {data.docs.map((order: Order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        {/* Pagination */}
        {(data.hasNextPage || data.hasPrevPage) && (
          <div className="mt-8 flex justify-center gap-4">
            {data.hasPrevPage && data.prevPage && (
              <button
                onClick={() => {
                  // TODO: Implement pagination
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            {data.hasNextPage && data.nextPage && (
              <button
                onClick={() => {
                  // TODO: Implement pagination
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
