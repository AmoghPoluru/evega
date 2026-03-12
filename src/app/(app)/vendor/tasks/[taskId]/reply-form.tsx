"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

const replySchema = z.object({
  body: z.string().min(1, "Message cannot be empty"),
});

interface TaskReplyFormProps {
  taskId: string;
  taskStatus?: string;
}

export function TaskReplyForm({ taskId, taskStatus }: TaskReplyFormProps) {
  const isClosed = taskStatus === "closed";
  const router = useRouter();
  const [body, setBody] = useState("");

  const addMessage = trpc.vendorTasks.addMessage.useMutation({
    onSuccess: () => {
      setBody("");
      toast.success("Message sent");
      // Refresh the page to show the new message
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = replySchema.safeParse({ body });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      toast.error(firstError?.message || "Message cannot be empty");
      return;
    }

    addMessage.mutate({
      taskId,
      body: parsed.data.body,
    });
  };

  if (isClosed) {
    return (
      <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600">
        This task is closed. No new messages can be sent.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="reply">Add a message</Label>
      <Textarea
        id="reply"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Write your message to the Evega team..."
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={addMessage.isPending}>
          {addMessage.isPending ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  );
}

