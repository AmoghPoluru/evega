"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
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

interface AdminHeaderProps {
  userName?: string;
  userEmail?: string;
}

export function AdminHeader({ userName, userEmail }: AdminHeaderProps) {
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
    : userEmail?.[0]?.toUpperCase() || "A";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-700 bg-gray-800 px-6">
      <p className="text-sm font-medium text-gray-200">Platform administration</p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-600 text-xs font-medium text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName || "Staff"}</p>
              <p className="text-xs leading-none text-gray-500">{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/account" className="flex cursor-pointer items-center">
              <User className="mr-2 h-4 w-4" />
              My Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logout.isPending ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
