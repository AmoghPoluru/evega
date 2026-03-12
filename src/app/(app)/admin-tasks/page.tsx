import Link from "next/link";

import { requireAppAdmin } from "@/lib/middleware/admin-auth";
import { caller } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminVendorTasksPage() {
  const adminUser = await requireAppAdmin("/admin-tasks");

  const tasksResult = await caller.vendorTasks.listForVendor({
    status: undefined,
    type: undefined,
    priority: undefined,
  });

  const tasks = tasksResult.docs || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendor Tasks (Admin)</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and respond to support tasks created by vendors.
          </p>
        </div>
      </div>

      {adminUser && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          You are viewing this page as an <span className="font-semibold">admin</span>
          {adminUser.user.email ? ` (${adminUser.user.email})` : ""}.
        </div>
      )}

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-gray-600">
            There are no vendor tasks yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task: any) => (
            <Card key={task.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-base">
                    <Link href={`/admin-tasks/${task.id}`} className="hover:underline">
                      {task.title}
                    </Link>
                  </CardTitle>
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
                    <Link href={`/admin-tasks/${task.id}`}>
                      Open &amp; reply
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Updated:{" "}
                    {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "N/A"}
                  </span>
                  {task.assignedTo && (
                    <span>
                      Assigned to:{" "}
                      {typeof task.assignedTo === "object" && task.assignedTo !== null
                        ? (task.assignedTo as any).email ||
                          (task.assignedTo as any).username ||
                          "Admin"
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

