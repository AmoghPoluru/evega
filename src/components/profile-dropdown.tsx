"use client";

import { Store, MapPin, LogOut, Settings, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ProfileDropdown() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = trpc.auth.session.useQuery();
  const { data: vendorStatus, isLoading: isLoadingVendorStatus } = trpc.vendor.getStatus.useQuery(undefined, {
    enabled: !!session?.user,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds to check for approval status changes
  });

  // Show "Become vendor" ONLY if user has NO vendor at all
  // Hide button if user has ANY vendor (pending, approved, rejected, suspended)
  // Approved vendors should see "Vendor Dashboard" link instead (to be added)
  const hasAnyVendor = Boolean(vendorStatus?.hasVendor);
  const isApprovedVendor = Boolean(
    vendorStatus?.hasVendor && 
    vendorStatus?.status === "approved" && 
    vendorStatus?.isActive === true
  );
  
  const showBecomeVendor = Boolean(
    session?.user && 
    !hasAnyVendor && // Only show if user has NO vendor
    !isLoadingVendorStatus &&
    vendorStatus !== undefined // Only show/hide when we have vendor status data
  );
  
  const showVendorDashboard = Boolean(
    session?.user &&
    isApprovedVendor &&
    !isLoadingVendorStatus
  );

  const logout = trpc.auth.logout.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [["auth", "session"]] });
      router.push("/");
      toast.success("Logged out successfully");
    },
  });

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-10 rounded-full border-2 border-gray-600 hover:border-orange-500 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-700 text-white text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || "User"}
            </p>
            <p className="text-xs leading-none text-gray-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/account?tab=addresses"
            className="flex items-center cursor-pointer"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Shipping Addresses
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders" className="flex items-center cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            My Orders
          </Link>
        </DropdownMenuItem>
        {showVendorDashboard && (
          <DropdownMenuItem asChild>
            <Link href="/vendor/dashboard" className="flex items-center cursor-pointer">
              <Store className="mr-2 h-4 w-4" />
              Vendor Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        {showBecomeVendor && (
          <DropdownMenuItem asChild>
            <Link href="/become-vendor" className="flex items-center cursor-pointer">
              <Store className="mr-2 h-4 w-4" />
              Become Vendor
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logout.isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
