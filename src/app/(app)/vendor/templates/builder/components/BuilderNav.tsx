"use client";

import { cn } from "@/lib/utils";
import { BUILDER_PANELS, type BuilderPanelId } from "./builder-panels";

interface BuilderNavProps {
  active: BuilderPanelId;
  onChange: (panel: BuilderPanelId) => void;
}

export function BuilderNav({ active, onChange }: BuilderNavProps) {
  return (
    <nav className="flex h-full w-52 shrink-0 flex-col border-r border-border bg-muted/40">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Customize
        </p>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {BUILDER_PANELS.map((panel) => (
          <li key={panel.id}>
            <button
              type="button"
              onClick={() => onChange(panel.id)}
              className={cn(
                "w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                active === panel.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {panel.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
