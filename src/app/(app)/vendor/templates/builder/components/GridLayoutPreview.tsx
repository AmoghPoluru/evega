"use client";

import type { EcommerceGridLayout } from "@/lib/templates/product-grid-layouts";
import { cn } from "@/lib/utils";

interface GridLayoutPreviewProps {
  layout: EcommerceGridLayout;
  selected: boolean;
  label: string;
  description: string;
  tradeOff: string;
  columns: { desktop: number; tablet: number; mobile: number };
  onSelect: () => void;
}

/** Mini wireframe preview for each e-commerce grid layout. */
export function GridLayoutPreview({
  layout,
  selected,
  label,
  description,
  tradeOff,
  columns,
  onSelect,
}: GridLayoutPreviewProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-muted-foreground/40 hover:bg-muted/50",
      )}
    >
      <LayoutWireframe layout={layout} />
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      <p className="mt-1 text-[11px] text-muted-foreground/80 italic">{tradeOff}</p>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Desktop {columns.desktop} · Tablet {columns.tablet} · Mobile {columns.mobile}
      </p>
    </button>
  );
}

function LayoutWireframe({ layout }: { layout: EcommerceGridLayout }) {
  const cell = "rounded-sm bg-muted-foreground/25";

  if (layout === "bento") {
    return (
      <div className="grid h-16 grid-cols-4 grid-rows-2 gap-1">
        <div className={cn(cell, "col-span-2 row-span-2")} />
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
      </div>
    );
  }

  if (layout === "two-column") {
    return (
      <div className="grid h-16 grid-cols-2 gap-1.5">
        <div className={cn(cell, "h-full")} />
        <div className={cn(cell, "h-full")} />
      </div>
    );
  }

  if (layout === "dense-multi") {
    return (
      <div className="grid h-16 grid-cols-6 gap-0.5">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className={cn(cell, "h-5")} />
        ))}
      </div>
    );
  }

  if (layout === "masonry") {
    return (
      <div className="flex h-16 gap-1">
        {[["h-10", "h-6"], ["h-6", "h-10"], ["h-8", "h-8"], ["h-5", "h-11"]].map((heights, col) => (
          <div key={col} className="flex flex-1 flex-col gap-1">
            {heights.map((height, row) => (
              <div key={row} className={cn(cell, height, "w-full")} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (layout === "hierarchical-promo") {
    return (
      <div className="grid h-16 grid-cols-4 gap-1">
        <div
          className={cn(
            cell,
            "col-span-2 row-span-2 h-full border border-dashed border-muted-foreground/40 bg-muted-foreground/10",
          )}
        />
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
      </div>
    );
  }

  if (layout === "hybrid-toggle") {
    return (
      <div className="space-y-1">
        <div className="flex justify-end gap-1">
          <div className={cn(cell, "h-2 w-6")} />
          <div className={cn(cell, "h-2 w-6 opacity-40")} />
        </div>
        <div className="grid h-12 grid-cols-3 gap-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={cn(cell, "h-full")} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-16 grid-cols-4 gap-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={cn(cell, "h-full")} />
      ))}
    </div>
  );
}
