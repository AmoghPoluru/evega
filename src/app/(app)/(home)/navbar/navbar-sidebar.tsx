"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Store } from "lucide-react";
import { trpc } from "@/trpc/client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavbarItem {
  href: string;
  children: React.ReactNode;
}

interface Props {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NavbarSidebar({
  items,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = trpc.auth.session.useQuery();
  const { data: vendorStatus, isLoading: isLoadingVendorStatus } = trpc.vendor.getStatus.useQuery(undefined, {
    enabled: !!session?.user,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds to check for approval status changes
  });
  const isLoggedIn = !!session?.user;

  // Show "Become vendor" ONLY if user has NO vendor at all
  // Hide button if user has ANY vendor (pending, approved, rejected, suspended)
  const hasAnyVendor = Boolean(vendorStatus?.hasVendor);
  const isApprovedVendor = Boolean(
    vendorStatus?.hasVendor && 
    vendorStatus?.status === "approved" && 
    vendorStatus?.isActive === true
  );
  
  const showBecomeVendor = Boolean(
    isLoggedIn && 
    !hasAnyVendor && // Only show if user has NO vendor
    !isLoadingVendorStatus &&
    vendorStatus !== undefined
  );
  
  const showVendorDashboard = Boolean(
    isLoggedIn &&
    isApprovedVendor &&
    !isLoadingVendorStatus
  );

  const logout = trpc.auth.logout.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [['auth', 'session']] });
      onOpenChange(false);
      router.push("/");
      toast.success("Logged out successfully");
    },
  });

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="p-0 transition-none"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            Menu
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              onClick={() => onOpenChange(false)}
            >
              {item.children}
            </Link>
          ))}
          <div className="border-t">
            {isLoggedIn ? (
              <>
                <Link 
                  onClick={() => onOpenChange(false)} 
                  href="/account" 
                  className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                >
                  My Account
                </Link>
                <Link 
                  onClick={() => onOpenChange(false)} 
                  href="/orders" 
                  className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                >
                  My Orders
                </Link>
                {showVendorDashboard && (
                  <Link 
                    onClick={() => onOpenChange(false)} 
                    href="/vendor/dashboard" 
                    className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium gap-2"
                  >
                    <Store className="h-4 w-4" />
                    Vendor Dashboard
                  </Link>
                )}
                {showBecomeVendor && (
                  <Link 
                    onClick={() => onOpenChange(false)} 
                    href="/become-vendor" 
                    className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium gap-2"
                  >
                    <Store className="h-4 w-4" />
                    Become Vendor
                  </Link>
                )}
                <Link 
                  onClick={() => onOpenChange(false)} 
                  href="/admin" 
                  className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium disabled:opacity-50"
                >
                  {logout.isPending ? "Logging out..." : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link 
                  onClick={() => onOpenChange(false)} href="/sign-in" className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium">
                  Log in
                </Link>
                <Link 
                  onClick={() => onOpenChange(false)} href="/sign-up" className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium">
                  Start selling
                </Link>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
