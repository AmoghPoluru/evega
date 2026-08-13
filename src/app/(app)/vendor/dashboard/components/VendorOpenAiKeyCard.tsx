"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const openAiKeyFormSchema = z.object({
  apiKey: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === "") return true;
        return value.trim().startsWith("sk-");
      },
      { message: "OpenAI API keys usually start with sk-" },
    ),
});

type OpenAiKeyFormValues = z.infer<typeof openAiKeyFormSchema>;

export function VendorOpenAiKeyCard() {
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.vendor.dashboard.getOpenAiConfig.useQuery();

  const updateMutation = trpc.vendor.dashboard.updateOpenAiConfig.useMutation({
    onSuccess: (result) => {
      setHasSavedKey(result.hasApiKey);
      form.reset({ apiKey: "" });
      toast.success(result.hasApiKey ? "OpenAI key saved" : "OpenAI key updated");
      void utils.vendor.dashboard.getOpenAiConfig.invalidate();
    },
    onError: (saveError) => {
      toast.error(saveError.message || "Failed to save OpenAI key");
    },
  });

  const form = useForm<OpenAiKeyFormValues>({
    resolver: zodResolver(openAiKeyFormSchema),
    defaultValues: { apiKey: "" },
  });

  useEffect(() => {
    if (data) {
      setHasSavedKey(data.hasApiKey);
    }
  }, [data]);

  const onSubmit = (values: OpenAiKeyFormValues) => {
    const trimmed = values.apiKey?.trim() ?? "";
    if (!trimmed && !hasSavedKey) {
      form.setError("apiKey", { message: "Enter your OpenAI API key" });
      return;
    }

    updateMutation.mutate({ apiKey: trimmed || undefined });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OpenAI</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          Failed to load OpenAI settings: {error.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">OpenAI</CardTitle>
          {hasSavedKey ? <Badge variant="secondary">Key saved</Badge> : null}
        </div>
        <CardDescription>
          Connect your OpenAI API key to power AI features for your store. Your key is stored
          securely and never shown after saving.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="off"
                      placeholder={
                        hasSavedKey
                          ? "•••••••• (leave blank to keep current)"
                          : "sk-..."
                      }
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Get a key from{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      platform.openai.com
                    </a>
                    .
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save key"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
