"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Loader2, Pencil, PowerOff } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StaffVendorEditDialog } from "./StaffVendorEditDialog";

type VendorStatus = "all" | "pending" | "approved" | "suspended" | "rejected";

type VendorRow = {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: string;
  isActive: boolean;
  selectedTemplateName: string | null;
};

function statusBadge(status: string, isActive: boolean) {
  if (status === "approved" && isActive) {
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  }
  if (status === "approved") {
    return <Badge className="bg-yellow-100 text-yellow-800">Approved (inactive)</Badge>;
  }
  if (status === "pending") {
    return <Badge variant="outline">Pending</Badge>;
  }
  if (status === "suspended") {
    return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>;
  }
  if (status === "rejected") {
    return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}

export function StaffVendorsTable() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<VendorStatus>("all");
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [actionVendorId, setActionVendorId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = trpc.admin.vendors.list.useQuery({
    search: debouncedSearch.trim() || undefined,
    status,
    limit: 50,
    page: 1,
  });

  const invalidateVendors = () => {
    void utils.admin.vendors.list.invalidate();
    void utils.admin.vendors.listOptions.invalidate();
  };

  const approveVendor = trpc.admin.vendors.approve.useMutation({
    onMutate: ({ id }) => setActionVendorId(id),
    onSuccess: (vendor) => {
      toast.success(`${vendor.name} approved and activated`);
      invalidateVendors();
    },
    onError: (err) => toast.error(err.message || "Failed to approve vendor"),
    onSettled: () => setActionVendorId(null),
  });

  const setActive = trpc.admin.vendors.setActive.useMutation({
    onMutate: ({ id }) => setActionVendorId(id),
    onSuccess: (vendor) => {
      toast.success(
        vendor.isActive ? `${vendor.name} activated` : `${vendor.name} deactivated`
      );
      invalidateVendors();
    },
    onError: (err) => toast.error(err.message || "Failed to update vendor status"),
    onSettled: () => setActionVendorId(null),
  });

  const isActionPending = approveVendor.isPending || setActive.isPending;

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

  const vendors: VendorRow[] = data?.vendors ?? [];

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by name, slug, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={status} onValueChange={(value: VendorStatus) => setStatus(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Template</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={5}>
                    No vendors found.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => {
                  const isApprovedAndActive =
                    vendor.status === "approved" && vendor.isActive;
                  const canApprove = !isApprovedAndActive;
                  const isRowBusy = actionVendorId === vendor.id && isActionPending;

                  return (
                    <tr key={vendor.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                        <div className="text-xs text-gray-500">{vendor.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{vendor.email}</td>
                      <td className="px-4 py-3">
                        {statusBadge(vendor.status, vendor.isActive)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {vendor.selectedTemplateName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          {canApprove ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={isActionPending}
                              onClick={() => approveVendor.mutate({ id: vendor.id })}
                            >
                              {isRowBusy && approveVendor.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              {vendor.status === "approved" ? "Activate" : "Approve"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-700 border-orange-200 hover:bg-orange-50"
                              disabled={isActionPending}
                              onClick={() =>
                                setActive.mutate({ id: vendor.id, isActive: false })
                              }
                            >
                              {isRowBusy && setActive.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <PowerOff className="h-4 w-4" />
                              )}
                              Deactivate
                            </Button>
                          )}

                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/vendors/${vendor.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isActionPending}
                            onClick={() => setEditingVendorId(vendor.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StaffVendorEditDialog
        vendorId={editingVendorId}
        open={editingVendorId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingVendorId(null);
        }}
        onSaved={invalidateVendors}
      />
    </>
  );
}
