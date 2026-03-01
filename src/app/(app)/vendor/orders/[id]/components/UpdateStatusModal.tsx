"use client";

// Task 4.17.1: UpdateStatusModal component for vendor to change order status
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
import { Package } from "lucide-react";

interface UpdateStatusModalProps {
  orderId: string;
  currentStatus: string;
  children: React.ReactNode;
}

export function UpdateStatusModal({
  orderId,
  currentStatus,
  children,
}: UpdateStatusModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string>(currentStatus);
  const [note, setNote] = useState<string>("");

  // Task 4.17.7: Call tRPC mutation to update order status
  const updateStatus = trpc.vendor.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated successfully");
      setOpen(false);
      setNote("");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update order status");
    },
  });

  // Task 4.17.6: Form validation - status is required
  const handleSubmit = () => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    // Task 4.17.13: Disable invalid status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["payment_done", "canceled"],
      payment_done: ["processing", "canceled"],
      processing: ["complete", "canceled"],
      complete: ["refunded"],
      canceled: [],
      refunded: [],
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    if (!allowedStatuses.includes(status) && status !== currentStatus) {
      toast.error(`Cannot change status from ${currentStatus} to ${status}`);
      return;
    }

    // Task 4.17.14: Show confirmation dialog for status changes to "cancelled"
    if (status === "canceled" && currentStatus !== "canceled") {
      if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
        return;
      }
    }

    updateStatus.mutate({
      id: orderId,
      status: status as any,
      note: note || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of this order. Current status: <strong>{currentStatus}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Task 4.17.3: Status dropdown with all status options */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {/* Task 4.17.4: Status options: pending, processing, payment_done, complete, canceled, refunded */}
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="payment_done">Payment Done</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Task 4.17.5: Optional note/comment field for status change */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
