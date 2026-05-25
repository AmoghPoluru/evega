"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VendorLogoCard() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.vendor.dashboard.getMarketingProfile.useQuery();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = trpc.vendor.dashboard.updateMarketingProfile.useMutation({
    onSuccess: () => {
      toast.success("Store logo saved");
      utils.vendor.dashboard.getMarketingProfile.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save logo");
    },
  });

  useEffect(() => {
    if (data?.logoUrl) {
      setLogoPreview(data.logoUrl);
    } else {
      setLogoPreview(null);
    }
  }, [data?.logoUrl]);

  const handleUpload = async (file: File) => {
    setUploading(true);
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

      const result = await response.json();
      if (result.doc?.id) {
        setLogoPreview(result.doc.url ?? null);
        updateMutation.mutate({ logo: result.doc.id });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setLogoPreview(null);
    updateMutation.mutate({ logo: null });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-32 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const isSaving = updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Store logo</CardTitle>
        <CardDescription>
          Shown on your storefront, product pages, and vendor portal header. Square images work
          best.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logoPreview ? (
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative h-32 w-32 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-white">
              <Image
                src={logoPreview}
                alt="Store logo"
                fill
                className="object-contain p-2"
                sizes="128px"
              />
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading || isSaving}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || isSaving}
                onClick={() => replaceInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Replace logo
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 justify-start px-0"
                disabled={uploading || isSaving}
                onClick={handleRemove}
              >
                <X className="mr-2 h-4 w-4" />
                Remove logo
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 max-w-sm">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading || isSaving}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                  e.target.value = "";
                }}
              />
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {uploading || isSaving ? "Saving…" : "Upload store logo"}
              </span>
              <span className="text-xs text-gray-500 text-center">
                PNG or JPG, recommended at least 200×200px
              </span>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
