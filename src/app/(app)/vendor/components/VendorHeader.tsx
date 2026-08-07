"use client";

import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { getTimeOfDayGreeting } from "@/lib/vendor-greeting";
import { VendorStoreLogo } from "@/components/vendor-logo/VendorStoreLogo";

interface VendorHeaderProps {
  vendorName?: string;
  vendorLogoUrl?: string;
  userName?: string;
  userEmail?: string;
  hasUnreadNotifications?: boolean;
}

export function VendorHeader({
  vendorName,
  vendorLogoUrl,
  userName,
  userEmail,
  hasUnreadNotifications = false,
}: VendorHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail?.[0]?.toUpperCase() || "U";

  const greeting = getTimeOfDayGreeting();
  const { data: logoData } = trpc.vendor.logoTemplate.get.useQuery();

  const showLogo =
    (logoData?.logoSource === "template" && logoData?.preview) ||
    (logoData?.logoSource !== "template" && vendorLogoUrl);

  return (
    <header className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-6">
      {/* Left side - Logo */}
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          {showLogo ? (
            <VendorStoreLogo
              vendorName={vendorName ?? "Store"}
              uploadUrl={logoData?.logoSource === "template" ? null : vendorLogoUrl}
              templateLogo={logoData?.logoSource === "template" ? logoData.preview : null}
              size={36}
              showFallbackInitial={false}
            />
          ) : null}
          <div className="min-w-0">
            <span className="text-sidebar-foreground font-semibold text-lg truncate block">
              {vendorName || "My Store"}
            </span>
            <span className="text-xs text-muted-foreground truncate block">
              {greeting}
              {userName ? `, ${userName.split(" ")[0]}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Notifications and User Menu */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          aria-label="Notifications"
          onClick={() => router.push("/vendor/notifications")}
        >
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userName || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                My Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logout.isPending ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
