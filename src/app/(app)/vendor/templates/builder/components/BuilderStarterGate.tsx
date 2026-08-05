"use client";

import { ThemeStarterPicker } from "./ThemeStarterPicker";

interface BuilderStarterGateProps {
  onSelect: (slug: string) => void;
  onStartBlank: () => void;
}

/** Full-screen first step when opening the builder without a source template. */
export function BuilderStarterGate({ onSelect, onStartBlank }: BuilderStarterGateProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <div className="border-b border-border px-6 py-5">
        <h1 className="text-xl font-semibold">Create your storefront theme</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Choose a starter structure — like Triumph Sport with utility bar, carousel hero, and pill
          CTAs — then customize every color, font, and layout value in the builder.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-5xl">
          <ThemeStarterPicker onSelect={onSelect} onStartBlank={onStartBlank} />
        </div>
      </div>
    </div>
  );
}
