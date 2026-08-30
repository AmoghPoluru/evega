"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: Props) {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-16">
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-xl font-medium text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-600">{error.message}</p>
          <Button className="mt-6" onClick={reset}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
