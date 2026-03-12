import { redirect } from "next/navigation";
import Link from "next/link";

import { requireVendor } from "@/lib/middleware/vendor-auth";
import { caller } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function VendorTasksPage() {
  // Enforce vendor auth + approval; redirects to sign-in/vendor flows if not allowed
  await requireVendor();

  const tasksResult = await caller.vendorTasks.listForVendor({
    status: undefined,
    type: undefined,
    priority: undefined,
  });

  const tasks = tasksResult.docs || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Support & Tasks</h1>
          <p className="text-sm text-gray-600 mt-1">
            Ask questions or request help from the Evega team. We’ll reply here.
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/tasks/new">
            New Task
          </Link>
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-gray-600">
            You don&apos;t have any tasks yet. Click &quot;New Task&quot; to ask a question or request help.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task: any) => (
            <Card key={task.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    <Link href={`/vendor/tasks/${task.id}`} className="hover:underline">
                      {task.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {task.type && (
                      <span className="capitalize mr-2">
                        {task.type.replace("-", " ")}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {task.priority && (
                    <span className="text-[11px] text-gray-500 capitalize">
                      Priority: {task.priority}
                    </span>
                  )}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs"
                  >
                    <Link href={`/vendor/tasks/${task.id}`}>
                      Open &amp; reply
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Updated: {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "N/A"}
                  </span>
                  {task.assignedTo && (
                    <span>
                      Assigned to:{" "}
                      {typeof task.assignedTo === "object" && task.assignedTo !== null
                        ? (task.assignedTo as any).email || (task.assignedTo as any).username || "Admin"
                        : "Admin"}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

