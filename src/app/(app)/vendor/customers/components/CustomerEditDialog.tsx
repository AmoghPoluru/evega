"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
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
import {
  CUSTOMER_SEGMENTS,
  getCustomerSegmentLabel,
  type CustomerSegmentId,
} from "@/lib/customers/customer-segments";

type CategoryMode = "automatic" | CustomerSegmentId;

type EditableCustomer = {
  listCustomerId: string;
  customerRecordId?: string | null;
  name: string;
  email: string;
  phone: string;
  systemSegment: CustomerSegmentId | null;
  displaySegment: CustomerSegmentId | null;
  isManualSegment: boolean;
  segmentOverrideReason: string | null;
  segmentOverrideSetAt: string | null;
};

type CustomerEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: EditableCustomer | null;
  onSaved: () => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  categoryMode: CategoryMode;
  reason: string;
};

function toFormState(customer: EditableCustomer): FormState {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    categoryMode: customer.isManualSegment
      ? (customer.displaySegment ?? "visitor")
      : "automatic",
    reason: customer.segmentOverrideReason ?? "",
  };
}

function emptyFormState(): FormState {
  return {
    name: "",
    email: "",
    phone: "",
    categoryMode: "automatic",
    reason: "",
  };
}

function formatSystemSegmentLabel(segment: CustomerSegmentId | null): string {
  if (!segment) return "Uncategorized";
  return getCustomerSegmentLabel(segment);
}

export function CustomerEditDialog({
  open,
  onOpenChange,
  customer,
  onSaved,
}: CustomerEditDialogProps) {
  const [form, setForm] = useState<FormState>(emptyFormState());
  const utils = trpc.useUtils();

  const updateMutation = trpc.vendor.customers.update.useMutation({
    onSuccess: async () => {
      toast.success("Customer updated");
      await utils.vendor.customers.list.invalidate();
      await utils.vendor.dashboard.stats.invalidate();
      onSaved();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update customer");
    },
  });

  useEffect(() => {
    if (open && customer) {
      setForm(toFormState(customer));
    }
  }, [open, customer]);

  const isManual = form.categoryMode !== "automatic";
  const systemLabel = formatSystemSegmentLabel(customer?.systemSegment ?? null);
  const willRevertToAutomatic =
    customer?.isManualSegment && form.categoryMode === "automatic";
  const automaticWouldChange =
    willRevertToAutomatic &&
    customer?.systemSegment !== customer?.displaySegment;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customer) return;

    if (isManual && form.reason.trim().length < 3) {
      toast.error("Please add a short reason for the manual category");
      return;
    }

    if (automaticWouldChange) {
      const confirmed = window.confirm(
        `System will show: ${systemLabel}. Continue?`,
      );
      if (!confirmed) return;
    }

    updateMutation.mutate({
      customerRecordId: customer.customerRecordId ?? undefined,
      listCustomerId: customer.listCustomerId,
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      categoryMode: form.categoryMode,
      reason: isManual ? form.reason.trim() : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit customer</DialogTitle>
          <DialogDescription>
            Update contact details and set a customer category manually if needed.
          </DialogDescription>
        </DialogHeader>

        {customer ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Name</Label>
              <Input
                id="customer-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-category">Customer category</Label>
              <Select
                value={form.categoryMode}
                onValueChange={(value: CategoryMode) =>
                  setForm((current) => ({ ...current, categoryMode: value }))
                }
              >
                <SelectTrigger id="customer-category">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">
                    Use automatic category ({systemLabel})
                  </SelectItem>
                  {CUSTOMER_SEGMENTS.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Based on orders and activity: {systemLabel}
              </p>
              {customer.isManualSegment && customer.segmentOverrideSetAt ? (
                <p className="text-xs text-muted-foreground">
                  Manual since{" "}
                  {format(new Date(customer.segmentOverrideSetAt), "MMM d, yyyy")}
                  {customer.segmentOverrideReason
                    ? ` — "${customer.segmentOverrideReason}"`
                    : ""}
                </p>
              ) : null}
            </div>

            {isManual ? (
              <div className="space-y-2">
                <Label htmlFor="customer-reason">Reason</Label>
                <Textarea
                  id="customer-reason"
                  value={form.reason}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, reason: event.target.value }))
                  }
                  placeholder="e.g. Paid in person at expo, referred by..."
                  rows={3}
                  required
                />
              </div>
            ) : null}

            {willRevertToAutomatic ? (
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Saving will remove your manual category and use the automatic category
                ({systemLabel}).
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
