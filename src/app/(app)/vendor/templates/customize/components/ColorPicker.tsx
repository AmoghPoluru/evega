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
import { VisualColorPickerField } from "@/components/ui/visual-color-picker";
import type { TemplateCustomization } from "@/types/template-customization";

interface ColorPickerProps {
  form: UseFormReturn<TemplateCustomization>;
  /** Category/template defaults shown when the vendor has not overridden a color yet. */
  baseColors?: NonNullable<TemplateCustomization["colors"]>;
}

export function ColorPicker({ form, baseColors }: ColorPickerProps) {
  const colorFields = [
    {
      name: "colors.primary",
      key: "primary" as const,
      label: "Primary Color",
      description: "Main brand color",
      allowTransparent: false,
    },
    {
      name: "colors.secondary",
      key: "secondary" as const,
      label: "Secondary Color",
      description: "Secondary brand color",
      allowTransparent: false,
    },
    {
      name: "colors.accent",
      key: "accent" as const,
      label: "Accent Color",
      description: "Highlight color for CTAs",
      allowTransparent: false,
    },
    {
      name: "colors.background",
      key: "background" as const,
      label: "Background Color",
      description: "Page background",
      allowTransparent: true,
    },
    {
      name: "colors.text",
      key: "text" as const,
      label: "Text Color",
      description: "Main text color",
      allowTransparent: false,
    },
    {
      name: "colors.textSecondary",
      key: "textSecondary" as const,
      label: "Secondary Text",
      description: "Muted text color",
      allowTransparent: false,
    },
    {
      name: "colors.border",
      key: "border" as const,
      label: "Border Color",
      description: "Border and divider color",
      allowTransparent: false,
    },
    {
      name: "colors.cardBackground",
      key: "cardBackground" as const,
      label: "Card Background",
      description: "Card background color",
      allowTransparent: true,
    },
  ];

  return (
    <Form {...form}>
      <div className="space-y-5">
        {colorFields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as any}
            render={({ field: formField }) => {
              const resolvedValue =
                formField.value ?? baseColors?.[field.key] ?? "#000000";

              return (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormDescription>{field.description}</FormDescription>
                  <FormControl>
                    <VisualColorPickerField
                      value={resolvedValue}
                      onChange={formField.onChange}
                      allowTransparent={field.allowTransparent}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
        ))}
      </div>
    </Form>
  );
}
