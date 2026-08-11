"use client";

import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { TemplateCustomization } from "@/types/template-customization";

interface ColorPickerProps {
  form: UseFormReturn<TemplateCustomization>;
  /** When set, only show these color fields (Tier-1 style panel). */
  fields?: Array<{
    name: string;
    label: string;
    description: string;
  }>;
}

const DEFAULT_COLOR_FIELDS = [
  { name: "colors.primary", label: "Primary Color", description: "Main brand color" },
  { name: "colors.secondary", label: "Secondary Color", description: "Secondary brand color" },
  { name: "colors.accent", label: "Accent Color", description: "Highlight color for CTAs" },
  { name: "colors.background", label: "Background Color", description: "Page background" },
  { name: "colors.text", label: "Text Color", description: "Main text color" },
  { name: "colors.textSecondary", label: "Secondary Text", description: "Muted text color" },
  { name: "colors.border", label: "Border Color", description: "Border and divider color" },
  { name: "colors.cardBackground", label: "Card Background", description: "Card background color" },
];

export function ColorPicker({ form, fields = DEFAULT_COLOR_FIELDS }: ColorPickerProps) {
  const colorFields = fields;

  return (
    <Form {...form}>
      <div className="space-y-4">
        {colorFields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormDescription>{field.description}</FormDescription>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formField.value || "#000000"}
                      onChange={(e) => formField.onChange(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      placeholder="#000000"
                      value={formField.value || ""}
                      onChange={(e) => formField.onChange(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </div>
    </Form>
  );
}
