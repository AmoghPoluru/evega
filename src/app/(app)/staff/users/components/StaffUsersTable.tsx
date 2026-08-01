"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, UserCog } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffUserEditDialog } from "./StaffUserEditDialog";

type StaffUserRow = {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: string | null;
};

interface Props {
  canManage: boolean;
}

export function StaffUsersTable({ canManage }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const { data, isLoading, error } = trpc.admin.users.list.useQuery({
    search: search.trim() || undefined,
    limit: 50,
    page: 1,
  });

  const impersonate = trpc.admin.users.impersonate.useMutation({
    onSuccess: async () => {
      await utils.auth.session.invalidate();
      await utils.admin.users.impersonationStatus.invalidate();
      router.push("/");
      router.refresh();
    },
    onError: (err) => {
      setImpersonatingId(null);
      toast.error(err.message || "Failed to impersonate user");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error.message}</p>;
  }

  const users: StaffUserRow[] = data?.users ?? [];

  return (
    <>
      <div className="space-y-4">
        <Input
          placeholder="Search by name, username, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Role</th>
                {canManage ? (
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={canManage ? 5 : 4}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-gray-900">{user.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{user.email}</td>
                    <td className="px-4 py-3 text-gray-700">{user.username ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{user.role ?? "user"}</td>
                    {canManage ? (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUserId(user.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={impersonate.isPending}
                            onClick={() => {
                              setImpersonatingId(user.id);
                              impersonate.mutate({ userId: user.id });
                            }}
                          >
                            {impersonatingId === user.id && impersonate.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCog className="h-4 w-4" />
                            )}
                            Impersonate
                          </Button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StaffUserEditDialog
        userId={editingUserId}
        open={editingUserId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingUserId(null);
        }}
        onSaved={() => {
          void utils.admin.users.list.invalidate();
        }}
      />
    </>
  );
}
