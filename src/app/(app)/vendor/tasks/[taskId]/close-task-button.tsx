"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface CloseTaskButtonProps {
  taskId: string;
  taskStatus?: string;
}

export function CloseTaskButton({ taskId, taskStatus }: CloseTaskButtonProps) {
  const router = useRouter();
  const isClosed = taskStatus === "closed";

  const closeTask = trpc.vendorTasks.closeTask.useMutation({
    onSuccess: () => {
      toast.success("Task closed successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to close task");
    },
  });

  if (isClosed) {
    return (
      <div className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 font-medium">
        Task Closed
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (confirm("Are you sure you want to close this task? Once closed, no new messages can be sent.")) {
          closeTask.mutate({ taskId });
        }
      }}
      disabled={closeTask.isPending}
    >
      {closeTask.isPending ? "Closing..." : "Close Task"}
    </Button>
  );
}
