"use client";

import { trpc } from "@/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { HappyBannerDisplay } from "@/components/happy-banner/HappyBannerDisplay";

type Props = {
  bannerId: string | null;
  onOpenChange: (open: boolean) => void;
};

export function StaffHappyBannerPreviewDialog({ bannerId, onOpenChange }: Props) {
  const { data, isLoading } = trpc.admin.happyBanners.preview.useQuery(
    { id: bannerId ?? "" },
    { enabled: Boolean(bannerId) },
  );

  return (
    <Dialog open={Boolean(bannerId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Banner preview</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : data ? (
            <HappyBannerDisplay banner={data} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
