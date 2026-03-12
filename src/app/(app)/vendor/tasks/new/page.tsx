import { redirect } from "next/navigation";
import Link from "next/link";

import { requireVendor } from "@/lib/middleware/vendor-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Suspense } from "react";
import { NewTaskForm } from "./task-form";

export default async function NewVendorTaskPage() {
  // Enforce vendor auth + approval; redirects to sign-in/vendor flows if not allowed
  await requireVendor();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">New Support Task</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tell us what you need help with and our team will respond here.
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/vendor/tasks">
            Back to Tasks
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create a task</CardTitle>
          <CardDescription>
            Use this to ask questions, request new categories, or get help with uploads and setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-sm text-gray-500">Loading form...</div>}>
            <NewTaskForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

