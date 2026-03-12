import { redirect } from "next/navigation";
import Link from "next/link";

import { requireVendor } from "@/lib/middleware/vendor-auth";
import { caller } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { TaskReplyForm } from "./reply-form";
import { CloseTaskButton } from "./close-task-button";

interface Props {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function VendorTaskDetailPage({ params }: Props) {
  const { taskId } = await params;
  // Enforce vendor auth + approval; redirects to sign-in/vendor flows if not allowed
  await requireVendor();

  const task = await caller.vendorTasks.getOne({ id: taskId });
  const messagesResult = await caller.vendorTasks.listMessagesForTask({ taskId });

  if (!task) {
    redirect("/vendor/tasks");
  }

  const messages = messagesResult?.docs || [];

  const statusLabel = (task.status || "open") as string;
  const isClosed = statusLabel === "closed";

  return (
    <div className="p-6 space-y-6">
      {isClosed && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>This task is closed.</strong> The conversation is now readonly. No new messages can be sent.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Support task with Evega team. Use this page to communicate with BDO/admin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CloseTaskButton taskId={taskId} taskStatus={statusLabel} />
          <Button asChild variant="ghost">
            <Link href="/vendor/tasks">
              Back to Tasks
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Task Details</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Type:{" "}
              <span className="capitalize">
                {(task.type as string)?.replace("-", " ") || "question"}
              </span>
              {task.priority && (
                <>
                  {" "}
                  · Priority:{" "}
                  <span className="capitalize">
                    {task.priority as string}
                  </span>
                </>
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
                No messages yet. Use the box below to send your first message to the Evega team.
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className="border rounded-md px-3 py-2 bg-white flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-medium capitalize">
                        {msg.role === "admin" ? "Admin / BDO" : "You"}
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

