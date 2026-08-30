"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FavoritesError({ error, reset }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <Heart className="mx-auto h-10 w-10 text-gray-300" />
      <h1 className="mt-4 text-2xl font-medium text-gray-900">My Favorites</h1>
      <p className="mt-2 text-red-600">Unable to load your favorites: {error.message}</p>
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
