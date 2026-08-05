"use client";

import { useMemo, useState } from "react";
import { Sparkles, LayoutTemplate } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  displayStarterName,
  listBuilderThemeStarters,
  type BuilderThemeStarterMeta,
} from "@/lib/templates/builder-theme-starters";

interface ThemeStarterPickerProps {
  onSelect: (slug: string) => void;
  onStartBlank?: () => void;
  activeSlug?: string | null;
  compact?: boolean;
}

function StarterCard({
  meta,
  selected,
  onSelect,
}: {
  meta: BuilderThemeStarterMeta;
  selected: boolean;
  onSelect: () => void;
}) {
  const [primary, secondary, accent] = meta.swatches;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-full rounded-xl border p-4 text-left transition-all hover:shadow-md",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary"
          : "border-border bg-background hover:border-muted-foreground/30",
      )}
    >
      <div className="mb-3 flex gap-1.5">
        <div className="h-10 flex-1 rounded-md" style={{ backgroundColor: primary }} />
        <div className="h-10 w-12 rounded-md" style={{ backgroundColor: secondary }} />
        <div className="h-10 w-8 rounded-md" style={{ backgroundColor: accent }} />
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm">{displayStarterName(meta)}</p>
          {meta.label ? (
            <p className="truncate text-xs text-muted-foreground">Based on {meta.name}</p>
          ) : null}
        </div>
        {meta.featured ? (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            Featured
          </Badge>
        ) : null}
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{meta.description}</p>

      <div className="mt-3 flex flex-wrap gap-1">
        {meta.highlights.slice(0, 4).map((highlight) => (
          <span
            key={highlight}
            className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {highlight}
          </span>
        ))}
      </div>
    </button>
  );
}

export function ThemeStarterPicker({
  onSelect,
  onStartBlank,
  activeSlug,
  compact = false,
}: ThemeStarterPickerProps) {
  const [query, setQuery] = useState("");
  const starters = useMemo(() => listBuilderThemeStarters(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return starters;
    return starters.filter(
      (meta) =>
        displayStarterName(meta).toLowerCase().includes(q) ||
        meta.name.toLowerCase().includes(q) ||
        meta.description.toLowerCase().includes(q) ||
        meta.niche.toLowerCase().includes(q) ||
        meta.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        meta.highlights.some((item) => item.toLowerCase().includes(q)),
    );
  }, [query, starters]);

  const featured = filtered.filter((meta) => meta.featured);
  const rest = filtered.filter((meta) => !meta.featured);

  return (
    <div className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}>
      {!compact ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Start from a theme structure</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick a catalog starter — colors, chrome, hero, typography, and grid layout load
            instantly. Customize everything in the panels on the left.
          </p>
        </div>
      ) : null}

      <Input
        placeholder="Search themes — sport, editorial, chrome, carousel…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9"
      />

      {featured.length > 0 ? (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Featured — build Triumph-style fast
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {featured.map((meta) => (
              <StarterCard
                key={meta.slug}
                meta={meta}
                selected={activeSlug === meta.slug}
                onSelect={() => onSelect(meta.slug)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            All catalog themes
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((meta) => (
              <StarterCard
                key={meta.slug}
                meta={meta}
                selected={activeSlug === meta.slug}
                onSelect={() => onSelect(meta.slug)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No themes match your search.</p>
      ) : null}

      {onStartBlank ? (
        <button
          type="button"
          onClick={onStartBlank}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-4 text-left transition-colors hover:bg-muted/40"
        >
          <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Start blank</p>
            <p className="text-xs text-muted-foreground">
              Minimal defaults only — build every panel from scratch.
            </p>
          </div>
        </button>
      ) : null}
    </div>
  );
}
