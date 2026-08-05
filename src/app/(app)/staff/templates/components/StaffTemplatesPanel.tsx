"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type PendingTemplate = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  sectionCount: number;
  owner: { id: string; name: string } | null;
};

export function StaffTemplatesPanel() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.templates.listPending.useQuery();

  const review = trpc.admin.templates.review.useMutation({
    onSuccess: (_result, variables) => {
      toast.success(
        variables.decision === "approved" ? "Template approved" : "Template rejected",
      );
      utils.admin.templates.listPending.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update template");
    },
    onSettled: () => setPendingId(null),
  });

  const handleReview = (templateId: string, decision: "approved" | "rejected") => {
    setPendingId(templateId);
    review.mutate({ templateId, decision });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!data?.docs.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
        No templates are waiting for approval.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.docs.map((template: PendingTemplate) => (
        <div
          key={template.id}
          className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{template.name}</span>
              <Badge variant="secondary">{template.category}</Badge>
            </div>
            <p className="text-sm text-gray-600">
              {template.owner?.name ? `By ${template.owner.name} · ` : ""}
              {template.sectionCount} section{template.sectionCount === 1 ? "" : "s"}
            </p>
            {template.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={review.isPending && pendingId === template.id}
              onClick={() => handleReview(template.id, "rejected")}
            >
              {review.isPending && pendingId === template.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reject
            </Button>
            <Button
              size="sm"
              disabled={review.isPending && pendingId === template.id}
              onClick={() => handleReview(template.id, "approved")}
            >
              {review.isPending && pendingId === template.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
