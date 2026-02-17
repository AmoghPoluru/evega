"use client"

// @ts-expect-error - Next.js link module works at runtime with NodeNext resolution
import Link from "next/link";
// @ts-expect-error - Next.js navigation module works at runtime with NodeNext resolution
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  const isLoggedIn = !!session?.user;

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
