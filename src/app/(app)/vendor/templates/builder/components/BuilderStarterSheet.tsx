"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeStarterPicker } from "./ThemeStarterPicker";

interface BuilderStarterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectStarter: (slug: string) => void;
  onStartBlank?: () => void;
  activeSlug?: string | null;
}

export function BuilderStarterSheet({
  open,
  onOpenChange,
  onSelectStarter,
  onStartBlank,
  activeSlug,
}: BuilderStarterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>Theme starters</SheetTitle>
          <SheetDescription>
            Swap the entire structure — chrome, hero, colors, typography, and product grid —
            then fine-tune in the customize panels.
          </SheetDescription>
        </SheetHeader>
        <ThemeStarterPicker
          compact
          activeSlug={activeSlug}
          onSelect={(slug) => {
            onSelectStarter(slug);
            onOpenChange(false);
          }}
          onStartBlank={
            onStartBlank
              ? () => {
                  onStartBlank();
                  onOpenChange(false);
                }
              : undefined
          }
        />
      </SheetContent>
    </Sheet>
  );
}
