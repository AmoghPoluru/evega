"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import {
  backgroundTreatmentPreviewStyle,
  type BackgroundStyleCategory,
} from "@/lib/templates/background-style-treatments";

interface BackgroundStyleSwatchProps {
  seedColor: string;
  type: BackgroundStyleCategory;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export function BackgroundStyleSwatch({
  seedColor,
  type,
  label,
  description,
  selected,
  onSelect,
}: BackgroundStyleSwatchProps) {
  const previewStyle = useMemo(
    () => backgroundTreatmentPreviewStyle(seedColor, type),
    [seedColor, type],
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-2.5 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-muted-foreground/40 hover:bg-muted/40",
      )}
    >
      <div
        className="mb-2 h-14 w-full overflow-hidden rounded-md border border-black/10 shadow-inner"
        style={previewStyle}
        aria-hidden
      />
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </button>
  );
}
