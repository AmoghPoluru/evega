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
  refundPolicy: z.enum(["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"]).optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(
    z.object({
      size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]).optional(),
      color: z.string().optional(),
      stock: z.number().min(0).default(0),
      price: z.number().optional(),
    })
  ).optional(),
  isPrivate: z.boolean().default(true),
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: categoriesData } = trpc.categories.useQuery();
  const { data: tagsData } = trpc.tags.getMany.useQuery({ limit: 100 });

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
      refundPolicy: product?.refundPolicy || "30-day",
      tags: product?.tags
        ? product.tags.map((tag) => (typeof tag === "string" ? tag : tag.id))
        : [],
      variants: product?.variants || [],
      isPrivate: product?.isPrivate ?? true,
    },
  });

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

  const handleImageUpload = async (file: File, type: "image" | "cover") => {
    const formData = new FormData();
    formData.append("file", file);

    if (type === "image") {
      setUploadingImage(true);
    } else {
      setUploadingCover(true);
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
        } else {
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      if (type === "image") {
        setUploadingImage(false);
      } else {
        setUploadingCover(false);
      }
    }
  };

  useEffect(() => {
    if (product?.image) {
      const image = typeof product.image === "object" ? product.image : null;
      if (image?.url) {
        setImagePreview(image.url);
      }
    }
    if (product?.cover) {
      const cover = typeof product.cover === "object" ? product.cover : null;
      if (cover?.url) {
        setCoverPreview(cover.url);
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
                        {categories.map((cat) => (
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
                          .flatMap((cat) => {
                            const subs = Array.isArray(cat.subcategories)
                              ? cat.subcategories
                              : cat.subcategories?.docs || [];
                            return subs.map((sub: any) => ({
                              id: sub.id,
                              name: sub.name,
                              parentId: cat.id,
                            }));
                          })
                          .filter((sub) => {
                            const selectedCategory = form.watch("category");
                            return !selectedCategory || sub.parentId === selectedCategory;
                          })
                          .map((sub) => (
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

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>Add size and color variants with inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-5 gap-4 items-end border p-4 rounded-md">
                <FormField
                  control={form.control}
                  name={`variants.${index}.size`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.color`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Color" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.stock`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
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
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ stock: 0 })}
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
