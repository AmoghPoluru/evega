"use client";

import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";

export function ImpersonationBanner() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data } = trpc.admin.users.impersonationStatus.useQuery();

  const stopImpersonating = trpc.admin.users.stopImpersonating.useMutation({
    onSuccess: async () => {
      await utils.auth.session.invalidate();
      await utils.admin.users.impersonationStatus.invalidate();
      router.push("/staff/users");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to return to your admin session");
    },
  });

  if (!data?.impersonating) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-black shadow-lg">
      <ShieldAlert className="h-4 w-4" />
      <span>Viewing as another user</span>
      <button
        type="button"
        className="rounded-md bg-black px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
        disabled={stopImpersonating.isPending}
        onClick={() => stopImpersonating.mutate()}
      >
        {stopImpersonating.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          "Return to admin"
        )}
      </button>
    </div>
  );
}
