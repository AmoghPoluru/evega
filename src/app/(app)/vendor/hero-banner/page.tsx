"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { HeroBannerForm } from "./components/HeroBannerForm";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function VendorHeroBannerPage() {
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const utils = trpc.useUtils();
  const { data: banners, isLoading } = trpc.vendor.heroBanners.list.useQuery();

  const deleteMutation = trpc.vendor.heroBanners.delete.useMutation({
    onSuccess: () => {
      toast.success("Banner deleted successfully");
      utils.vendor.heroBanners.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete banner");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (id: string) => {
    setEditingBannerId(id);
    setShowCreateForm(false);
  };

  const handleCreate = () => {
    setEditingBannerId(null);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setEditingBannerId(null);
    setShowCreateForm(false);
  };

  const handleSuccess = () => {
    setEditingBannerId(null);
    setShowCreateForm(false);
    utils.vendor.heroBanners.list.invalidate();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const bannerToEdit = editingBannerId
    ? banners?.find((b: any) => b.id === editingBannerId)
    : null;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hero Banners</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage multiple hero banners for your vendor page
          </p>
        </div>
        {!showCreateForm && !editingBannerId && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Banner
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingBannerId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingBannerId ? "Edit Banner" : "Create New Banner"}</CardTitle>
            <CardDescription>
              Configure a hero banner for your vendor page. You can create multiple banners and they will rotate automatically.
              <br />
              <strong>Recommended:</strong> Use a background image of 1920x500px for best results. Select 4-6 featured products to display.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HeroBannerForm
              banner={bannerToEdit}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      {/* Banners List */}
      {!showCreateForm && !editingBannerId && (
        <>
          {!banners || banners.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No hero banners created yet.</p>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Banner
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner: any) => {
                const backgroundImageUrl = banner.backgroundImage && typeof banner.backgroundImage === 'object' && banner.backgroundImage.url
                  ? banner.backgroundImage.url
                  : null;
                const productCount = Array.isArray(banner.products) ? banner.products.length : 0;

                return (
                  <Card key={banner.id} className="overflow-hidden">
                    <div className="relative h-32 bg-gradient-to-r from-gray-800 to-gray-600">
                      {backgroundImageUrl ? (
                        <Image
                          src={backgroundImageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {banner.isActive ? (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white font-semibold text-sm drop-shadow-lg line-clamp-1">
                          {banner.title}
                        </h3>
                        {banner.subtitle && (
                          <p className="text-white text-xs drop-shadow-lg line-clamp-1">
                            {banner.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Products:</span>
                          <span className="font-medium">{productCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Order:</span>
                          <span className="font-medium">{banner.order || 0}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(banner.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(banner.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
