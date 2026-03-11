"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Upload, Eye } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/payload-types";
import { ProductPreviewModal } from "./ProductPreviewModal";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  image: z.string().optional(),
  cover: z.string().optional(),
  video: z.string().optional(),
  refundPolicy: z.enum(["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"]).optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(
    z.object({
      variantData: z.record(z.string(), z.any()), // Dynamic variant data based on category
      stock: z.number().min(0),
      price: z.number().optional(),
    })
  ).optional(),
  isPrivate: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const queryClient = trpc.useUtils();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: "", // Rich text will be handled separately if needed
      price: product?.price || 0,
      category: typeof product?.category === "string" ? product.category : product?.category?.id || "",
      subcategory: typeof product?.subcategory === "string" ? product.subcategory : product?.subcategory?.id || "",
      image: typeof product?.image === "string" ? product.image : product?.image?.id || "",
      cover: typeof product?.cover === "string" ? product.cover : product?.cover?.id || "",
      video: typeof product?.video === "string" ? product.video : product?.video?.id || "",
      refundPolicy: product?.refundPolicy || "30-day",
      tags: product?.tags
        ? product.tags.map((tag) => (typeof tag === "string" ? tag : tag.id))
        : [],
      variants: product?.variants?.map((v: any) => ({
        variantData: v.variantData || (v.size || v.color ? { size: v.size, color: v.color } : {}),
        stock: v.stock || 0,
        price: v.price,
      })) || [],
      isPrivate: product?.isPrivate ?? true,
    },
  });

  const { data: categoriesData } = trpc.categories.useQuery();
  const { data: tagsData } = trpc.tags.getMany.useQuery({ limit: 100 });
  
  // Fetch category variant config when category is selected
  const selectedCategoryId = form.watch("category");
  const { data: categoryData } = trpc.getCategory.useQuery(
    { id: selectedCategoryId },
    { enabled: !!selectedCategoryId }
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const createProduct = trpc.vendor.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.vendor.products.list.invalidate();
      router.push("/vendor/products");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProduct = trpc.vendor.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.vendor.products.list.invalidate();
      queryClient.vendor.products.getOne.invalidate({ id: product!.id });
      router.push("/vendor/products");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleImageUpload = async (file: File, type: "image" | "cover" | "video") => {
    const formData = new FormData();
    formData.append("file", file);

    if (type === "image") {
      setUploadingImage(true);
    } else if (type === "cover") {
      setUploadingCover(true);
    } else {
      setUploadingVideo(true);
    }

    try {
      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      const mediaId = data.doc.id;

      form.setValue(type, mediaId);

      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "image") {
          setImagePreview(reader.result as string);
        } else if (type === "cover") {
          setCoverPreview(reader.result as string);
        } else {
          setVideoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      if (type === "image") {
        setUploadingImage(false);
      } else if (type === "cover") {
        setUploadingCover(false);
      } else {
        setUploadingVideo(false);
      }
    }
  };

  useEffect(() => {
    // Helper function to get media URL from various formats
    const getMediaUrl = (media: any): string | null => {
      if (!media) return null;
      
      // If it's a string (ID), we can't resolve it here
      if (typeof media === "string") return null;
      
      // If it's an object, try different URL fields
      if (typeof media === "object" && media !== null) {
        // Priority 1: Direct URL field (Blob URL or Payload-generated URL)
        if (media.url && typeof media.url === "string") {
          // If it's already a full URL (Blob or absolute), use it
          if (media.url.startsWith("http://") || media.url.startsWith("https://")) {
            return media.url;
          }
          // If it's a relative URL, make it absolute
          if (media.url.startsWith("/")) {
            return `${window.location.origin}${media.url}`;
          }
          return media.url;
        }
        
        // Priority 2: Construct URL from filename (for local storage)
        if (media.filename && typeof media.filename === "string") {
          // Payload serves media at /media/file/[filename]
          // Use window.location.origin for client-side
          return `${window.location.origin}/media/file/${encodeURIComponent(media.filename)}`;
        }
      }
      
      return null;
    };

    // Set image preview
    if (product?.image) {
      const imageUrl = getMediaUrl(product.image);
      if (imageUrl) {
        console.log("[ProductForm] Setting image preview:", imageUrl);
        setImagePreview(imageUrl);
      } else {
        console.warn("[ProductForm] Could not extract image URL from:", product.image);
      }
    }

    // Set cover preview
    if (product?.cover) {
      const coverUrl = getMediaUrl(product.cover);
      if (coverUrl) {
        console.log("[ProductForm] Setting cover preview:", coverUrl);
        setCoverPreview(coverUrl);
      }
    }

    // Set video preview
    if (product?.video) {
      const videoUrl = getMediaUrl(product.video);
      if (videoUrl) {
        console.log("[ProductForm] Setting video preview:", videoUrl);
        setVideoPreview(videoUrl);
      }
    }
  }, [product]);

  const onSubmit = (values: ProductFormValues) => {
    // Convert description string to Lexical format if provided
    let description: any = undefined;
    if (values.description) {
      // Simple conversion to Lexical format
      description = {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: values.description,
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1,
        },
      };
    }

    const submitData = {
      ...values,
      description,
    };

    if (isEditing) {
      updateProduct.mutate({
        id: product!.id,
        ...submitData,
      });
    } else {
      createProduct.mutate(submitData);
    }
  };

  const categories = categoriesData || [];
  const tags = tagsData?.docs || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Preview Button - Only show when editing */}
        {isEditing && product && (
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        )}
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details of your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your product in detail
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refundPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refund Policy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select refund policy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30-day">30-day</SelectItem>
                        <SelectItem value="14-day">14-day</SelectItem>
                        <SelectItem value="7-day">7-day</SelectItem>
                        <SelectItem value="3-day">3-day</SelectItem>
                        <SelectItem value="1-day">1-day</SelectItem>
                        <SelectItem value="no-refunds">No refunds</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category & Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Category & Tags</CardTitle>
            <CardDescription>Organize your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat: { id: string; name: string }) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .flatMap((cat: { id: string; subcategories?: any }) => {
                            const subs = Array.isArray(cat.subcategories)
                              ? cat.subcategories
                              : cat.subcategories?.docs || [];
                            return subs.map((sub: { id: string; name: string }) => ({
                              id: sub.id,
                              name: sub.name,
                              parentId: cat.id,
                            }));
                          })
                          .filter((sub: { parentId: string }) => {
                            const selectedCategory = form.watch("category");
                            return !selectedCategory || sub.parentId === selectedCategory;
                          })
                          .map((sub: { id: string; name: string }) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Upload product images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Image</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {imagePreview ? (
                        <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                          <Image
                            src={imagePreview}
                            alt="Product image"
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => {
                              setImagePreview(null);
                              field.onChange("");
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
                                  handleImageUpload(file, "image");
                                }
                              }}
                              disabled={uploadingImage}
                            />
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Upload className="h-8 w-8 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {uploadingImage ? "Uploading..." : "Click to upload"}
                              </span>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {coverPreview ? (
                        <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                          <Image
                            src={coverPreview}
                            alt="Cover image"
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => {
                              setCoverPreview(null);
                              field.onChange("");
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
                                  handleImageUpload(file, "cover");
                                }
                              }}
                              disabled={uploadingCover}
                            />
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Upload className="h-8 w-8 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {uploadingCover ? "Uploading..." : "Click to upload"}
                              </span>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Video */}
        <Card>
          <CardHeader>
            <CardTitle>Product Video</CardTitle>
            <CardDescription>Upload a product demonstration video (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="video"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Video (Optional)</FormLabel>
                  <FormDescription>
                    Upload a video showcasing your product (MP4, WebM, etc.)
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-2">
                      {videoPreview ? (
                        <div className="relative w-full rounded-md overflow-hidden border">
                          <video
                            src={videoPreview}
                            controls
                            className="w-full h-auto max-h-96"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setVideoPreview(null);
                              field.onChange("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(file, "video");
                                }
                              }}
                              disabled={uploadingVideo}
                            />
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Upload className="h-8 w-8 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {uploadingVideo ? "Uploading..." : "Click to upload video"}
                              </span>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Variants - Dynamic based on category */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>
              {!selectedCategoryId 
                ? "⚠️ Please select a category first to see available variant options."
                : categoryData?.variantConfig?.requiredVariants?.length 
                  ? `Required variants: ${categoryData.variantConfig.requiredVariants.map((vt: any) => typeof vt === 'object' ? vt.name : vt).join(', ')}`
                  : categoryData?.variantConfig
                    ? "Add variants based on category requirements (optional variants available)"
                    : "⚠️ Selected category doesn't have variant configuration. You can still add variants manually."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedCategoryId ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Step 1:</strong> Select a category above to see dynamic variant fields (Size, Color, Material, etc.)
                </p>
              </div>
            ) : !categoryData?.variantConfig ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  This category doesn't have variant configuration. You can add variants manually using the JSON format, or configure variants for this category in the Categories collection.
                </p>
              </div>
            ) : null}
            
            {fields.map((field, index) => {
              const variantData = form.watch(`variants.${index}.variantData`) || {};
              const variantTypes = categoryData?.variantConfig?.variantTypes || [];
              const requiredVariantSlugs = (categoryData?.variantConfig?.requiredVariants || [])
                .map((vt: any) => typeof vt === 'object' ? vt.slug : vt)
                .filter(Boolean);
              
              return (
                <div key={field.id} className="border p-4 rounded-md space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Variant {index + 1}</h4>
                  </div>
                  
                  {variantTypes.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {variantTypes.map((variantType: any) => {
                        const options = categoryData.variantConfig?.variantOptionsMap?.[variantType.slug] || [];
                        const isRequired = requiredVariantSlugs.includes(variantType.slug);
                        const currentValue = variantData[variantType.slug] || "";
                        
                        return (
                          <FormField
                            key={variantType.slug}
                            control={form.control}
                            name={`variants.${index}.variantData.${variantType.slug}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {variantType.name}
                                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {options.length > 0 ? (
                                  <Select 
                                    onValueChange={(value) => {
                                      const currentData = form.getValues(`variants.${index}.variantData`) || {};
                                      form.setValue(`variants.${index}.variantData`, {
                                        ...currentData,
                                        [variantType.slug]: value,
                                      });
                                    }} 
                                    value={currentValue}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={`Select ${variantType.name}`} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {options.map((option: any) => {
                                        const value = typeof option === 'string' ? option : option.value;
                                        const label = typeof option === 'string' ? option : (option.label || option.value);
                                        return (
                                          <SelectItem key={value} value={value}>
                                            {typeof option === 'object' && option.hexCode ? (
                                              <div className="flex items-center gap-2">
                                                <div 
                                                  className="w-4 h-4 rounded border border-gray-300"
                                                  style={{ backgroundColor: option.hexCode }}
                                                />
                                                <span>{label}</span>
                                              </div>
                                            ) : (
                                              label
                                            )}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <FormControl>
                                    <Input 
                                      placeholder={`Enter ${variantType.name}`}
                                      value={currentValue}
                                      onChange={(e) => {
                                        const currentData = form.getValues(`variants.${index}.variantData`) || {};
                                        form.setValue(`variants.${index}.variantData`, {
                                          ...currentData,
                                          [variantType.slug]: e.target.value,
                                        });
                                      }}
                                    />
                                  </FormControl>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600 mb-2">
                        No variant types configured for this category. Example JSON format:
                      </p>
                      <code className="text-xs bg-white p-2 rounded border block">
                        {`{ "size": "Small", "color": "Red" }`}
                      </code>
                    </div>
                  )}
                        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.stock`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stock *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Base price"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => remove(index)}
                              className="w-full"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ variantData: {}, stock: 0 })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
            </CardContent>
          </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
            <CardDescription>Control product visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Save as Draft</FormLabel>
                    <FormDescription>
                      Draft products are not visible on the public storefront
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/vendor/products")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createProduct.isPending || updateProduct.isPending}
          >
            {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>

      {/* Preview Modal - Always render to avoid hook order issues */}
      <ProductPreviewModal
        productId={product?.id || ""}
        open={previewOpen && isEditing && !!product?.id}
        onOpenChange={setPreviewOpen}
      />
    </Form>
  );
}
