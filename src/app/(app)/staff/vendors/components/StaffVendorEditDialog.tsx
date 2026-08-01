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
import { Checkbox } from "@/components/ui/checkbox";

type VendorStatus = "pending" | "approved" | "suspended" | "rejected";
type PaymentMethod = "stripe" | "offline" | "both";

type VendorDraft = {
  name: string;
  slug: string;
  email: string;
  phone: string;
  website: string;
  status: VendorStatus;
  isActive: boolean;
  commissionRate: string;
  contactPhone: string;
  contactEmail: string;
  preferredPaymentMethod: PaymentMethod;
  offlinePaymentInstructions: string;
  selectedTemplateId: string;
  whatsappBusinessNumber: string;
  whatsappNotificationsEnabled: boolean;
};

interface Props {
  vendorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function emptyDraft(): VendorDraft {
  return {
    name: "",
    slug: "",
    email: "",
    phone: "",
    website: "",
    status: "pending",
    isActive: false,
    commissionRate: "10",
    contactPhone: "",
    contactEmail: "",
    preferredPaymentMethod: "both",
    offlinePaymentInstructions: "",
    selectedTemplateId: "",
    whatsappBusinessNumber: "",
    whatsappNotificationsEnabled: true,
  };
}

export function StaffVendorEditDialog({ vendorId, open, onOpenChange, onSaved }: Props) {
  const [draft, setDraft] = useState<VendorDraft>(emptyDraft);

  const { data: vendor, isLoading, error } = trpc.admin.vendors.getOne.useQuery(
    { id: vendorId! },
    { enabled: open && !!vendorId }
  );

  const { data: templates } = trpc.admin.vendors.listTemplateOptions.useQuery(undefined, {
    enabled: open,
  });

  const updateVendor = trpc.admin.vendors.update.useMutation({
    onSuccess: () => {
      toast.success("Vendor updated");
      onSaved();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update vendor");
    },
  });

  useEffect(() => {
    if (!vendor) return;
    setDraft({
      name: vendor.name,
      slug: vendor.slug,
      email: vendor.email,
      phone: vendor.phone ?? "",
      website: vendor.website ?? "",
      status: vendor.status as VendorStatus,
      isActive: vendor.isActive,
      commissionRate: String(vendor.commissionRate ?? 10),
      contactPhone: vendor.contactPhone ?? "",
      contactEmail: vendor.contactEmail ?? "",
      preferredPaymentMethod: (vendor.preferredPaymentMethod as PaymentMethod) ?? "both",
      offlinePaymentInstructions: vendor.offlinePaymentInstructions ?? "",
      selectedTemplateId: vendor.selectedTemplateId ?? "",
      whatsappBusinessNumber: vendor.whatsappBusinessNumber ?? "",
      whatsappNotificationsEnabled: vendor.whatsappNotificationsEnabled,
    });
  }, [vendor]);

  useEffect(() => {
    if (!open) setDraft(emptyDraft());
  }, [open]);

  const handleSave = () => {
    if (!vendorId) return;

    if (!draft.name.trim() || !draft.slug.trim() || !draft.email.trim()) {
      toast.error("Name, slug, and email are required");
      return;
    }

    const commissionRate = Number(draft.commissionRate);
    if (Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      toast.error("Commission rate must be between 0 and 100");
      return;
    }

    updateVendor.mutate({
      id: vendorId,
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      email: draft.email.trim(),
      phone: draft.phone,
      website: draft.website,
      status: draft.status,
      isActive: draft.isActive,
      commissionRate,
      contactPhone: draft.contactPhone,
      contactEmail: draft.contactEmail.trim() || null,
      preferredPaymentMethod: draft.preferredPaymentMethod,
      offlinePaymentInstructions: draft.offlinePaymentInstructions,
      selectedTemplateId: draft.selectedTemplateId || null,
      whatsappBusinessNumber: draft.whatsappBusinessNumber,
      whatsappNotificationsEnabled: draft.whatsappNotificationsEnabled,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit vendor</DialogTitle>
          <DialogDescription>
            Update vendor profile, approval status, payments, template, and WhatsApp settings.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error.message}</p>
        ) : (
          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Business profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="vendor-name">Business name</Label>
                  <Input
                    id="vendor-name"
                    value={draft.name}
                    onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vendor-slug">Slug</Label>
                  <Input
                    id="vendor-slug"
                    value={draft.slug}
                    onChange={(e) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vendor-email">Email</Label>
                  <Input
                    id="vendor-email"
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vendor-phone">Phone</Label>
                  <Input
                    id="vendor-phone"
                    value={draft.phone}
                    onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vendor-website">Website</Label>
                  <Input
                    id="vendor-website"
                    value={draft.website}
                    onChange={(e) => setDraft((prev) => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Approval &amp; storefront</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="vendor-status">Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(value: VendorStatus) =>
                      setDraft((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger id="vendor-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vendor-template">Storefront template</Label>
                  <Select
                    value={draft.selectedTemplateId || undefined}
                    onValueChange={(value) =>
                      setDraft((prev) => ({ ...prev, selectedTemplateId: value }))
                    }
                  >
                    <SelectTrigger id="vendor-template">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {(templates ?? []).map((template: { id: string; name: string; isDefault: boolean }) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                          {template.isDefault ? " (default)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vendor-commission">Commission rate (%)</Label>
                  <Input
                    id="vendor-commission"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={draft.commissionRate}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, commissionRate: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    id="vendor-active"
                    checked={draft.isActive}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({ ...prev, isActive: checked === true }))
                    }
                  />
                  <Label htmlFor="vendor-active">Active (can sell products)</Label>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Payments</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="vendor-payment-method">Preferred payment method</Label>
                  <Select
                    value={draft.preferredPaymentMethod}
                    onValueChange={(value: PaymentMethod) =>
                      setDraft((prev) => ({ ...prev, preferredPaymentMethod: value }))
                    }
                  >
                    <SelectTrigger id="vendor-payment-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Stripe &amp; offline</SelectItem>
                      <SelectItem value="stripe">Stripe only</SelectItem>
                      <SelectItem value="offline">Offline only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vendor-contact-phone">Offline contact phone</Label>
                  <Input
                    id="vendor-contact-phone"
                    value={draft.contactPhone}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, contactPhone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="vendor-contact-email">Offline contact email</Label>
                  <Input
                    id="vendor-contact-email"
                    type="email"
                    value={draft.contactEmail}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, contactEmail: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="vendor-offline-instructions">Offline payment instructions</Label>
                  <Textarea
                    id="vendor-offline-instructions"
                    rows={3}
                    value={draft.offlinePaymentInstructions}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        offlinePaymentInstructions: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">WhatsApp notifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="vendor-whatsapp-number">Business number (E.164)</Label>
                  <Input
                    id="vendor-whatsapp-number"
                    placeholder="+13098253354"
                    value={draft.whatsappBusinessNumber}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        whatsappBusinessNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="vendor-whatsapp-enabled"
                    checked={draft.whatsappNotificationsEnabled}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        whatsappNotificationsEnabled: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="vendor-whatsapp-enabled">Notifications enabled</Label>
                </div>
              </div>
            </section>

            {vendor ? (
              <section className="rounded-md bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                <p>
                  Storefront:{" "}
                  <a
                    href={`/vendors/${vendor.slug}`}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /vendors/{vendor.slug}
                  </a>
                </p>
                {vendor.stripeAccountId ? (
                  <p>Stripe: {vendor.stripeAccountStatus ?? "connected"} ({vendor.stripeAccountId})</p>
                ) : (
                  <p>Stripe: not connected</p>
                )}
              </section>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateVendor.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !!error || updateVendor.isPending}
          >
            {updateVendor.isPending ? (
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
