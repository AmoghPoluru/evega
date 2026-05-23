import { z } from 'zod';

export const manualOrderStatusSchema = z.enum([
  'pending',
  'payment_done',
  'processing',
  'complete',
]);

export const manualOrderCreateInputSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  productId: z.string().min(1),
  quantity: z.number().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.number().min(0.01),
  status: manualOrderStatusSchema.default('pending'),
  paymentMethod: z.enum(['stripe', 'offline']).default('offline'),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipcode: z.string().min(1),
    country: z.string().optional().default('United States'),
    phone: z.string().optional(),
  }),
});

export type ManualOrderCreateInput = z.infer<typeof manualOrderCreateInputSchema>;
