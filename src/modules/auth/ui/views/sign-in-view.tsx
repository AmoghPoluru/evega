"use client";

import z from "zod";
// @ts-expect-error - Next.js link module works at runtime with NodeNext resolution
import Link from "next/link";
// @ts-expect-error - Next.js font module works at runtime with NodeNext resolution
import { Poppins } from "next/font/google";
import { useForm } from "react-hook-form";
// @ts-expect-error - Next.js navigation module works at runtime with NodeNext resolution
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { loginSchema } from "../../schemas";
import { SocialLoginButtons } from "../components/social-login-buttons";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const SignInView = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = trpc.auth.login.useMutation({
    onError: (error) => {
      const message = error.message || "Invalid email or password";
      setErrorMessage(message);
    },
    onSuccess: async () => {
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: [['auth', 'session']] });
      router.push("/");
    },
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    mode: "all",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setErrorMessage(null);
    login.mutate(values)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8 p-4 lg:p-16"
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <span className={cn("text-2xl font-semibold", poppins.className)}>
                  Evega
                </span>
              </Link>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-base border-none underline"
              >
                <Link prefetch href="/sign-up">
                  Sign up
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl font-medium">
              Welcome back to Evega.
            </h1>
            {errorMessage && (
              <Alert variant="destructive" className="bg-red-500 text-white border-red-600">
                <AlertDescription className="text-white font-medium">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={login.isPending}
              type="submit"
              size="lg"
              className="bg-black text-white hover:bg-pink-400 hover:text-primary"
            >
              Log in
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F4F4F0] px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <SocialLoginButtons />
          </form>
        </Form>
      </div>
      <div
        className="h-screen w-full lg:col-span-2 hidden lg:block"
        style={{ 
          backgroundImage: "url('/auth-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
         }}
      />
    </div>
  );
};
