"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { CheckIcon, LinkIcon } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const CartButton = dynamic(
  () => import("../components/cart-button").then(
    (mod) => mod.CartButton,
  ),
  {
    ssr: false,
    loading: () => <Button disabled className="flex-1 bg-pink-400">Add to cart</Button>
  },
);

interface ProductViewProps {
  productId: string;
}

export const ProductView = ({ productId }: ProductViewProps) => {
  const { data, isLoading, error } = trpc.products.getOne.useQuery({ id: productId });

  const [isCopied, setIsCopied] = useState(false);

  if (isLoading) {
    return <ProductViewSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="px-4 lg:px-12 py-10">
        <div className="text-center">
          <p className="text-lg text-red-600">Error loading product</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border rounded-sm bg-white overflow-hidden">
        <div className="relative aspect-[3.9] border-b">
          <Image
            src={data.image?.url || "/placeholder.png"}
            alt={data.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-6">
          <div className="col-span-4">
            <div className="p-6">
              <h1 className="text-4xl font-medium">{data.name}</h1>
            </div>
            <div className="border-y">
              <div className="px-6 py-4 flex items-center justify-center">
                <div className="px-2 py-1 border bg-pink-400 w-fit">
                  <p className="text-base font-medium">{formatCurrency(data.price)}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {data.description ? (
                <RichText data={data.description} />
              ) : (
                <p className="font-medium text-muted-foreground italic">
                  No description provided
                </p>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <div className="border-t lg:border-t-0 lg:border-l h-full">
              <div className="flex flex-col gap-4 p-6 border-b">
                <div className="flex flex-row items-center gap-2">
                  <CartButton
                    productId={productId}
                  />
                  <Button
                    className="size-12"
                    variant="outline"
                    onClick={() => {
                      setIsCopied(true);
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("URL copied to clipboard")

                      setTimeout(() => {
                        setIsCopied(false);
                      }, 1000);
                    }}
                    disabled={isCopied}
                  >
                    {isCopied ? <CheckIcon /> : <LinkIcon />}
                  </Button>
                </div>

                <p className="text-center font-medium">
                  {data.refundPolicy === "no-refunds"
                    ? "No refunds"
                    : `${data.refundPolicy} money back guarantee`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductViewSkeleton = () => {
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border rounded-sm bg-white overflow-hidden">
        <div className="relative aspect-[3.9] border-b">
          <Image
            src={"/placeholder.png"}
            alt="Placeholder"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}