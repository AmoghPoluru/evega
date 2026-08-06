"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { HappyBannerPreview } from "./components/HappyBannerPreview";

export default function VendorBannerTextPage() {
  const { data, isLoading } = trpc.vendor.banner.get.useQuery();
  const utils = trpc.useUtils();

  const [header, setHeader] = useState("");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    if (data) {
      setHeader(data.header);
      setTagline(data.tagline ?? "");
    }
  }, [data]);

  const updateMutation = trpc.vendor.banner.updateText.useMutation({
    onSuccess: () => {
      toast.success("Banner text saved");
      void utils.vendor.banner.get.invalidate();
      if (data?.vendorSlug) void utils.happyBanner.invalidate({ vendorSlug: data.vendorSlug });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save banner text");
    },
  });

  const previewQuery = trpc.happyBanner.useQuery(
    { vendorSlug: data?.vendorSlug ?? "" },
    { enabled: Boolean(data?.vendorSlug) },
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Banner Text</h1>
        <p className="mt-1 text-sm text-gray-600">
          Edit the header and tagline shown on your storefront Happy Banner. Product tiles and motion
          are configured by platform admins.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Header &amp; Tagline</CardTitle>
            <CardDescription>
              Header: 2–60 characters. Tagline: up to 90 characters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="header">Header</Label>
              <Input
                id="header"
                value={header}
                maxLength={60}
                onChange={(e) => setHeader(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                value={tagline}
                maxLength={90}
                rows={3}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
            <Button
              disabled={updateMutation.isPending || header.trim().length < 2}
              onClick={() =>
                updateMutation.mutate({
                  header: header.trim(),
                  tagline: tagline.trim() || null,
                })
              }
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Matches your live storefront when Happy Banner is enabled.</CardDescription>
          </CardHeader>
          <CardContent>
            {previewQuery.data?.enabled ? (
              <HappyBannerPreview banner={previewQuery.data} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Happy Banner is not enabled globally yet. Your text will appear once an admin enables
                it.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
