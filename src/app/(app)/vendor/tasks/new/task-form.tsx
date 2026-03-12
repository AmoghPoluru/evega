"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

const newTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  type: z.enum(["question", "feature-request", "bug", "onboarding", "other"]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

export function NewTaskForm() {
  const router = useRouter();
  const [values, setValues] = useState({
    title: "",
    description: "",
    type: "question" as z.infer<typeof newTaskSchema>["type"],
    priority: "normal" as z.infer<typeof newTaskSchema>["priority"],
  });

  const createTask = trpc.vendorTasks.create.useMutation({
    onSuccess: (task) => {
      toast.success("Task created successfully");
      router.push(`/vendor/tasks/${task.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newTaskSchema.safeParse(values);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      toast.error(firstError?.message || "Please fill in all required fields");
      return;
    }
    createTask.mutate(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="e.g. Can we create a new category for Sarees?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={values.type}
          onValueChange={(val) =>
            setValues((v) => ({ ...v, type: val as typeof values.type }))
          }
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="question">Question</SelectItem>
            <SelectItem value="feature-request">Feature Request</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={values.priority}
          onValueChange={(val) =>
            setValues((v) => ({ ...v, priority: val as typeof values.priority }))
          }
        >
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          rows={6}
          placeholder="Describe your question or request. Add as much detail as possible so the BDO/admin can help you quickly."
        />
      </div>

      <Button type="submit" disabled={createTask.isPending}>
        {createTask.isPending ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}

