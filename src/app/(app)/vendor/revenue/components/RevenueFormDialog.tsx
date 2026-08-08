"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import {
  VENDOR_SALE_CONTEXTS,
  type VendorSaleContextId,
} from "@/lib/vendor-revenue/sale-context";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type VendorProductListItem =
  inferRouterOutputs<AppRouter>["vendor"]["products"]["list"]["docs"][number];

type RevenueLineItemForm = {
  productId: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

type RevenueCustomerForm = {
  name: string;
  phone: string;
};

type RevenueFormState = {
  saleDate: string;
  saleContext: VendorSaleContextId;
  expoName: string;
  description: string;
  customers: RevenueCustomerForm[];
  amount: string;
  trackProducts: boolean;
  lineItems: RevenueLineItemForm[];
};

type RevenueFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

function emptyCustomer(): RevenueCustomerForm {
  return { name: "", phone: "" };
}

function emptyLineItem(): RevenueLineItemForm {
  return {
    productId: "",
    description: "",
    quantity: "1",
    unitPrice: "",
  };
}

function emptyFormState(): RevenueFormState {
  return {
    saleDate: new Date().toISOString().slice(0, 10),
    saleContext: "store_visit",
    expoName: "",
    description: "",
    customers: [emptyCustomer()],
    amount: "",
    trackProducts: false,
    lineItems: [emptyLineItem()],
  };
}

export function RevenueFormDialog({ open, onOpenChange, onSaved }: RevenueFormDialogProps) {
  const [form, setForm] = useState<RevenueFormState>(emptyFormState);

  useEffect(() => {
    if (open) {
      setForm(emptyFormState());
    }
  }, [open]);

  const { data: productsData, isLoading: productsLoading } = trpc.vendor.products.list.useQuery(
    {
      status: "published",
      limit: 100,
      page: 1,
      sortBy: "name",
      sortOrder: "asc",
    },
    { enabled: open && form.trackProducts },
  );

  const products: VendorProductListItem[] = productsData?.docs ?? [];

  const lineItemsTotal = useMemo(() => {
    return form.lineItems.reduce((sum, line) => {
      const quantity = Number.parseFloat(line.quantity);
      const unitPrice = Number.parseFloat(line.unitPrice);
      if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
        return sum;
      }
      return sum + quantity * unitPrice;
    }, 0);
  }, [form.lineItems]);

  const createRevenue = trpc.vendor.revenue.create.useMutation({
    onSuccess: () => {
      toast.success("Revenue recorded as a closed order");
      onSaved();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record revenue");
    },
  });

  const updateLineItem = (index: number, patch: Partial<RevenueLineItemForm>) => {
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    }));
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((item: VendorProductListItem) => item.id === productId);
    updateLineItem(index, {
      productId,
      unitPrice: product?.price != null ? String(product.price) : "",
      description: product?.name ?? "",
    });
  };

  const updateCustomer = (index: number, patch: Partial<RevenueCustomerForm>) => {
    setForm((current) => ({
      ...current,
      customers: current.customers.map((customer, customerIndex) =>
        customerIndex === index ? { ...customer, ...patch } : customer,
      ),
    }));
  };

  const needsCustomers =
    form.saleContext === "store_visit" || form.saleContext === "expo";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (needsCustomers) {
      const completeCustomers = form.customers.filter(
        (customer) => customer.name.trim() && customer.phone.trim(),
      );
      const partialCustomers = form.customers.filter(
        (customer) =>
          (customer.name.trim() && !customer.phone.trim()) ||
          (!customer.name.trim() && customer.phone.trim()),
      );

      if (partialCustomers.length > 0) {
        toast.error("Each customer needs both a name and phone number");
        return;
      }

      if (completeCustomers.length === 0) {
        toast.error("Add at least one customer with name and phone");
        return;
      }
    }

    const payload = {
      saleDate: form.saleDate,
      saleContext: form.saleContext,
      expoName: form.saleContext === "expo" ? form.expoName.trim() : undefined,
      description: form.description.trim() || undefined,
      customers: needsCustomers
        ? form.customers
            .filter((customer) => customer.name.trim() && customer.phone.trim())
            .map((customer) => ({
              name: customer.name.trim(),
              phone: customer.phone.trim(),
            }))
        : undefined,
      amount: !form.trackProducts ? Number.parseFloat(form.amount) : undefined,
      lineItems: form.trackProducts
        ? form.lineItems.map((line) => ({
            productId: line.productId.trim() || undefined,
            description: line.description.trim() || undefined,
            quantity: Number.parseInt(line.quantity, 10),
            unitPrice: Number.parseFloat(line.unitPrice),
          }))
        : undefined,
    };

    createRevenue.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add revenue</DialogTitle>
          <DialogDescription>
            Record a sale from a store visit, expo, or other offline channel. This automatically
            creates a closed order (Complete) tagged Manual — it appears in My Revenue right away.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="revenue-sale-date">Sale date</Label>
              <Input
                id="revenue-sale-date"
                type="date"
                value={form.saleDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, saleDate: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue-sale-context">Where did this sale happen?</Label>
              <Select
                value={form.saleContext}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    saleContext: value as VendorSaleContextId,
                    expoName: value === "expo" ? current.expoName : "",
                    customers:
                      value === "store_visit" || value === "expo"
                        ? current.customers.length > 0
                          ? current.customers
                          : [emptyCustomer()]
                        : [],
                  }))
                }
              >
                <SelectTrigger id="revenue-sale-context">
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_SALE_CONTEXTS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.saleContext === "expo" ? (
            <div className="space-y-2">
              <Label htmlFor="revenue-expo-name">Expo / event name</Label>
              <Input
                id="revenue-expo-name"
                placeholder="e.g. Diwali Mela 2026, Houston Saree Expo"
                value={form.expoName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, expoName: event.target.value }))
                }
                required
              />
            </div>
          ) : null}

          {needsCustomers ? (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Customers</p>
                  <p className="text-xs text-muted-foreground">
                    Name and phone for each customer — no shipping address. Online orders still
                    use a full address at checkout.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      customers: [...current.customers, emptyCustomer()],
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add customer
                </Button>
              </div>

              {form.customers.map((customer, index) => (
                <div key={index} className="rounded-md border bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Customer {index + 1}</p>
                    {form.customers.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            customers: current.customers.filter(
                              (_, customerIndex) => customerIndex !== index,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`customer-name-${index}`}>Name</Label>
                      <Input
                        id={`customer-name-${index}`}
                        placeholder="Customer name"
                        value={customer.name}
                        onChange={(event) =>
                          updateCustomer(index, { name: event.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`customer-phone-${index}`}>Phone</Label>
                      <Input
                        id={`customer-phone-${index}`}
                        type="tel"
                        placeholder="e.g. (555) 123-4567"
                        value={customer.phone}
                        onChange={(event) =>
                          updateCustomer(index, { phone: event.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="revenue-description">Description</Label>
            <Textarea
              id="revenue-description"
              rows={3}
              placeholder="e.g. Walk-in customer, bulk order at booth, pop-up store sale"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              required={!form.trackProducts}
            />
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Track products sold</p>
                <p className="text-xs text-muted-foreground">
                  Optional. Turn off to record only the sale amount and description.
                </p>
              </div>
              <Button
                type="button"
                variant={form.trackProducts ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    trackProducts: !current.trackProducts,
                    lineItems: current.trackProducts ? [emptyLineItem()] : current.lineItems,
                  }))
                }
              >
                {form.trackProducts ? "On" : "Off"}
              </Button>
            </div>

            {form.trackProducts ? (
              <div className="space-y-3">
                {form.lineItems.map((line, index) => (
                  <div key={index} className="rounded-md border bg-muted/20 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Product {index + 1}</p>
                      {form.lineItems.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              lineItems: current.lineItems.filter((_, lineIndex) => lineIndex !== index),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label>Product (optional)</Label>
                      <Select
                        value={line.productId || undefined}
                        onValueChange={(value) => handleProductChange(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              productsLoading ? "Loading products..." : "Select a product"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product: VendorProductListItem) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                              {product.price != null ? ` (${formatCurrency(product.price)})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Line description</Label>
                      <Input
                        placeholder="Used if no product is selected"
                        value={line.description}
                        onChange={(event) =>
                          updateLineItem(index, { description: event.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={line.quantity}
                          onChange={(event) =>
                            updateLineItem(index, { quantity: event.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={line.unitPrice}
                          onChange={(event) =>
                            updateLineItem(index, { unitPrice: event.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      lineItems: [...current.lineItems, emptyLineItem()],
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add another product
                </Button>

                <p className="text-sm font-medium text-green-700">
                  Total: {formatCurrency(lineItemsTotal)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="revenue-amount">Sale amount</Label>
                <Input
                  id="revenue-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, amount: event.target.value }))
                  }
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRevenue.isPending}>
              {createRevenue.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Add revenue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
