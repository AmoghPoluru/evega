"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Trash2Icon, ChevronDown } from "lucide-react";

interface CheckoutItemProps {
  imageUrl?: string;
  name: string;
  productUrl: string;
  price: number;
  onRemove: () => void;
  isLast?: boolean;
}

export const CheckoutItem = ({
  imageUrl,
  name,
  productUrl,
  price,
  onRemove,
  isLast = false,
}: CheckoutItemProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isSelected, setIsSelected] = useState(true);

  return (
    <div className={`px-6 py-5 ${!isLast ? 'border-b border-gray-300' : ''}`}>
      <div className="flex gap-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => setIsSelected(e.target.checked)}
            className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer
                     checked:bg-blue-600 checked:border-blue-600
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          />
        </div>

        {/* Product Image */}
        <div className="flex-shrink-0">
          <Link href={productUrl}>
            <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
              <Image
                src={imageUrl || "/placeholder.png"}
                alt={name}
                fill
                className="object-contain p-2"
              />
            </div>
          </Link>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <div className="flex-1">
              {/* Product Name */}
              <Link href={productUrl}>
                <h3 className="text-base font-medium text-gray-900 hover:text-orange-600 line-clamp-2">
                  {name}
                </h3>
              </Link>

              {/* Format/Type */}
              <p className="text-sm text-gray-600 mt-1">
                by <span className="text-blue-600 hover:text-orange-600 cursor-pointer">Evega Store</span>
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">Hardcover</p>

              {/* Stock Status */}
              <p className="text-sm text-red-600 font-medium mt-2">
                Only 1 left in stock - order soon.
              </p>

              {/* Premium Badge */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-blue-400 font-bold text-base">✓premium</span>
                <span className="text-sm text-gray-900 font-medium">Tomorrow</span>
              </div>

              {/* Pickup Info */}
              <p className="text-sm text-gray-900 mt-1">
                <span className="font-medium">FREE pickup</span>{" "}
                <span className="font-bold">Tomorrow, Feb 9</span>
              </p>

              {/* Returns */}
              <p className="text-sm text-blue-600 hover:text-orange-600 cursor-pointer mt-1">
                FREE Returns
              </p>

              {/* Gift Checkbox */}
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer
                           checked:bg-blue-600 checked:border-blue-600"
                />
                <span className="text-sm text-gray-700">
                  This is a gift{" "}
                  <a href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
                    Learn more
                  </a>
                </span>
              </label>

              {/* Format Selector */}
              <div className="mt-3">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Format:</span> Hardcover
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-4">
                {/* Quantity Selector */}
                <div className="relative">
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="px-3 py-1.5 pr-8 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
                </div>

                {/* Delete Link */}
                <button
                  onClick={onRemove}
                  className="text-sm text-blue-600 hover:text-orange-600 hover:underline"
                >
                  Delete
                </button>

                {/* Save for Later */}
                <button className="text-sm text-blue-600 hover:text-orange-600 hover:underline">
                  Save for later
                </button>

                {/* Compare */}
                <button className="text-sm text-blue-600 hover:text-orange-600 hover:underline">
                  Compare with similar items
                </button>

                {/* Share */}
                <button className="text-sm text-blue-600 hover:text-orange-600 hover:underline">
                  Share
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex-shrink-0 ml-6">
              <p className="text-lg font-bold text-gray-900">${price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
