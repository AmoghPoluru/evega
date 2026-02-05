"use client"

import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import NavbarSidebar from "./navbar-sidebar";
import Logo from "./Logo";
import { Menu } from "lucide-react";
import { trpc } from "@/trpc/client";
import { CheckoutButton } from "@/modules/checkout/ui/components/checkout-button";
import { SearchInput } from "../search-filter/search-input";
import { Categories } from "../search-filter/categories";

const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
})

export function Navbar() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { data: session } = trpc.auth.session.useQuery()
  const { data: categoriesData } = trpc.categories.useQuery()
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
    <>
      <nav className={`h-20 flex border-b border-gray-700 justify-between font-medium bg-black items-center px-4 ${poppins.className}`}>
        <Logo />
        <div className="flex-1 flex justify-center items-center px-4 max-w-2xl">
          {categoriesData && (
            <div className="w-full bg-white rounded-xl shadow-xl p-1">
              <SearchInput categories={categoriesData as any} />
            </div>
          )}
        </div>
        <NavbarSidebar
          items={[]}
          open={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
        />

      
      <div className="hidden lg:flex items-center gap-2">
        <CheckoutButton hideIfEmpty={false} />
        {isLoggedIn ? (
          <Button
            onClick={handleLogout}
            disabled={logout.isPending}
            variant="secondary"
            className="border-l border-gray-700 border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-transparent hover:bg-gray-800 transition-colors text-lg text-white"
          >
            {logout.isPending ? "Logging out..." : "Log out"}
          </Button>
        ) : (
          <>
            <Button
              asChild
              variant="secondary"
              className="border-l border-gray-700 border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-transparent hover:bg-gray-800 transition-colors text-lg text-white"
            >
              <Link href="/sign-in">
                Log in
              </Link>
            </Button>
          </>
        )}
      </div>

      <div className="flex lg:hidden items-center gap-2">
        <CheckoutButton hideIfEmpty={false} />
        <Button
          variant="ghost"
          className="size-12 border-transparent bg-transparent hover:bg-gray-800 text-white"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </Button>
      </div>
    </nav>
    {categoriesData && (
      <div className="bg-[#F5F5F5] border-b px-4 lg:px-12 py-4">
        <Categories data={categoriesData as any} />
      </div>
    )}
    </>
  )
}
