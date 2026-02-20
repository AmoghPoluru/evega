"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const vendorRegistrationSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
});

type VendorRegistrationFormValues = z.infer<typeof vendorRegistrationSchema>;

interface VendorRegistrationFormProps {
  onSuccess?: () => void;
}

export function VendorRegistrationForm({ onSuccess }: VendorRegistrationFormProps) {
  const queryClient = trpc.useUtils();

  const form = useForm<VendorRegistrationFormValues>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      businessName: "",
      email: "",
      phone: "",
    },
  });

  const register = trpc.vendor.register.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      void queryClient.vendor.getStatus.invalidate();
      void queryClient.auth.session.invalidate();
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: VendorRegistrationFormValues) => {
    register.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Your business or store name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="business@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={register.isPending} className="w-full">
          {register.isPending ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
}
