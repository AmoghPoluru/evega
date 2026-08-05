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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fontGroups } from "@/lib/templates/template-fonts";
import type { TemplateCustomization } from "@/types/template-customization";

interface FontSelectorProps {
  form: UseFormReturn<TemplateCustomization>;
  /** Category/template defaults shown when the vendor has not overridden a font yet. */
  baseFonts?: NonNullable<TemplateCustomization["fonts"]>;
}

function FontSelectItems() {
  return (
    <>
      {fontGroups.map((group) => (
        <SelectGroup key={group.id}>
          <SelectLabel>{group.label}</SelectLabel>
          {group.fonts.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <span style={{ fontFamily: font.value }} className="flex items-center gap-2">
                <span>{font.label}</span>
                {font.sample ? (
                  <span className="text-muted-foreground">{font.sample}</span>
                ) : null}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
    </>
  );
}

export function FontSelector({ form, baseFonts }: FontSelectorProps) {
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
              <Select
                onValueChange={field.onChange}
                value={field.value ?? baseFonts?.heading ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select heading font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
                  <FontSelectItems />
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
              <Select
                onValueChange={field.onChange}
                value={field.value ?? baseFonts?.body ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select body font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
                  <FontSelectItems />
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
