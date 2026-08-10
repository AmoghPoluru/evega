"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import type { Order } from "@/payload-types";

type OrderStatus = Order["status"];

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "payment_done", label: "Payment Done" },
  { value: "processing", label: "Processing" },
  { value: "complete", label: "Complete" },
  { value: "canceled", label: "Canceled" },
  { value: "refunded", label: "Refunded" },
];

interface UpdateStatusModalProps {
  orderId: string;
  currentStatus: OrderStatus;
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function UpdateStatusModal({
  orderId,
  currentStatus,
  children,
  onSuccess,
}: UpdateStatusModalProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");

  const updateStatus = trpc.vendor.orders.updateStatus.useMutation({
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === "complete"
          ? "Order completed — revenue recorded"
          : "Order status updated successfully",
      );
      setOpen(false);
      setNote("");
      onSuccess?.();
      router.refresh();

      if (variables.status === "complete") {
        void utils.vendor.revenue.list.invalidate();
        void utils.vendor.revenue.summary.invalidate();
        void utils.vendor.dashboard.stats.invalidate();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update order status");
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setStatus(currentStatus);
      setNote("");
    }
  };

  const handleSubmit = () => {
    if (status === currentStatus) {
      toast.error("Choose a different status to update this order");
      return;
    }

    if (status === "canceled" && currentStatus !== "canceled") {
      if (!confirm("Cancel this order? Stock will be restored if it was deducted.")) {
        return;
      }
    }

    if (status === "refunded" && currentStatus !== "refunded") {
      if (!confirm("Mark this order as refunded?")) {
        return;
      }
    }

    updateStatus.mutate({
      id: orderId,
      status,
      note: note || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of this order. Current status:{" "}
            <strong>
              {ORDER_STATUS_OPTIONS.find((option) => option.value === currentStatus)?.label ??
                currentStatus}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this status change..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
