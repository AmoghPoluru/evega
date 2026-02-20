"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/payload-types";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  status: "all" | "published" | "draft" | "archived";
  onStatusChange: (status: "all" | "published" | "draft" | "archived") => void;
  search: string;
  onSearchChange: (search: string) => void;
  category?: string;
  onCategoryChange: (category: string | undefined) => void;
  categories?: CategoryOption[];
  sortBy: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  onSortChange: (field: "name" | "price" | "createdAt" | "updatedAt", order: "asc" | "desc") => void;
}

export function ProductsTable({
  products,
  isLoading,
  totalDocs,
  totalPages,
  currentPage,
  onPageChange,
  status,
  onStatusChange,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories = [],
  sortBy,
  sortOrder,
  onSortChange,
}: ProductsTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const queryClient = trpc.useUtils();
  const router = useRouter();

  const bulkUpdate = trpc.vendor.products.bulkUpdate.useMutation({
    onSuccess: () => {
      toast.success(`Successfully updated ${selectedProducts.size} products`);
      setSelectedProducts(new Set());
      queryClient.vendor.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkAction = (action: "publish" | "unpublish" | "archive" | "delete") => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    bulkUpdate.mutate({
      productIds: Array.from(selectedProducts),
      action,
    });
  };

  const handleSort = (field: "name" | "price" | "createdAt" | "updatedAt") => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "desc");
    }
  };

  const getStatusBadge = (product: Product) => {
    if (product.isArchived) {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (product.isPrivate) {
      return <Badge variant="outline">Draft</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Published</Badge>;
  };

  const getStockQuantity = (product: Product) => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0);
    }
    return 0; // TODO: Add base stock field if needed
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? undefined : value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border">
          <span className="text-sm text-gray-700">
            {selectedProducts.size} product{selectedProducts.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("publish")}
              disabled={bulkUpdate.isPending}
            >
              Publish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("unpublish")}
              disabled={bulkUpdate.isPending}
            >
              Unpublish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("archive")}
              disabled={bulkUpdate.isPending}
            >
              Archive
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction("delete")}
              disabled={bulkUpdate.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-md overflow-visible">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.size === products.length && products.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort("name")}
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort("price")}
                >
                  Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort("createdAt")}
                >
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-12 w-12 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  No products found.{" "}
                  <Link href="/vendor/products/new" className="text-blue-600 hover:underline">
                    Create your first product
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const imageUrl =
                  typeof product.image === "object" && product.image?.url
                    ? product.image.url
                    : null;
                const stock = getStockQuantity(product);

                return (
                  <TableRow 
                    key={product.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      router.push(`/vendor/products/${product.id}/edit`);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={(checked) =>
                          handleSelectProduct(product.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {imageUrl ? (
                        <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <span className={stock === 0 ? "text-red-600" : ""}>{stock}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(product)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(product.createdAt)}
                    </TableCell>
                    <TableCell 
                      className="relative w-12"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu 
                        open={openDropdownId === product.id}
                        onOpenChange={(open) => {
                          setOpenDropdownId(open ? product.id : null);
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            type="button"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/vendor/products/${product.id}/edit`}
                              className="flex items-center cursor-pointer"
                              onClick={() => {
                                console.log("[CLIENT] Edit clicked, navigating to:", `/vendor/products/${product.id}/edit`);
                                console.log("[CLIENT] Product ID:", product.id);
                                setOpenDropdownId(null);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setOpenDropdownId(null);
                              window.open(`/products/${product.id}`, "_blank");
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setOpenDropdownId(null);
                              bulkUpdate.mutate({
                                productIds: [product.id],
                                action: "archive",
                              });
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalDocs)} of{" "}
            {totalDocs} products
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
