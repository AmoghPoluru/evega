"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heart, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";

interface ProductInteractionButtonsProps {
  productId: string;
  className?: string;
}

export const ProductInteractionButtons = ({
  productId,
  className,
}: ProductInteractionButtonsProps) => {
  const router = useRouter();
  const { data: session } = trpc.auth.session.useQuery();
  const isAuthed = Boolean(session?.user);

  const favoritedQuery = trpc.productInteractions.favorites.isFavorited.useQuery(
    { productId },
    { enabled: isAuthed },
  );
  const likedQuery = trpc.productInteractions.likes.hasLiked.useQuery(
    { productId },
    { enabled: isAuthed },
  );
  const likeCountQuery = trpc.productInteractions.likes.count.useQuery({ productId });

  const isFavorited = Boolean(favoritedQuery.data?.isFavorited);
  const hasLiked = Boolean(likedQuery.data?.hasLiked);
  const likeCount = likeCountQuery.data?.count ?? 0;

  const refetchInteractions = () => {
    favoritedQuery.refetch();
    likedQuery.refetch();
    likeCountQuery.refetch();
  };

  const favoriteAdd = trpc.productInteractions.favorites.add.useMutation({
    onSuccess: refetchInteractions,
    onError: (e) => toast.error(e.message),
  });
  const favoriteRemove = trpc.productInteractions.favorites.remove.useMutation({
    onSuccess: refetchInteractions,
    onError: (e) => toast.error(e.message),
  });
  const likeMutation = trpc.productInteractions.likes.like.useMutation({
    onSuccess: refetchInteractions,
    onError: (e) => toast.error(e.message),
  });
  const unlikeMutation = trpc.productInteractions.likes.unlike.useMutation({
    onSuccess: refetchInteractions,
    onError: (e) => toast.error(e.message),
  });

  const requireAuth = () => {
    if (!isAuthed) {
      toast.error("Please sign in to continue");
      router.push(`/sign-in?redirect=/products/${productId}`);
      return false;
    }
    return true;
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    if (isFavorited) {
      favoriteRemove.mutate({ productId });
    } else {
      favoriteAdd.mutate({ productId });
    }
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    if (hasLiked) {
      unlikeMutation.mutate({ productId });
    } else {
      likeMutation.mutate({ productId });
    }
  };

  const favoritePending = favoriteAdd.isPending || favoriteRemove.isPending;
  const likePending = likeMutation.isPending || unlikeMutation.isPending;

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={handleToggleFavorite}
        disabled={favoritePending}
        aria-pressed={isFavorited}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm border transition-colors disabled:opacity-50 ${
          isFavorited
            ? "bg-pink-500 border-pink-500 text-white"
            : "bg-white/90 border-gray-200 text-gray-700 hover:text-pink-600"
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
      </button>
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={likePending}
        aria-pressed={hasLiked}
        aria-label={hasLiked ? "Unlike product" : "Like product"}
        className={`flex items-center gap-1 h-8 px-2 rounded-full shadow-sm border text-xs font-medium transition-colors disabled:opacity-50 ${
          hasLiked
            ? "bg-blue-500 border-blue-500 text-white"
            : "bg-white/90 border-gray-200 text-gray-700 hover:text-blue-600"
        }`}
      >
        <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
        <span>{likeCount}</span>
      </button>
    </div>
  );
};
