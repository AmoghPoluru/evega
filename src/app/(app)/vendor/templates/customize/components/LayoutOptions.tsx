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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TemplateCustomization } from "@/types/template-customization";

interface LayoutOptionsProps {
  form: UseFormReturn<TemplateCustomization>;
}

export function LayoutOptions({ form }: LayoutOptionsProps) {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="layout.productGridColumns"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Grid Columns</FormLabel>
              <FormDescription>Number of columns in product grid (2-6)</FormDescription>
              <FormControl>
                <Input
                  type="number"
                  min={2}
                  max={6}
                  value={field.value || 4}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="layout.showBanner"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Show Hero Banner</FormLabel>
                <FormDescription>Display hero banner on vendor page</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="layout.showCategories"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Show Categories</FormLabel>
                <FormDescription>Display category navigation</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="layout.showFilters"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Show Filters</FormLabel>
                <FormDescription>Display product filters</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="layout.showReviews"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Show Reviews</FormLabel>
                <FormDescription>Display product reviews</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="components.heroBanner.style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Banner Style</FormLabel>
              <FormDescription>Choose banner layout style</FormDescription>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="full-width">Full Width</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="components.productCard.style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Card Style</FormLabel>
              <FormDescription>Choose product card design</FormDescription>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
