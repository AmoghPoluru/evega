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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TemplateCustomization } from "@/types/template-customization";

interface FontSelectorProps {
  form: UseFormReturn<TemplateCustomization>;
}

const systemFonts = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Courier New, monospace", label: "Courier New" },
];

const googleFonts = [
  { value: "Inter, system-ui, sans-serif", label: "Inter" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "Open Sans, sans-serif", label: "Open Sans" },
  { value: "Lato, sans-serif", label: "Lato" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Playfair Display, serif", label: "Playfair Display" },
  { value: "Lora, serif", label: "Lora" },
  { value: "Nunito, sans-serif", label: "Nunito" },
];

const allFonts = [...systemFonts, ...googleFonts];

export function FontSelector({ form }: FontSelectorProps) {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="fonts.heading"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heading Font</FormLabel>
              <FormDescription>Font for headings and titles</FormDescription>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select heading font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allFonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fonts.body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Font</FormLabel>
              <FormDescription>Font for body text and descriptions</FormDescription>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select body font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allFonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
