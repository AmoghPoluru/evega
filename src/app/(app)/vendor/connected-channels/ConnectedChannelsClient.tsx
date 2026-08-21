"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Instagram, Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { vendorPageTitles } from "@/lib/vendor-portal-labels";
import type { PublicSocialConnection } from "@/lib/vendor-social-connections";
import type { Product } from "@/payload-types";
import { PostToSocialsDialog } from "../products/components/PostToSocialsDialog";
import { WhatsAppChannelCard } from "./WhatsAppChannelCard";

type PostableProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

function getProductImageUrl(image: unknown): string | null {
  if (typeof image === "object" && image !== null && "url" in image) {
    const url = (image as { url?: string | null }).url;
    return url || null;
  }
  return null;
}

export function ConnectedChannelsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<PublicSocialConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [postProduct, setPostProduct] = useState<PostableProduct | null>(null);
  const [page, setPage] = useState(1);
  const [productsWithImages, setProductsWithImages] = useState<PostableProduct[]>(
    [],
  );

  const {
    data: productsData,
    isLoading: loadingProducts,
    isFetching,
  } = trpc.vendor.products.list.useQuery({
    status: "all",
    page,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    if (!productsData?.docs) return;

    const pageProducts = (productsData.docs as Product[])
      .map((product: Product) => {
        const imageUrl = getProductImageUrl(product.image);
        if (!imageUrl) return null;
        return {
          id: product.id,
          name: product.name,
          price: product.price ?? 0,
          imageUrl,
        };
      })
      .filter((p): p is PostableProduct => p !== null);

    setProductsWithImages((prev) => {
      if (page === 1) return pageProducts;
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...pageProducts.filter((p) => !seen.has(p.id))];
    });
  }, [productsData, page]);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "instagram") {
      toast.success("Instagram connected. It stays linked after logout.");
      router.replace("/vendor/connected-channels");
    } else if (error) {
      toast.error(error);
      router.replace("/vendor/connected-channels");
    }
  }, [router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/socials/status")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load Instagram connection");
        return (await res.json()) as PublicSocialConnection[];
      })
      .then((data) => {
        if (!cancelled) setConnections(Array.isArray(data) ? data : []);
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Could not load Instagram",
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingConnections(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const instagram = connections.find(
    (c) => c.platform === "instagram" && c.connected,
  );

  const disconnectInstagram = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/socials/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "instagram" }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to disconnect");
      }
      setConnections((prev) => prev.filter((c) => c.platform !== "instagram"));
      toast.success("Instagram disconnected");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to disconnect",
      );
    } finally {
      setDisconnecting(false);
    }
  };

  if (loadingConnections) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading Instagram…
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {vendorPageTitles.connectedChannels}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect Instagram, then post any product photo in one click.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Instagram className="h-5 w-5" />
              Instagram
            </CardTitle>
            <CardDescription>
              {instagram
                ? `Connected as @${instagram.username}`
                : "Connect a Professional Instagram account (Business or Creator) to post."}
            </CardDescription>
            {instagram?.tokenExpiresAt && (
              <p className="text-xs text-muted-foreground">
                Token expires{" "}
                {new Date(instagram.tokenExpiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
          {instagram ? (
            <Button
              variant="outline"
              onClick={disconnectInstagram}
              disabled={disconnecting}
            >
              {disconnecting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Disconnect
            </Button>
          ) : (
            <Button asChild>
              <a href="/api/auth/instagram/connect">Connect Instagram</a>
            </Button>
          )}
        </CardHeader>
      </Card>

      <WhatsAppChannelCard />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Your products</h2>
          <p className="text-sm text-muted-foreground">
            Pick a photo and post it to Instagram.
          </p>
        </div>

        {loadingProducts && page === 1 ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-md" />
                <Skeleton className="h-9 w-48" />
              </div>
            ))}
          </div>
        ) : productsWithImages.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed px-4 py-10">
            <p className="text-sm text-muted-foreground">
              No product photos yet. Add a product with an image to post it here.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/vendor/products/new">
                <PackagePlus className="h-4 w-4" />
                Add a product
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {productsWithImages.map((product) => (
              <li
                key={product.id}
                className="flex items-center gap-4 px-3 py-3 sm:gap-6"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={product.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <Button
                  type="button"
                  className="shrink-0"
                  disabled={!instagram}
                  onClick={() => setPostProduct(product)}
                  title={
                    instagram ? undefined : "Connect Instagram first to post"
                  }
                >
                  <Instagram className="h-4 w-4" />
                  Post this product on Instagram
                </Button>
              </li>
            ))}
          </ul>
        )}

        {productsData?.hasNextPage ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              disabled={isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Load more
            </Button>
          </div>
        ) : null}
      </section>

      {postProduct ? (
        <PostToSocialsDialog
          open={Boolean(postProduct)}
          onOpenChange={(open) => {
            if (!open) setPostProduct(null);
          }}
          product={postProduct}
        />
      ) : null}
    </div>
  );
}
