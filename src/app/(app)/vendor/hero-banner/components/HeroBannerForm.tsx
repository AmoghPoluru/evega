"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { HeroBannerPreview } from "./HeroBannerPreview";

const heroBannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  backgroundImage: z.string().optional(),
  products: z.array(z.string()).min(1, "At least one product is required"),
  isActive: z.boolean(),
  order: z.number(),
});

type HeroBannerFormValues = z.infer<typeof heroBannerSchema>;

interface HeroBannerFormProps {
  banner?: any; // Banner to edit, or undefined for create
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HeroBannerForm({ banner, onSuccess, onCancel }: HeroBannerFormProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Get initial image preview from banner
  const getInitialImagePreview = () => {
    if (banner?.backgroundImage) {
      if (typeof banner.backgroundImage === 'object' && banner.backgroundImage.url) {
        return banner.backgroundImage.url;
      }
    }
    return null;
  };
  
  const [imagePreview, setImagePreview] = useState<string | null>(getInitialImagePreview());

  const utils = trpc.useUtils();
  const createMutation = trpc.vendor.heroBanners.create.useMutation({
    onSuccess: () => {
      toast.success("Hero banner created successfully!");
      utils.vendor.heroBanners.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create hero banner");
    },
  });

  const updateMutation = trpc.vendor.heroBanners.update.useMutation({
    onSuccess: () => {
      toast.success("Hero banner updated successfully!");
      utils.vendor.heroBanners.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update hero banner");
    },
  });

  // Fetch vendor's products for selection
  const { data: productsData } = trpc.vendor.products.list.useQuery({
    status: "published",
    limit: 100,
  });

  const form = useForm<HeroBannerFormValues>({
    resolver: zodResolver(heroBannerSchema),
    defaultValues: {
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      backgroundImage: banner?.backgroundImage
        ? typeof banner.backgroundImage === 'string'
          ? banner.backgroundImage
          : banner.backgroundImage.id
        : "",
      products: banner?.products
        ? Array.isArray(banner.products)
          ? banner.products.map((p: any) => typeof p === 'string' ? p : p.id)
          : []
        : [],
      isActive: banner?.isActive !== undefined ? banner.isActive : true,
      order: banner?.order !== undefined ? banner.order : 0,
    },
  });

  const watchedValues = form.watch();
  const selectedProducts = watchedValues.products || [];

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      if (data.doc?.id) {
        form.setValue("backgroundImage", data.doc.id);
        setImagePreview(data.doc.url);
        toast.success("Image uploaded successfully");
      }
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (values: HeroBannerFormValues) => {
    if (banner?.id) {
      // Update existing banner
      updateMutation.mutate({
        id: banner.id,
        ...values,
      });
    } else {
      // Create new banner
      createMutation.mutate(values);
    }
  };

  // Get selected product details for preview
  const selectedProductDetails = useMemo(() => {
    if (!productsData?.docs || !selectedProducts.length) return [];
    return productsData.docs.filter((p: any) => selectedProducts.includes(p.id));
  }, [productsData, selectedProducts]);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Active Toggle */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <FormDescription>
                    Only active hero banners will be displayed on your vendor page
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Welcome to [Your Vendor Name]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Main title displayed on the hero banner
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subtitle */}
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Subtitle (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your tagline or description"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional subtitle text displayed below the title
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Background Image */}
          <FormField
            control={form.control}
            name="backgroundImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image (Optional)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-md overflow-hidden border">
                        <Image
                          src={imagePreview}
                          alt="Background preview"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            field.onChange("");
                            setImagePreview(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-md p-4">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file);
                              }
                            }}
                            disabled={uploadingImage}
                          />
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {uploadingImage ? "Uploading..." : "Click to upload background image"}
                            </span>
                            <span className="text-xs text-gray-500">
                              Recommended: 1920x500px
                            </span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Background image for the hero banner. If not set, a gradient will be used.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Featured Products */}
          <FormField
            control={form.control}
            name="products"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Products</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {productsData?.docs && productsData.docs.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto border rounded-md p-4">
                        {productsData.docs.map((product: any) => {
                          const isSelected = field.value?.includes(product.id);
                          const productImage = product.image && typeof product.image === 'object' && product.image.url
                            ? product.image.url
                            : '/placeholder.png';

                          return (
                            <label
                              key={product.id}
                              className={`relative cursor-pointer border-2 rounded-md p-2 transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isSelected}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...current, product.id]);
                                  } else {
                                    field.onChange(current.filter((id: string) => id !== product.id));
                                  }
                                }}
                              />
                              <div className="space-y-2">
                                <div className="relative w-full h-24 rounded overflow-hidden bg-gray-50">
                                  <Image
                                    src={productImage}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                                <p className="text-xs text-gray-500">${product.price}</p>
                              </div>
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1 flex items-center justify-center">
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No published products available. Create products first.</p>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Select 4-6 products to display in the hero banner (recommended)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Order */}
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Display order (lower numbers appear first, if multiple banners exist)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Preview */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <HeroBannerPreview
              title={watchedValues.title || "Banner Title"}
              subtitle={watchedValues.subtitle}
              backgroundImage={imagePreview}
              products={selectedProductDetails}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {banner?.id ? "Update Banner" : "Create Banner"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
