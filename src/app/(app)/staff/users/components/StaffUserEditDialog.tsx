"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = "user" | "vendor" | "admin";

type UserDraft = {
  name: string;
  username: string;
  email: string;
  role: UserRole;
  vendorId: string;
  password: string;
};

interface Props {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function emptyDraft(): UserDraft {
  return {
    name: "",
    username: "",
    email: "",
    role: "user",
    vendorId: "",
    password: "",
  };
}

export function StaffUserEditDialog({ userId, open, onOpenChange, onSaved }: Props) {
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);

  const { data: user, isLoading, error } = trpc.admin.users.getOne.useQuery(
    { id: userId! },
    { enabled: open && !!userId }
  );

  const { data: vendors } = trpc.admin.vendors.listOptions.useQuery(undefined, {
    enabled: open,
  });

  const updateUser = trpc.admin.users.update.useMutation({
    onSuccess: () => {
      toast.success("User updated");
      onSaved();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update user");
    },
  });

  useEffect(() => {
    if (!user) return;
    setDraft({
      name: user.name ?? "",
      username: user.username ?? "",
      email: user.email,
      role: (user.role as UserRole) ?? "user",
      vendorId: user.vendorId ?? "",
      password: "",
    });
  }, [user]);

  useEffect(() => {
    if (!open) {
      setDraft(emptyDraft());
    }
  }, [open]);

  const handleSave = () => {
    if (!userId) return;

    if (!draft.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (draft.role === "vendor" && !draft.vendorId) {
      toast.error("Vendor role requires a linked vendor");
      return;
    }

    updateUser.mutate({
      id: userId,
      name: draft.name,
      username: draft.username,
      email: draft.email.trim(),
      role: draft.role,
      vendorId: draft.role === "vendor" ? draft.vendorId || null : null,
      password: draft.password.trim() ? draft.password : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update account details, role, and optional password reset.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error.message}</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="user-name">Full name</Label>
              <Input
                id="user-name"
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="user-username">Username</Label>
              <Input
                id="user-username"
                value={draft.username}
                onChange={(e) => setDraft((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="user-role">Role</Label>
              <Select
                value={draft.role}
                onValueChange={(value: UserRole) =>
                  setDraft((prev) => ({
                    ...prev,
                    role: value,
                    vendorId: value === "vendor" ? prev.vendorId : "",
                  }))
                }
              >
                <SelectTrigger id="user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {draft.role === "vendor" ? (
              <div className="space-y-1">
                <Label htmlFor="user-vendor">Linked vendor</Label>
                <Select
                  value={draft.vendorId || undefined}
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, vendorId: value }))
                  }
                >
                  <SelectTrigger id="user-vendor">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {(vendors ?? []).map((vendor: { id: string; name: string }) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-1">
              <Label htmlFor="user-password">New password</Label>
              <Input
                id="user-password"
                type="password"
                autoComplete="new-password"
                placeholder="Leave blank to keep current password"
                value={draft.password}
                onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>

            {user?.oauthProvider && user.oauthProvider !== "email" ? (
              <p className="text-xs text-gray-500">
                Sign-in method: {user.oauthProvider}
              </p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateUser.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !!error || updateUser.isPending}
          >
            {updateUser.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
