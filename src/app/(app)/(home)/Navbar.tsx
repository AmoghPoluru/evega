"use client"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// @ts-expect-error - Next.js font module works at runtime with NodeNext resolution
import { Poppins } from "next/font/google"
// @ts-expect-error - Next.js link module works at runtime with NodeNext resolution
import Link from "next/link"
// @ts-expect-error - Next.js navigation module works at runtime with NodeNext resolution
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import NavbarSidebar from "./navbar-sidebar";
import { Menu } from "lucide-react";
import { trpc } from "@/trpc/client";
import { CheckoutButton } from "@/modules/checkout/ui/components/checkout-button";

const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
})

interface NavbarItemProps {
    href: string;
    children: React.ReactNode;
    isActive?: boolean;
  };
  
  const NavbarItem = ({
    href,
    children,
    isActive,
  }: NavbarItemProps) => {
    return (
      <Button
        asChild
        variant="outline"
        className={cn(
          "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg",
          isActive && "bg-black text-white hover:bg-black hover:text-white",
        )}
      >
        <Link href={href}>
          {children}
        </Link>
      </Button>
    );
  };
  
  const navbarItems = [
    { href: "/", children: "Home" },
    { href: "/about", children: "About" },
    { href: "/features", children: "Features" },
    { href: "/pricing", children: "Pricing" },
    { href: "/contact", children: "Contact" },
  ];
  


export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { data: session } = trpc.auth.session.useQuery()
  const isLoggedIn = !!session?.user

  const logout = trpc.auth.logout.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [['auth', 'session']] });
      router.push("/");
      toast.success("Logged out successfully");
    },
  });

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <nav className={`h-20 flex border-b justify-between font-medium bg-white items-start px-4 ${poppins.className}`}>
      <Link href="/">
        <span className={`text-5xl font-semibold ${poppins.className}`}>e-Shop</span>
      </Link>
      <div className="items-center gap-4 hidden lg:flex justify-center flex-1">
        {navbarItems.map((item) => (
          <NavbarItem
            key={item.href}
            href={item.href}
            isActive={pathname === item.href}
          >
            {item.children}
          </NavbarItem>
        ))}
      </div>

      <NavbarSidebar
        items={navbarItems}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />

      
      <div className="hidden lg:flex items-center gap-2">
        <CheckoutButton hideIfEmpty={false} />
        {isLoggedIn ? (
          <>
            <Button
              asChild
              variant="secondary"
              className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-colors text-lg"
            >
              <Link href="/admin">
                Admin Dashboard
              </Link>
            </Button>
            <Button
              onClick={handleLogout}
              disabled={logout.isPending}
              variant="secondary"
              className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-colors text-lg"
            >
              {logout.isPending ? "Logging out..." : "Log out"}
            </Button>
          </>
        ) : (
          <>
            <Button
              asChild
              variant="secondary"
              className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-colors text-lg"
            >
              <Link href="/sign-in">
                Log in
              </Link>
            </Button>
            <Button
              asChild
              className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-black text-white hover:bg-pink-400 hover:text-black transition-colors text-lg"
            >
              <Link href="/sign-up">
                Start selling
              </Link>
            </Button>
          </>
        )}
      </div>

      <div className="flex lg:hidden items-center gap-2">
        <CheckoutButton hideIfEmpty={false} />
        <Button
          variant="ghost"
          className="size-12 border-transparent bg-white"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </Button>
      </div>
    </nav>
  )
}
