"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
  step?: number;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const PriceRangeSlider = ({
  minPrice,
  maxPrice,
  value,
  onChange,
  className,
  step = 1,
}: PriceRangeSliderProps) => {
  const [isDragging, setIsDragging] = React.useState<"min" | "max" | null>(null);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const range = maxPrice - minPrice;
  const minPercent = ((value[0] - minPrice) / range) * 100;
  const maxPercent = ((value[1] - minPrice) / range) * 100;

  // Calculate which handle should be on top based on their positions
  // Max handle should always be on top when not dragging, so it's always clickable
  const minZIndex = 10;
  const maxZIndex = 25; // Higher z-index so max handle is always clickable

  const handleMouseDown = (handle: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(handle);
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newValue = minPrice + (percent / 100) * range;
      const steppedValue = Math.round(newValue / step) * step;
      
      // Clamp to valid range
      const clampedValue = Math.max(minPrice, Math.min(maxPrice, steppedValue));

      if (isDragging === "min") {
        // Min handle can go anywhere up to maxPrice, can equal max value
        const newMin = Math.min(clampedValue, maxPrice);
        onChange([newMin, value[1]]);
      } else {
        // Max handle can go anywhere from minPrice to maxPrice
        const newMax = Math.max(minPrice, Math.min(clampedValue, maxPrice));
        onChange([value[0], newMax]);
      }
    },
    [isDragging, minPrice, maxPrice, range, step, value, onChange]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchStart = (handle: "min" | "max") => (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !sliderRef.current) return;
      e.preventDefault();

      const rect = sliderRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      if (!touch) return;
      
      const x = touch.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newValue = minPrice + (percent / 100) * range;
      const steppedValue = Math.round(newValue / step) * step;
      
      // Clamp to valid range
      const clampedValue = Math.max(minPrice, Math.min(maxPrice, steppedValue));

      if (isDragging === "min") {
        // Min handle can go anywhere up to maxPrice, can equal max value
        const newMin = Math.min(clampedValue, maxPrice);
        onChange([newMin, value[1]]);
      } else {
        // Max handle can go anywhere from minPrice to maxPrice
        const newMax = Math.max(minPrice, Math.min(clampedValue, maxPrice));
        onChange([value[0], newMax]);
      }
    },
    [isDragging, minPrice, maxPrice, range, step, value, onChange]
  );

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  return (
    <div className={cn("w-full", className)}>
      {/* Price Display */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">
          {formatPrice(value[0])} - {formatPrice(value[1])}
          {value[1] >= maxPrice && "+"}
        </div>
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className="relative h-2 w-full rounded-full bg-gray-200 cursor-pointer"
        role="slider"
        aria-label="Price range"
        aria-valuemin={minPrice}
        aria-valuemax={maxPrice}
        aria-valuenow={value[0]}
      >
        {/* Active Range */}
        <div
          className="absolute h-2 rounded-full bg-blue-600 pointer-events-none"
          style={{
            left: `${Math.min(minPercent, maxPercent)}%`,
            width: `${Math.abs(maxPercent - minPercent)}%`,
          }}
        />

        {/* Min Handle */}
        <button
          type="button"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full border-2 border-blue-600 bg-white shadow-lg cursor-grab active:cursor-grabbing",
            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform",
            isDragging === "min" && "scale-110 cursor-grabbing z-30"
          )}
          style={{ 
            left: `${minPercent}%`, 
            zIndex: isDragging === "min" ? 30 : minZIndex,
            pointerEvents: "auto"
          }}
          onMouseDown={handleMouseDown("min")}
          onTouchStart={handleTouchStart("min")}
          aria-label="Minimum price"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-2 w-2 rounded-full bg-blue-600" />
          </div>
        </button>

        {/* Max Handle */}
        <button
          type="button"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full border-2 border-blue-600 bg-white shadow-lg cursor-grab active:cursor-grabbing",
            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform",
            isDragging === "max" && "scale-110 cursor-grabbing z-30"
          )}
          style={{ 
            left: `${maxPercent}%`, 
            zIndex: isDragging === "max" ? 30 : maxZIndex,
            pointerEvents: "auto"
          }}
          onMouseDown={handleMouseDown("max")}
          onTouchStart={handleTouchStart("max")}
          aria-label="Maximum price"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-2 w-2 rounded-full bg-blue-600" />
          </div>
        </button>
      </div>

      {/* Min/Max Labels */}
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{formatPrice(minPrice)}</span>
        <span>{formatPrice(maxPrice)}+</span>
      </div>
    </div>
  );
};
