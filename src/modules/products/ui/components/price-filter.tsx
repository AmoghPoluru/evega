"use client";

import { useState, useEffect } from "react";

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

const formatPrice = (price: number, maxPrice: number) => {
  return price >= maxPrice 
    ? `$${price.toLocaleString()}+` 
    : `$${price.toLocaleString()}`;
};

export const PriceFilter = ({
  minPrice,
  maxPrice,
  priceRange,
  onPriceRangeChange,
}: PriceFilterProps) => {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);

  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    if (newMin <= localPriceRange[1]) {
      const newRange: [number, number] = [newMin, localPriceRange[1]];
      setLocalPriceRange(newRange);
      onPriceRangeChange(newRange);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    if (newMax >= localPriceRange[0]) {
      const newRange: [number, number] = [localPriceRange[0], newMax];
      setLocalPriceRange(newRange);
      onPriceRangeChange(newRange);
    }
  };

  const minPercent = ((localPriceRange[0] - minPrice) / (maxPrice - minPrice)) * 100;
  const maxPercent = ((localPriceRange[1] - minPrice) / (maxPrice - minPrice)) * 100;

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Price</h3>
      
      <div className="text-lg font-semibold text-gray-900 mb-6">
        {formatPrice(localPriceRange[0], maxPrice)} - {formatPrice(localPriceRange[1], maxPrice)}
      </div>

      {/* Price Range Slider */}
      <div className="relative pt-1">
        <div className="relative h-2 bg-gray-200 rounded-full">
          {/* Active range bar */}
          <div
            className="absolute h-2 bg-black rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
          
          {/* Min price handle */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={100}
            value={localPriceRange[0]}
            onChange={handleMinChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-auto
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-6
                     [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-black
                     [&::-webkit-slider-thumb]:border-4
                     [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-moz-range-thumb]:w-6
                     [&::-moz-range-thumb]:h-6
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-black
                     [&::-moz-range-thumb]:border-4
                     [&::-moz-range-thumb]:border-white
                     [&::-moz-range-thumb]:shadow-lg
                     [&::-moz-range-thumb]:cursor-pointer"
            style={{ zIndex: localPriceRange[0] > (minPrice + maxPrice) / 2 ? 4 : 3 }}
          />
          
          {/* Max price handle */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={100}
            value={localPriceRange[1]}
            onChange={handleMaxChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-auto
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-6
                     [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-black
                     [&::-webkit-slider-thumb]:border-4
                     [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-moz-range-thumb]:w-6
                     [&::-moz-range-thumb]:h-6
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-black
                     [&::-moz-range-thumb]:border-4
                     [&::-moz-range-thumb]:border-white
                     [&::-moz-range-thumb]:shadow-lg
                     [&::-moz-range-thumb]:cursor-pointer"
            style={{ zIndex: localPriceRange[1] <= (minPrice + maxPrice) / 2 ? 4 : 3 }}
          />
        </div>
      </div>
    </div>
  );
};
