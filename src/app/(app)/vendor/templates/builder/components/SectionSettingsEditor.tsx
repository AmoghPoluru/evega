"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { StorefrontSection } from "@/types/template-sections";

interface SectionSettingsEditorProps {
  section: StorefrontSection;
  onChange: (settings: Record<string, unknown>) => void;
}

interface Testimonial {
  quote?: string;
  author?: string;
  role?: string;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/** Per-section settings form used by the storefront builder's section list. */
export function SectionSettingsEditor({ section, onChange }: SectionSettingsEditorProps) {
  const settings = section.settings ?? {};
  const set = (key: string, value: unknown) => onChange({ ...settings, [key]: value });

  if (section.type === "hero") {
    return (
      <div className="space-y-3">
        <ToggleRow
          label="Use vendor hero banners"
          checked={settings.useVendorBanners !== false}
          onCheckedChange={(checked) => set("useVendorBanners", checked)}
        />
        <div className="space-y-1">
          <Label className="text-xs">Fallback title</Label>
          <Input
            placeholder="Defaults to your store name"
            value={text(settings.title)}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Fallback subtitle</Label>
          <Input
            placeholder="Defaults to your store description"
            value={text(settings.subtitle)}
            onChange={(e) => set("subtitle", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Height</Label>
          <Input
            placeholder="480px"
            value={text(settings.height)}
            onChange={(e) => set("height", e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (section.type === "product-grid") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Heading</Label>
          <Input
            placeholder="Products"
            value={text(settings.title)}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <ToggleRow
          label="Show product count"
          checked={settings.showCount !== false}
          onCheckedChange={(checked) => set("showCount", checked)}
        />
      </div>
    );
  }

  if (section.type === "vendor-info") {
    return (
      <div className="space-y-3">
        <ToggleRow
          label="Show breadcrumb"
          checked={settings.showBreadcrumb !== false}
          onCheckedChange={(checked) => set("showBreadcrumb", checked)}
        />
        <ToggleRow
          label="Show contact details"
          checked={settings.showContact !== false}
          onCheckedChange={(checked) => set("showContact", checked)}
        />
        <ToggleRow
          label="Stick to top on scroll"
          checked={settings.sticky !== false}
          onCheckedChange={(checked) => set("sticky", checked)}
        />
      </div>
    );
  }

  if (section.type === "rich-text") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Heading</Label>
          <Input
            placeholder="About us"
            value={text(settings.heading)}
            onChange={(e) => set("heading", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Body</Label>
          <Textarea
            rows={5}
            placeholder="Tell customers about your store"
            value={text(settings.body)}
            onChange={(e) => set("body", e.target.value)}
          />
        </div>
      </div>
    );
  }

  const testimonials: Testimonial[] = Array.isArray(settings.testimonials)
    ? (settings.testimonials as Testimonial[])
    : [];

  const updateTestimonial = (index: number, next: Testimonial) => {
    set(
      "testimonials",
      testimonials.map((item, i) => (i === index ? next : item)),
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input
          placeholder="What customers say"
          value={text(settings.title)}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      {testimonials.map((testimonial, index) => (
        <div key={index} className="space-y-2 rounded-md border border-gray-200 p-3">
          <Textarea
            rows={2}
            placeholder="Quote"
            value={text(testimonial.quote)}
            onChange={(e) => updateTestimonial(index, { ...testimonial, quote: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Author"
              value={text(testimonial.author)}
              onChange={(e) =>
                updateTestimonial(index, { ...testimonial, author: e.target.value })
              }
            />
            <Input
              placeholder="Role"
              value={text(testimonial.role)}
              onChange={(e) => updateTestimonial(index, { ...testimonial, role: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                set(
                  "testimonials",
                  testimonials.filter((_, i) => i !== index),
                )
              }
              aria-label="Remove testimonial"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => set("testimonials", [...testimonials, { quote: "", author: "", role: "" }])}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add testimonial
      </Button>
    </div>
  );
}
