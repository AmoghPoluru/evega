"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { HappyBannerThumbnail } from "@/components/happy-banner/HappyBannerThumbnail";
import { StaffHappyBannerPreviewDialog } from "./StaffHappyBannerPreviewDialog";

type BannerListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  preset: string;
  defaultWord1: string;
  defaultWord2: string;
  thumbnailUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  updatedAt: string;
};

export function StaffHappyBannersTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [previewBannerId, setPreviewBannerId] = useState<string | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);
  const [platformEnabled, setPlatformEnabled] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const utils = trpc.useUtils();
  const { data: platformSettings } = trpc.admin.happyBanners.getPlatformSettings.useQuery();
  const { data, isLoading, error } = trpc.admin.happyBanners.list.useQuery({
    search: debouncedSearch.trim() || undefined,
    includeInactive: true,
  });

  useEffect(() => {
    if (platformSettings) {
      setPlatformEnabled(platformSettings.enabled !== false);
    }
  }, [platformSettings]);

  const updatePlatformMutation = trpc.admin.happyBanners.updatePlatformSettings.useMutation({
    onSuccess: () => {
      toast.success("Platform settings saved");
      utils.admin.happyBanners.getPlatformSettings.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to save platform settings"),
  });

  const deleteMutation = trpc.admin.happyBanners.delete.useMutation({
    onSuccess: () => {
      toast.success("Banner deleted");
      utils.admin.happyBanners.list.invalidate();
      setDeletingBannerId(null);
    },
    onError: (err) => toast.error(err.message || "Failed to delete banner"),
  });

  const handlePlatformToggle = (checked: boolean) => {
    setPlatformEnabled(checked);
    updatePlatformMutation.mutate({ enabled: checked });
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border bg-white p-4">
        <div>
          <Label htmlFor="platform-enabled">Show Happy Banners on vendor storefronts</Label>
          <p className="text-sm text-muted-foreground">
            Master switch. Vendors must select a banner design for it to appear on their storefront.
          </p>
        </div>
        <Switch
          id="platform-enabled"
          checked={platformEnabled}
          onCheckedChange={handlePlatformToggle}
          disabled={updatePlatformMutation.isPending}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search banners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button asChild>
          <Link href="/staff/hero-banners/new">
            <Plus className="mr-2 h-4 w-4" />
            Create banner
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Preview</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Defaults</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data ?? []).map((banner: BannerListItem) => (
                <tr key={banner.id}>
                  <td className="px-4 py-3">
                    <div className="w-36 overflow-hidden rounded-md border">
                      <HappyBannerThumbnail
                        thumbnailUrl={banner.thumbnailUrl}
                        banner={{
                          id: banner.id,
                          name: banner.name,
                          slug: banner.slug,
                          description: banner.description,
                          preset: banner.preset as "mega-sale" | "summer-sale",
                          defaultWord1: banner.defaultWord1,
                          defaultWord2: banner.defaultWord2,
                          eyebrowText: banner.eyebrowText,
                          secondaryWord: banner.secondaryWord,
                          ctaLabel: banner.ctaLabel,
                          discountPrefix: banner.discountPrefix,
                          discountSuffix: banner.discountSuffix,
                          theme: banner.theme,
                        }}
                        alt={banner.name}
                        className="h-16 w-36"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{banner.name}</div>
                    {banner.description ? (
                      <div className="text-xs text-gray-500 line-clamp-1">{banner.description}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{banner.slug}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {banner.defaultWord1} / {banner.defaultWord2}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {banner.isDefault ? <Badge>Default</Badge> : null}
                      {banner.isActive ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewBannerId(banner.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/staff/hero-banners/${banner.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingBannerId(banner.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No banners yet. Create your first Happy Banner design.
            </div>
          ) : null}
        </div>
      )}

      <StaffHappyBannerPreviewDialog
        bannerId={previewBannerId}
        onOpenChange={(open) => {
          if (!open) setPreviewBannerId(null);
        }}
      />

      <AlertDialog
        open={deletingBannerId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingBannerId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Happy Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Vendors using this banner will fall back to the default. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingBannerId) {
                  deleteMutation.mutate({ id: deletingBannerId });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
