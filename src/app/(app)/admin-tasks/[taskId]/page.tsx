import Link from "next/link";

import { requireAppAdmin } from "@/lib/middleware/admin-auth";
import { caller } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { TaskReplyForm } from "@/app/(app)/vendor/tasks/[taskId]/reply-form";
import { CloseTaskButton } from "@/app/(app)/vendor/tasks/[taskId]/close-task-button";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function AdminVendorTaskDetailPage({ params }: Props) {
  const { taskId } = await params;
  const adminUser = await requireAppAdmin(`/admin-tasks/${taskId}`);

  const task = await caller.vendorTasks.getOne({ id: taskId });
  const messagesResult = await caller.vendorTasks.listMessagesForTask({ taskId });

  if (!task) {
    redirect("/admin-tasks");
  }

  const messages = messagesResult?.docs || [];
  const statusLabel = (task.status || "open") as string;
  const isClosed = statusLabel === "closed";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {isClosed && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>This task is closed.</strong> The conversation is now readonly. No new messages can be sent.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Respond to the vendor and track the conversation for this support task.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CloseTaskButton taskId={taskId} taskStatus={statusLabel} />
          <Button asChild variant="ghost">
            <Link href="/admin-tasks">
              Back to Tasks
            </Link>
          </Button>
        </div>
      </div>

      {adminUser && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          You are replying as an <span className="font-semibold">admin</span>
          {adminUser.user.email ? ` (${adminUser.user.email})` : ""}.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Task Details</CardTitle>
            <CardDescription className="mt-1 text-xs space-x-2">
              <span className="capitalize">
                {task.type?.replace("-", " ") || "question"}
              </span>
              {task.vendor && (
                <span className="text-gray-500">
                  · Vendor:{" "}
                  {typeof task.vendor === "object" && task.vendor !== null
                    ? (task.vendor as any).name || (task.vendor as any).slug || "Vendor"
                    : "Vendor"}
                </span>
              )}
              {task.priority && (
                <span className="text-gray-500">
                  · Priority: <span className="capitalize">{task.priority as string}</span>
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] text-gray-500">
              Last updated:{" "}
              {task.updatedAt ? new Date(task.updatedAt as string).toLocaleString() : "N/A"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-xs text-gray-500">
                No messages yet. Use the box below to send the first message to the vendor.
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className="border rounded-md px-3 py-2 bg-white flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-medium">
                        {msg.role === "admin" ? "Admin / BDO" : "Vendor"}
                        {msg.isInternal && " (Internal)"}
                      </span>
                      <span>
                        {msg.createdAt
                          ? new Date(msg.createdAt as string).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-800">
                      {msg.body ? (
                        <RichText data={msg.body} />
                      ) : (
                        <p className="italic text-gray-500">No content</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t mt-4">
            <TaskReplyForm taskId={taskId} taskStatus={statusLabel} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

