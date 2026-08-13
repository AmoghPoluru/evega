"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Images, Loader2, Sparkles, Upload, X } from "lucide-react";
import Link from "next/link";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ACCEPTED = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

async function uploadMediaFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/media", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  let payloadUnknown: unknown;
  try {
    payloadUnknown = await response.json();
  } catch {
    payloadUnknown = null;
  }

  if (!response.ok) {
    const errMsg =
      payloadUnknown &&
      typeof payloadUnknown === "object" &&
      "error" in payloadUnknown &&
      typeof (payloadUnknown as { error: unknown }).error === "string"
        ? (payloadUnknown as { error: string }).error
        : `Upload failed (${response.status})`;
    throw new Error(errMsg);
  }

  const data = payloadUnknown as { doc?: { id?: unknown } } | null;
  const rawId = data?.doc?.id;
  const newId = rawId !== undefined && rawId !== null ? String(rawId) : "";
  if (!newId) {
    throw new Error("Upload succeeded but no media id returned");
  }
  return newId;
}

type ProductAiImportDialogProps = {
  trigger?: React.ReactNode;
};

/**
 * Upload product photos → OpenAI suggests name, description, price → create draft products.
 */
export function ProductAiImportDialog({ trigger }: ProductAiImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    phase?: string;
  } | null>(null);

  const utils = trpc.useUtils();
  const createMutation = trpc.vendor.products.create.useMutation();
  const suggestMutation = trpc.vendor.products.suggestFromImage.useMutation();
  const { data: openAiConfig } = trpc.vendor.dashboard.getOpenAiConfig.useQuery(undefined, {
    enabled: open,
  });

  const reset = useCallback(() => {
    setFiles([]);
    setBusy(false);
    setProgress(null);
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (busy) return;
    setOpen(next);
    if (!next) reset();
  };

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => {
      const byName = new Map(prev.map((f) => [`${f.name}:${f.size}`, f]));
      for (const file of accepted) {
        byName.set(`${file.name}:${file.size}`, file);
      }
      return Array.from(byName.values());
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: true,
    disabled: busy,
  });

  const removeFile = (index: number) => {
    if (busy) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Select at least one photo");
      return;
    }

    if (!openAiConfig?.hasApiKey) {
      toast.error("Add your OpenAI API key on the dashboard first");
      return;
    }

    setBusy(true);
    setProgress({ done: 0, total: files.length, phase: "Starting…" });

    let ok = 0;
    let aiCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const fallbackName = file.name.replace(/\.[^.]+$/, "").trim() || `Product ${i + 1}`;

      try {
        setProgress({
          done: i,
          total: files.length,
          phase: `Uploading ${i + 1}/${files.length}…`,
        });
        const mediaId = await uploadMediaFile(file);

        setProgress({
          done: i,
          total: files.length,
          phase: `AI name, description & price ${i + 1}/${files.length}…`,
        });

        let name = fallbackName;
        let description = "";
        let price = 1;

        try {
          const suggestion = await suggestMutation.mutateAsync({
            mediaId,
            fallbackName,
          });
          name = suggestion.name || fallbackName;
          description = suggestion.description?.trim() ?? "";
          price =
            typeof suggestion.price === "number" &&
            Number.isFinite(suggestion.price) &&
            suggestion.price > 0
              ? suggestion.price
              : 1;
          if (suggestion.usedAi) {
            aiCount += 1;
          } else if (suggestion.skipReason) {
            toast.message(`AI skipped for ${file.name}: ${suggestion.skipReason}`);
          }
        } catch (aiErr: unknown) {
          toast.message(
            `AI skipped for ${file.name}: ${aiErr instanceof Error ? aiErr.message : "error"}`,
          );
        }

        await createMutation.mutateAsync({
          name,
          description: description || undefined,
          price,
          image: mediaId,
          isPrivate: true,
          youtubeUrl: undefined,
        });
        ok += 1;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Failed";
        errors.push(`${file.name}: ${msg}`);
      }

      setProgress({ done: i + 1, total: files.length, phase: "…" });
    }

    void utils.vendor.products.list.invalidate();
    void utils.vendor.dashboard.stats.invalidate();
    setBusy(false);

    if (ok > 0 && errors.length === 0) {
      toast.success(
        `Created ${ok} draft product${ok === 1 ? "" : "s"}` +
          (aiCount > 0 ? ` · AI filled ${aiCount} listing${aiCount === 1 ? "" : "s"}` : ""),
      );
      handleOpenChange(false);
      window.location.href = "/vendor/products?status=draft";
      return;
    }

    if (ok > 0) {
      toast.warning(`Created ${ok} of ${files.length}. Some failed.`);
      errors.slice(0, 3).forEach((entry) => toast.error(entry));
      return;
    }

    toast.error(errors[0] || "Import failed");
  };

  const defaultTrigger = (
    <Button type="button" variant="outline">
      <Sparkles className="mr-2 h-4 w-4" />
      Import using AI
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import using AI</DialogTitle>
          <DialogDescription>
            Upload product photos. OpenAI suggests a name, description, and price for each image,
            then creates draft products in your catalog. Requires an{" "}
            <Link href="/vendor/dashboard" className="text-primary underline-offset-4 hover:underline">
              OpenAI API key
            </Link>{" "}
            saved on your dashboard.
          </DialogDescription>
        </DialogHeader>

        {!openAiConfig?.hasApiKey ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Add your OpenAI API key on the{" "}
            <Link href="/vendor/dashboard" className="font-medium underline-offset-4 hover:underline">
              dashboard
            </Link>{" "}
            before importing with AI.
          </div>
        ) : null}

        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              busy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Drop photos here…"
                : "Drag & drop photos here, or click to select"}
            </p>
            <p className="mt-1 text-xs text-gray-500">JPEG, PNG, or WebP · one product per photo</p>
          </div>

          {files.length > 0 ? (
            <ul className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                >
                  <span className="flex min-w-0 items-center gap-2 truncate text-gray-800">
                    <Images className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {file.name}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 shrink-0 p-0"
                    disabled={busy}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(index);
                    }}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}

          {progress ? (
            <p className="text-sm text-gray-600">
              {progress.phase} ({progress.done}/{progress.total})
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleUpload()}
            disabled={files.length === 0 || busy || !openAiConfig?.hasApiKey}
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Working…
              </>
            ) : (
              "Import products"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
