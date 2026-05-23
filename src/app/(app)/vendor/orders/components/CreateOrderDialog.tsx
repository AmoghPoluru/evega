'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const createOrderSchema = z.object({
  customerEmail: z.string().email('Please enter a valid email address').min(1, 'Customer email is required'),
  customerName: z.string().optional(),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  status: z.enum(['pending', 'payment_done', 'processing', 'complete']),
  paymentMethod: z.enum(['stripe', 'offline']),
  shippingAddress: z.object({
    fullName: z.string().min(1, 'Recipient name is required'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipcode: z.string().min(1, 'ZIP code is required'),
    country: z.string().optional(),
    phone: z.string().optional(),
  }),
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

interface VendorOption {
  id: string;
  name: string;
}

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  context?: 'vendor' | 'staff';
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  onSuccess,
  context = 'vendor',
}: CreateOrderDialogProps) {
  const isStaffContext = context === 'staff';
  const [filterVendorId, setFilterVendorId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    price: number;
    variants?: { variantData?: Record<string, unknown> }[];
  } | null>(null);
  
  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema) as any,
    defaultValues: {
      quantity: 1,
      status: 'pending',
      paymentMethod: 'offline',
      shippingAddress: {
        country: 'United States',
      },
    },
  });

  const { data: vendorsData } = trpc.admin.vendors.listOptions.useQuery(undefined, {
    enabled: isStaffContext && open,
  });

  const { data: vendorProductsData } = trpc.vendor.products.list.useQuery(
    { status: 'all', limit: 100 },
    { enabled: !isStaffContext && open },
  );

  const { data: staffProductsData } = trpc.admin.orders.productsForCreate.useQuery(
    {
      vendorId: filterVendorId || undefined,
      limit: 200,
    },
    { enabled: isStaffContext && open },
  );

  const productsData = isStaffContext ? staffProductsData : vendorProductsData;

  const utils = trpc.useUtils();

  const onCreateSuccess = () => {
    toast.success('Order created successfully');
    form.reset();
    setSelectedProduct(null);
    setFilterVendorId('');
    if (isStaffContext) {
      void utils.admin.orders.list.invalidate();
    } else {
      void utils.vendor.orders.list.invalidate();
    }
    onSuccess?.();
  };

  const createVendorOrder = trpc.vendor.orders.create.useMutation({
    onSuccess: onCreateSuccess,
    onError: (error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });

  const createStaffOrder = trpc.admin.orders.create.useMutation({
    onSuccess: onCreateSuccess,
    onError: (error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });

  const createOrder = isStaffContext ? createStaffOrder : createVendorOrder;

  const productId = form.watch('productId');
  const quantity = form.watch('quantity') || 1;

  // Update selected product when productId changes
  useEffect(() => {
    if (!open) return;
    if (!productId || !productsData?.docs) {
      setSelectedProduct(null);
      return;
    }
    const product = productsData.docs.find((p: { id: string }) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      if (!form.getValues('price') || form.getValues('price') === 0) {
        form.setValue('price', product.price || 0);
      }
    }
  }, [productId, productsData, open, form]);

  useEffect(() => {
    if (isStaffContext && filterVendorId) {
      form.setValue('productId', '');
      setSelectedProduct(null);
    }
  }, [filterVendorId, isStaffContext, form]);

  // Calculate total when quantity or price changes
  const price = form.watch('price') || 0;
  const total = price * quantity;

  const handleSubmit = (values: CreateOrderFormValues) => {
    createOrder.mutate({
      customerEmail: values.customerEmail,
      customerName: values.customerName || undefined,
      productId: values.productId,
      quantity: values.quantity,
      size: values.size || undefined,
      color: values.color || undefined,
      price: values.price,
      status: values.status,
      paymentMethod: values.paymentMethod,
      shippingAddress: {
        fullName: values.shippingAddress.fullName,
        street: values.shippingAddress.street,
        city: values.shippingAddress.city,
        state: values.shippingAddress.state,
        zipcode: values.shippingAddress.zipcode,
        country: values.shippingAddress.country || 'United States',
        phone: values.shippingAddress.phone || undefined,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Manual Order</DialogTitle>
          <DialogDescription>
            {isStaffContext
              ? 'Create an order for any vendor — stock will decrement like vendor manual orders'
              : 'Create a new order manually for a customer'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {isStaffContext && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Filter by vendor</label>
                <Select
                  value={filterVendorId || 'all'}
                  onValueChange={(v) => setFilterVendorId(v === 'all' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All vendors</SelectItem>
                    {(vendorsData ?? []).map((v: VendorOption) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="customer@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productsData?.docs?.map((product: any) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <>
                {(selectedProduct.variants?.length ?? 0) > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from(
                                new Set(
                                  (selectedProduct.variants ?? [])
                                    .map((v: any) => v.variantData?.size)
                                    .filter(Boolean)
                                ) as Set<string>
                              ).map((size: string) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from(
                                new Set(
                                  (selectedProduct.variants ?? [])
                                    .map((v: any) => v.variantData?.color)
                                    .filter(Boolean)
                                ) as Set<string>
                              ).map((color: string) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="1"
                        value={field.value === 0 ? "" : (field.value?.toString() ?? "")}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || val === "-") {
                            field.onChange(undefined as any);
                            return;
                          }
                          if (/^\d+$/.test(val)) {
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) {
                              field.onChange(num);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val === "" || isNaN(parseInt(val, 10))) {
                            field.onChange(1);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD) *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={field.value === 0 ? "" : (field.value?.toString() ?? "")}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || val === "-") {
                            field.onChange(undefined as any);
                            return;
                          }
                          if (/^\d*\.?\d*$/.test(val)) {
                            const num = parseFloat(val);
                            if (!isNaN(num)) {
                              field.onChange(num);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val === "" || isNaN(parseFloat(val))) {
                            field.onChange(0);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-semibold">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Shipping Address</h3>
              
              <FormField
                control={form.control}
                name="shippingAddress.fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="123 Main St, Apt 4B"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shippingAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="New York"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AL">Alabama</SelectItem>
                          <SelectItem value="AK">Alaska</SelectItem>
                          <SelectItem value="AZ">Arizona</SelectItem>
                          <SelectItem value="AR">Arkansas</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="CO">Colorado</SelectItem>
                          <SelectItem value="CT">Connecticut</SelectItem>
                          <SelectItem value="DE">Delaware</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="GA">Georgia</SelectItem>
                          <SelectItem value="HI">Hawaii</SelectItem>
                          <SelectItem value="ID">Idaho</SelectItem>
                          <SelectItem value="IL">Illinois</SelectItem>
                          <SelectItem value="IN">Indiana</SelectItem>
                          <SelectItem value="IA">Iowa</SelectItem>
                          <SelectItem value="KS">Kansas</SelectItem>
                          <SelectItem value="KY">Kentucky</SelectItem>
                          <SelectItem value="LA">Louisiana</SelectItem>
                          <SelectItem value="ME">Maine</SelectItem>
                          <SelectItem value="MD">Maryland</SelectItem>
                          <SelectItem value="MA">Massachusetts</SelectItem>
                          <SelectItem value="MI">Michigan</SelectItem>
                          <SelectItem value="MN">Minnesota</SelectItem>
                          <SelectItem value="MS">Mississippi</SelectItem>
                          <SelectItem value="MO">Missouri</SelectItem>
                          <SelectItem value="MT">Montana</SelectItem>
                          <SelectItem value="NE">Nebraska</SelectItem>
                          <SelectItem value="NV">Nevada</SelectItem>
                          <SelectItem value="NH">New Hampshire</SelectItem>
                          <SelectItem value="NJ">New Jersey</SelectItem>
                          <SelectItem value="NM">New Mexico</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="NC">North Carolina</SelectItem>
                          <SelectItem value="ND">North Dakota</SelectItem>
                          <SelectItem value="OH">Ohio</SelectItem>
                          <SelectItem value="OK">Oklahoma</SelectItem>
                          <SelectItem value="OR">Oregon</SelectItem>
                          <SelectItem value="PA">Pennsylvania</SelectItem>
                          <SelectItem value="RI">Rhode Island</SelectItem>
                          <SelectItem value="SC">South Carolina</SelectItem>
                          <SelectItem value="SD">South Dakota</SelectItem>
                          <SelectItem value="TN">Tennessee</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="UT">Utah</SelectItem>
                          <SelectItem value="VT">Vermont</SelectItem>
                          <SelectItem value="VA">Virginia</SelectItem>
                          <SelectItem value="WA">Washington</SelectItem>
                          <SelectItem value="WV">West Virginia</SelectItem>
                          <SelectItem value="WI">Wisconsin</SelectItem>
                          <SelectItem value="WY">Wyoming</SelectItem>
                          <SelectItem value="DC">District of Columbia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shippingAddress.zipcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="10001"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingAddress.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(555) 123-4567"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="payment_done">Payment Done</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedProduct(null);
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
