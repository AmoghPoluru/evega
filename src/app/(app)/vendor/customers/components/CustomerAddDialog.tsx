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
import { Textarea } from "@/components/ui/textarea";
import { CUSTOMER_SEGMENTS, type CustomerSegmentId } from "@/lib/customers/customer-segments";

type CategoryMode = "automatic" | CustomerSegmentId;

type FormState = {
  name: string;
  email: string;
  phone: string;
  categoryMode: CategoryMode;
  reason: string;
  note: string;
};

function emptyFormState(): FormState {
  return {
    name: "",
    email: "",
    phone: "",
    categoryMode: "visitor",
    reason: "",
    note: "",
  };
}

type CustomerAddDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function CustomerAddDialog({ open, onOpenChange, onSaved }: CustomerAddDialogProps) {
  const [form, setForm] = useState<FormState>(emptyFormState());
  const utils = trpc.useUtils();

  const createMutation = trpc.vendor.customers.create.useMutation({
    onSuccess: async () => {
      toast.success("Customer added");
      await utils.vendor.customers.list.invalidate();
      await utils.vendor.dashboard.stats.invalidate();
      onSaved();
      onOpenChange(false);
      setForm(emptyFormState());
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add customer");
    },
  });

  useEffect(() => {
    if (open) {
      setForm(emptyFormState());
    }
  }, [open]);

  const isManual = form.categoryMode !== "automatic";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.phone.trim() && !form.email.trim()) {
      toast.error("Phone or email is required");
      return;
    }

    if (isManual && form.reason.trim().length < 3) {
      toast.error("Please add a short reason for the customer category");
      return;
    }

    createMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      categoryMode: form.categoryMode,
      reason: isManual ? form.reason.trim() : undefined,
      note: form.note.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>
          <DialogDescription>
            Add a walk-in, expo, or referral contact. No login account is created until they sign
            up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-customer-name">Name</Label>
            <Input
              id="add-customer-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-customer-phone">Phone</Label>
            <Input
              id="add-customer-phone"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="Required if no email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-customer-email">Email</Label>
            <Input
              id="add-customer-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-customer-category">Customer category</Label>
            <Select
              value={form.categoryMode}
              onValueChange={(value: CategoryMode) =>
                setForm((current) => ({ ...current, categoryMode: value }))
              }
            >
              <SelectTrigger id="add-customer-category">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Uncategorized (automatic)</SelectItem>
                {CUSTOMER_SEGMENTS.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isManual ? (
            <div className="space-y-2">
              <Label htmlFor="add-customer-reason">Reason</Label>
              <Textarea
                id="add-customer-reason"
                value={form.reason}
                onChange={(event) =>
                  setForm((current) => ({ ...current, reason: event.target.value }))
                }
                placeholder="e.g. Met at expo, referred by..."
                rows={3}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="add-customer-note">Note (optional)</Label>
            <Textarea
              id="add-customer-note"
              value={form.note}
              onChange={(event) =>
                setForm((current) => ({ ...current, note: event.target.value }))
              }
              placeholder="Internal note for your team"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add customer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
