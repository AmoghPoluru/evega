// @ts-nocheck - React Hook Form type inference issues with Zod defaults for nested objects
// This is a known limitation: https://github.com/react-hook-form/react-hook-form/issues/9285
// Runtime behavior is correct - variantData will always be an object due to .default({})
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Upload, Eye } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/payload-types";
import { ProductPreviewModal } from "./ProductPreviewModal";
import { isValidYouTubeUrl, isValidTimeFormat, timeToSeconds, secondsToTime, extractYouTubeVideoId } from "@/lib/youtube-utils";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  image: z.string().optional(),
  cover: z.string().optional(),
  videoSource: z.enum(["upload", "youtube"]).optional().default("upload"),
  video: z.string().optional(), // Video is completely optional - vendors can skip it
  youtubeUrl: z.string().optional().refine(
    (url) => {
      // Allow empty string or undefined
      if (!url || url.trim() === "") return true;
      // If URL is provided, validate it's a valid URL format
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Please provide a valid URL" }
  ),
  youtubeStartTime: z.string().optional(),
  refundPolicy: z.enum(["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"]).optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(
    z.object({
      variantData: z.record(z.string(), z.any()).default({}), // Dynamic variant data - always an object, defaults to empty
      stock: z.number().min(0),
      price: z.number().optional(),
    })
  ).default([]).optional(),
  isPrivate: z.boolean(),
}).refine(
  (data) => {
    // Validate YouTube URL format if videoSource is "youtube" and URL is provided
    if (data.videoSource === "youtube" && data.youtubeUrl) {
      return isValidYouTubeUrl(data.youtubeUrl);
    }
    return true;
  },
  {
    message: "Please provide a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)",
    path: ["youtubeUrl"], // This will show the error on the youtubeUrl field
  }
).refine(
  (data) => {
    // Validate time format if videoSource is "youtube" and time is provided
    if (data.videoSource === "youtube" && data.youtubeStartTime) {
      return isValidTimeFormat(data.youtubeStartTime);
    }
    return true;
  },
  {
    message: "Please use MM:SS format (e.g., 2:05 for 2 minutes 5 seconds)",
    path: ["youtubeStartTime"], // This will show the error on the youtubeStartTime field
  }
);

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
    // @ts-expect-error - React Hook Form type inference issue with Zod defaults for nested objects
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: (() => {
        // Extract text from Lexical format if description exists
        if (product?.description) {
          if (typeof product.description === "string") {
            return product.description;
          }
          // If it's a Lexical object, extract text from it
          if (typeof product.description === "object" && product.description.root) {
            const extractText = (node: any): string => {
              if (node.text) {
                return node.text;
              }
              if (node.children && Array.isArray(node.children)) {
                return node.children.map(extractText).join("");
              }
              return "";
            };
            return extractText(product.description.root) || "";
          }
        }
        return "";
      })(),
      price: product?.price || 0,
      category: typeof product?.category === "string" ? product.category : product?.category?.id || "",
      subcategory: typeof product?.subcategory === "string" ? product.subcategory : product?.subcategory?.id || "",
      image: typeof product?.image === "string" ? product.image : product?.image?.id || "",
      cover: typeof product?.cover === "string" ? product.cover : product?.cover?.id || "",
      videoSource: (product as any)?.videoSource || "upload",
      video: typeof product?.video === "string" ? product.video : product?.video?.id || "",
      youtubeUrl: (product as any)?.youtubeUrl || "",
      youtubeStartTime: (product as any)?.youtubeStartTime || "",
      refundPolicy: product?.refundPolicy || "30-day",
      tags: product?.tags
        ? product.tags.map((tag) => (typeof tag === "string" ? tag : tag.id))
        : [],
      variants: product?.variants?.map((v: any) => ({
        variantData: (v.variantData && typeof v.variantData === 'object' ? v.variantData : (v.size || v.color ? { size: v.size, color: v.color } : {})) || {},
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
      // Parse error message - it may contain multiple errors separated by ';'
      const errorMessages = error.message.split('; ').filter(Boolean);
      
      if (errorMessages.length > 1) {
        // Show first error in toast, but also set form errors
        toast.error(`${errorMessages.length} validation errors found. Please check the form.`);
        
        // Try to set form errors for specific fields
        errorMessages.forEach((errMsg) => {
          // Try to extract field path from error message (e.g., "Size in Variant 1: Required")
          const match = errMsg.match(/(\w+) in Variant (\d+):/);
          if (match) {
            const [, fieldName, variantNum] = match;
            const variantIndex = parseInt(variantNum) - 1;
            const fieldSlug = fieldName.toLowerCase();
            
            // Set error on the specific field
            form.setError(`variants.${variantIndex}.variantData.${fieldSlug}`, {
              type: 'manual',
              message: errMsg.split(': ')[1] || errMsg,
            });
          }
        });
      } else {
        toast.error(error.message);
      }
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
      // Parse error message - it may contain multiple errors separated by ';'
      const errorMessages = error.message.split('; ').filter(Boolean);
      
      if (errorMessages.length > 1) {
        // Show first error in toast, but also set form errors
        toast.error(`${errorMessages.length} validation errors found. Please check the form.`);
        
        // Try to set form errors for specific fields
        errorMessages.forEach((errMsg) => {
          // Try to extract field path from error message (e.g., "Size in Variant 1: Required")
          const match = errMsg.match(/(\w+) in Variant (\d+):/);
          if (match) {
            const [, fieldName, variantNum] = match;
            const variantIndex = parseInt(variantNum) - 1;
            const fieldSlug = fieldName.toLowerCase();
            
            // Set error on the specific field
            form.setError(`variants.${variantIndex}.variantData.${fieldSlug}`, {
              type: 'manual',
              message: errMsg.split(': ')[1] || errMsg,
            });
          }
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  // Watch videoSource to show/hide fields (after form is initialized)
  const videoSource = form.watch("videoSource") || "upload";
  const youtubeUrl = form.watch("youtubeUrl") || "";
  const youtubeStartTime = form.watch("youtubeStartTime") || "";
  
  // Extract video ID and calculate seconds for preview
  const youtubeVideoId = youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null;
  const youtubeStartTimeSeconds = youtubeStartTime ? timeToSeconds(youtubeStartTime) : null;

  const handleImageUpload = async (file: File, type: "image" | "cover" | "video") => {
    console.log(`[ProductForm] Starting upload for ${type}:`, file.name, file.size, file.type);
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
      console.log(`[ProductForm] Sending upload request to /api/media`);
      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
        credentials: "include", // Ensure cookies are sent for authentication
      });
      
      console.log(`[ProductForm] Upload response status:`, response.status, response.statusText);

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Failed to upload ${type}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Provide more specific error messages
        if (response.status === 401) {
          errorMessage = "Please log in to upload files";
        } else if (response.status === 413) {
          errorMessage = "File is too large. Please choose a smaller file.";
        } else if (response.status === 400) {
          errorMessage = "Invalid file. Please check the file format.";
        }
        
        console.error(`[ProductForm] Upload failed (${response.status}):`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`[ProductForm] Upload response data:`, data);
      
      if (!data.doc || !data.doc.id) {
        console.error("[ProductForm] Upload response missing doc.id:", data);
        throw new Error("Upload succeeded but no file ID was returned");
      }
      
      const mediaId = data.doc.id;
      console.log(`[ProductForm] Upload successful! Media ID:`, mediaId);

      form.setValue(type, mediaId);
      console.log(`[ProductForm] Form field ${type} set to:`, mediaId);
      toast.success(`${type === "image" ? "Image" : type === "cover" ? "Cover image" : "Video"} uploaded successfully`);

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
    } catch (error: any) {
      console.error(`[ProductForm] Upload error for ${type}:`, error);

      let message = error?.message || `Failed to upload ${type}. Please try again.`;

      // Browser's generic message – replace with something clearer
      if (message === "There was a problem while uploading the file.") {
        message =
          "There was a problem while uploading the file. Please check your internet connection, refresh the page, and try again. If it keeps happening, check the /api/media response in the Network tab or contact support.";
      }

      toast.error(message);
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
    // If description is empty or just whitespace, set to undefined to allow clearing
    let description: any = undefined;
    if (values.description && values.description.trim() !== "") {
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
                  text: values.description.trim(),
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
    } else if (isEditing) {
      // If editing and description is empty, explicitly set to undefined to clear it
      description = undefined;
    }

    // Get required variant slugs for validation
    const requiredVariantSlugs = categoryData?.variantConfig?.requiredVariants
      ?.map((vt: any) => typeof vt === 'object' ? vt.slug : vt)
      .filter(Boolean) || [];

    // Ensure variantData is always an object and includes all required fields
    const normalizedVariants = values.variants?.map((variant, index) => {
      // Get the current variantData from form state to ensure we have the latest values
      // This is important because React Hook Form might have nested field values that aren't in variant.variantData
      const formVariantData = form.getValues(`variants.${index}.variantData`) || {};
      
      // Merge form values with variant data to capture all nested fields
      // This ensures that fields like variants.0.variantData.size and variants.0.variantData.color are captured
      const variantData: Record<string, any> = {
        ...(variant.variantData && typeof variant.variantData === 'object' ? variant.variantData : {}),
        ...(formVariantData && typeof formVariantData === 'object' ? formVariantData : {}),
      };
      
      // Also check for nested field values directly from form state
      // React Hook Form might store them as separate fields
      if (categoryData?.variantConfig?.variantTypes) {
        categoryData.variantConfig.variantTypes.forEach((vt: any) => {
          const nestedFieldValue = form.getValues(`variants.${index}.variantData.${vt.slug}`);
          if (nestedFieldValue !== undefined && nestedFieldValue !== null && nestedFieldValue !== '') {
            variantData[vt.slug] = nestedFieldValue;
          }
        });
      }
      
      // Check if all required variant fields are present
      const missingRequired = requiredVariantSlugs.filter(
        (slug: string) => !variantData[slug] || variantData[slug] === ''
      );
      
      if (missingRequired.length > 0 && process.env.NODE_ENV === 'development') {
        console.warn(`[ProductForm] Variant ${index + 1} missing required fields:`, missingRequired);
        console.warn(`[ProductForm] Current variantData:`, variantData);
        console.warn(`[ProductForm] Form variantData:`, formVariantData);
        console.warn(`[ProductForm] Variant from values:`, variant.variantData);
      }

      return {
        ...variant,
        variantData: variantData, // Always an object, never undefined, with all nested fields
      };
    });

    // Clean up video fields - remove empty strings and set to undefined
    const cleanedValues = {
      ...values,
      video: values.video && values.video.trim() !== "" ? values.video : undefined,
      youtubeUrl: values.youtubeUrl && values.youtubeUrl.trim() !== "" ? values.youtubeUrl : undefined,
      youtubeStartTime: values.youtubeStartTime && values.youtubeStartTime.trim() !== "" ? values.youtubeStartTime : undefined,
    };

    const submitData = {
      ...cleanedValues,
      description,
      variants: normalizedVariants,
    };

    // Debug log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProductForm] Submitting data:', {
        variants: submitData.variants,
        requiredVariantSlugs,
        videoFields: {
          videoSource: submitData.videoSource,
          video: submitData.video,
          youtubeUrl: submitData.youtubeUrl,
          youtubeStartTime: submitData.youtubeStartTime,
        },
      });
    }

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
      {/* @ts-expect-error - React Hook Form type inference issue with Zod defaults */}
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
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        onBlur={field.onBlur}
                        name={field.name}
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
            <CardDescription>Add a product demonstration video via upload or YouTube link (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Source Selection */}
            <FormField
              control={form.control}
              name="videoSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Source</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || "upload"}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upload" id="upload" />
                        <label htmlFor="upload" className="cursor-pointer">
                          Upload Video File
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="youtube" id="youtube" />
                        <label htmlFor="youtube" className="cursor-pointer">
                          YouTube Link
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Video Field - Only show when videoSource === "upload" */}
            {videoSource === "upload" && (
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
            )}

            {/* YouTube Fields - Only show when videoSource === "youtube" */}
            {videoSource === "youtube" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="youtubeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL *</FormLabel>
                      <FormDescription>
                        Paste the full YouTube URL. Supported formats:
                        <br />
                        • https://www.youtube.com/watch?v=VIDEO_ID
                        <br />
                        • https://youtu.be/VIDEO_ID
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Clear video field when switching to YouTube
                            form.setValue("video", "");
                          }}
                        />
                      </FormControl>
                      {youtubeVideoId && (
                        <p className="text-sm text-green-600">
                          ✓ Video ID extracted: {youtubeVideoId}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtubeStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (MM:SS)</FormLabel>
                      <FormDescription>
                        Enter the time where product details are discussed in MM:SS format.
                        <br />
                        Examples: 2:05 (2 minutes 5 seconds), 0:30 (30 seconds), 10:45 (10 minutes 45 seconds)
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="2:05"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            
                            // Show conversion helper
                            if (value) {
                              const seconds = timeToSeconds(value);
                              if (seconds !== null) {
                                // This will be shown via helper text
                              }
                            }
                          }}
                        />
                      </FormControl>
                      {youtubeStartTime && youtubeStartTimeSeconds !== null && (
                        <p className="text-sm text-blue-600">
                          Video will start at {youtubeStartTime} ({youtubeStartTimeSeconds} seconds)
                        </p>
                      )}
                      {youtubeStartTime && youtubeStartTimeSeconds === null && (
                        <p className="text-sm text-red-600">
                          Invalid format. Please use MM:SS (e.g., 2:05)
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* YouTube Preview */}
                {youtubeVideoId && (
                  <div className="space-y-2">
                    <FormLabel>Preview</FormLabel>
                    <div className="relative w-full aspect-video border rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}${youtubeStartTimeSeconds ? `?start=${youtubeStartTimeSeconds}` : ''}`}
                        title="YouTube Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    {youtubeStartTimeSeconds && (
                      <p className="text-xs text-gray-500">
                        Video will start playing at {youtubeStartTime} when customers view it
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
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
              
              // Get errors for this variant
              const variantErrors = form.formState.errors.variants?.[index];
              const variantDataErrors = variantErrors?.variantData;
              
              // Get specific field errors
              const getFieldError = (fieldSlug: string) => {
                if (variantDataErrors && typeof variantDataErrors === 'object' && variantDataErrors !== null) {
                  const fieldError = (variantDataErrors as any)[fieldSlug];
                  if (fieldError) {
                    return typeof fieldError === 'string' ? fieldError : fieldError.message || 'Invalid value';
                  }
                }
                // Also check formState.errors directly for nested field path
                const nestedError = form.formState.errors.variants?.[index]?.variantData?.[fieldSlug];
                if (nestedError) {
                  return typeof nestedError === 'string' ? nestedError : nestedError.message || 'Invalid value';
                }
                return null;
              };
              
              // Get all field errors for summary
              const getAllFieldErrors = () => {
                const errors: Array<{ fieldName: string; error: string }> = [];
                if (variantDataErrors && typeof variantDataErrors === 'object' && variantDataErrors !== null) {
                  Object.keys(variantDataErrors).forEach((key) => {
                    const error = (variantDataErrors as any)[key];
                    if (error) {
                      const variantType = variantTypes.find((vt: any) => vt.slug === key);
                      const fieldName = variantType?.name || key;
                      const errorMessage = typeof error === 'string' ? error : error.message || 'Invalid value';
                      errors.push({ fieldName, error: errorMessage });
                    }
                  });
                }
                return errors;
              };
              
              const allFieldErrors = getAllFieldErrors();
              
              return (
                <div key={field.id} className="border p-4 rounded-md space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Variant {index + 1}</h4>
                    {allFieldErrors.length > 0 && (
                      <div className="text-xs text-red-600 font-medium">
                        {allFieldErrors.length} field{allFieldErrors.length > 1 ? 's' : ''} with error{allFieldErrors.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  {/* Display all field errors as a summary */}
                  {allFieldErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                      <p className="text-sm font-medium text-red-800 mb-2">The following fields have errors:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {allFieldErrors.map((err, idx) => (
                          <li key={idx} className="text-xs text-red-700">
                            <strong>{err.fieldName}:</strong> {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
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
                            render={({ field, fieldState }) => {
                              // Get current variantData object - use getValues for latest state
                              const currentVariantData = form.getValues(`variants.${index}.variantData`) || {};
                              const fieldValueFromData = currentVariantData[variantType.slug];
                              
                              // Get specific error for this field
                              const fieldError = getFieldError(variantType.slug);
                              const hasError = !!fieldError || !!fieldState.error;
                              
                              // Use field.value if available, otherwise use value from variantData object, then fallback to currentValue
                              const displayValue = field.value || fieldValueFromData || currentValue || "";
                              
                              return (
                                <FormItem>
                                  <FormLabel>
                                    {variantType.name}
                                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                                  </FormLabel>
                                  {options.length > 0 ? (
                                    <Select 
                                      onValueChange={(value) => {
                                        // Get the current variantData from form state
                                        const latestVariantData = form.getValues(`variants.${index}.variantData`) || {};
                                        
                                        // Update the entire variantData object
                                        const updatedVariantData = {
                                          ...latestVariantData,
                                          [variantType.slug]: value,
                                        };
                                        
                                        // Update the parent variantData object first to ensure consistency
                                        form.setValue(`variants.${index}.variantData`, updatedVariantData, { 
                                          shouldValidate: true,
                                          shouldDirty: true,
                                          shouldTouch: true,
                                        });
                                        
                                        // Also update the individual nested field for React Hook Form tracking
                                        // This ensures the field is properly registered and tracked
                                        field.onChange(value);
                                        
                                        // Debug log in development
                                        if (process.env.NODE_ENV === 'development') {
                                          console.log(`[ProductForm] Updated variant ${index + 1} ${variantType.slug}:`, value);
                                          console.log(`[ProductForm] Full variantData after update:`, updatedVariantData);
                                          console.log(`[ProductForm] Form values after update:`, form.getValues(`variants.${index}`));
                                        }
                                      }} 
                                      value={displayValue}
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
                                        value={displayValue}
                                        onChange={(e) => {
                                          const newValue = e.target.value;
                                          
                                          // Get the current variantData from form state
                                          const latestVariantData = form.getValues(`variants.${index}.variantData`) || {};
                                          
                                          // Update the entire variantData object
                                          const updatedVariantData = {
                                            ...latestVariantData,
                                            [variantType.slug]: newValue,
                                          };
                                          
                                          // Update the parent variantData object first to ensure consistency
                                          form.setValue(`variants.${index}.variantData`, updatedVariantData, { 
                                            shouldValidate: true,
                                            shouldDirty: true,
                                            shouldTouch: true,
                                          });
                                          
                                          // Also update the individual nested field for React Hook Form tracking
                                          field.onChange(newValue);
                                          
                                          // Debug log in development
                                          if (process.env.NODE_ENV === 'development') {
                                            console.log(`[ProductForm] Updated variant ${index + 1} ${variantType.slug}:`, newValue);
                                            console.log(`[ProductForm] Full variantData after update:`, updatedVariantData);
                                          }
                                        }}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                      />
                                    </FormControl>
                                  )}
                                  <FormMessage>
                                    {fieldError 
                                      ? `${variantType.name}: ${fieldError}` 
                                      : fieldState.error?.message || null
                                    }
                                  </FormMessage>
                                </FormItem>
                              );
                            }}
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
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    onBlur={field.onBlur}
                                    name={field.name}
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
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    onBlur={field.onBlur}
                                    name={field.name}
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
