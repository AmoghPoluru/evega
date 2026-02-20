"use client";

import Link from "next/link";
import Image from "next/image";
import { Order } from "@/payload-types";
import { formatCurrency } from "@/lib/utils";
import { getStatusColor, getStatusLabel } from "../utils/order-status";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const product = typeof order.product === "object" ? order.product : null;
  const statusColor = getStatusColor(order.status || "pending");
  const statusLabel = getStatusLabel(order.status || "pending");

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Image */}
        <div className="relative w-24 h-24 border border-gray-300 rounded overflow-hidden shrink-0">
          {product?.image && typeof product.image === "object" ? (
            <Image
              src={product.image.url || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-contain p-2"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {product?.name || "Product"}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Order #{order.orderNumber}
              </p>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {order.size && (
                <p className="text-sm text-gray-600 mt-1">Size: {order.size}</p>
              )}
              {order.color && (
                <p className="text-sm text-gray-600">Color: {order.color}</p>
              )}
              {order.quantity && order.quantity > 1 && (
                <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(order.total || 0)}
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
            <Link
              href={`/orders/${order.id}`}
              className="text-sm text-blue-600 hover:text-orange-600 hover:underline font-medium"
            >
              View Details
            </Link>
            {order.status === "complete" && order.trackingNumber && (
              <Link
                href={`/orders/${order.id}/track`}
                className="text-sm text-blue-600 hover:text-orange-600 hover:underline font-medium"
              >
                Track Package
              </Link>
            )}
            {order.status === "complete" && product?.id && (
              <Link
                href={`/products/${product.id}/review`}
                className="text-sm text-blue-600 hover:text-orange-600 hover:underline font-medium"
              >
                Write Review
              </Link>
            )}
            {product?.id && (
              <Link
                href={`/products/${product.id}`}
                className="text-sm text-blue-600 hover:text-orange-600 hover:underline font-medium"
              >
                Buy Again
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
