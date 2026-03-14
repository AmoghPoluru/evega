"use client"

import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
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
import { ProfileDropdown } from "@/components/profile-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Store, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
})

export function Navbar() {
  // Call all hooks unconditionally first
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [vendorSearchQuery, setVendorSearchQuery] = useState("")
  const { data: session } = trpc.auth.session.useQuery()
  const { data: categoriesData } = trpc.categories.useQuery()
  const { data: vendorsData } = trpc.vendor.list.useQuery({ limit: 50 })
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
  const isLoggedIn = !!session?.user
  const isAdmin =
    !!session?.user &&
    (
      (Array.isArray((session.user as any).roles) && (session.user as any).roles.includes("super-admin")) ||
      (session.user as any).appRole
    )
  const canSeeVendorDashboard =
    !!session?.user &&
    (
      // Has vendor relationship
      !!(session.user as any).vendor ||
      // Or has appRole / legacy super-admin role
      (Array.isArray((session.user as any).roles) && (session.user as any).roles.includes("super-admin")) ||
      (session.user as any).appRole
    )

  // Hide navbar on vendor dashboard pages only (not vendor public pages)
  // Vendor dashboard: /vendor/* (singular)
  // Vendor public pages: /vendors/* (plural) - should show navbar
  if (pathname?.startsWith("/vendor/") && !pathname?.startsWith("/vendors/")) {
    return null
  }

  const handleLogout = () => {
    logout.mutate();
  };

  // Filter vendors based on search query
  const filteredVendors = vendorsData?.vendors.filter((vendor: any) => {
    if (!vendorSearchQuery.trim()) return true;
    const query = vendorSearchQuery.toLowerCase();
    return vendor.name.toLowerCase().includes(query);
  }) || [];

  return (
    <>
      <nav className={`h-20 flex border-b border-gray-700 justify-between font-medium bg-black items-center px-4 ${poppins.className}`}>
        <div className="flex items-center gap-4">
          <Logo />
          {/* Vendors Dropdown */}
          {vendorsData && vendorsData.vendors.length > 0 && (
            <DropdownMenu
              onOpenChange={(open) => {
                if (!open) {
                  setVendorSearchQuery("");
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-gray-800 hover:text-white border-0"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Vendors
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 max-h-[400px] bg-white">
                {/* Search Input */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search vendors..."
                      value={vendorSearchQuery}
                      onChange={(e) => setVendorSearchQuery(e.target.value)}
                      className="pl-8 pr-8 h-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    {vendorSearchQuery && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVendorSearchQuery("");
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Vendor List */}
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredVendors.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {vendorSearchQuery ? "No vendors found" : "No vendors available"}
                    </div>
                  ) : (
                    filteredVendors.map((vendor: any) => (
                      <DropdownMenuItem key={vendor.id} asChild>
                        <Link
                          href={`/vendors/${vendor.slug || vendor.id}`}
                          className="cursor-pointer"
                          onClick={() => setVendorSearchQuery("")}
                        >
                          {vendor.name}
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
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
        {/* Vendor Dashboard button (only if user is a vendor / admin) */}
        {canSeeVendorDashboard && (
          <Button
            asChild
            variant="outline"
            className="border-gray-600 text-white bg-transparent hover:bg-gray-800 hover:text-white"
          >
            <Link href="/vendor/dashboard">
              Vendor Dashboard
            </Link>
          </Button>
        )}
        {/* Admin Tasks / Dashboard button (only for admins) */}
        {isAdmin && (
          <Button
            asChild
            variant="outline"
            className="border-gray-600 text-white bg-transparent hover:bg-gray-800 hover:text-white"
          >
            <Link href="/admin-tasks">
              Admin Dashboard
            </Link>
          </Button>
        )}

        <CheckoutButton hideIfEmpty={false} />
        {isLoggedIn ? (
          <ProfileDropdown />
        ) : (
          <Button
            asChild
            variant="secondary"
            className="border-l border-gray-700 border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-transparent hover:bg-gray-800 transition-colors text-lg text-white"
          >
            <Link href="/sign-in">
              Log in
            </Link>
          </Button>
        )}
      </div>

      <div className="flex lg:hidden items-center gap-2">
        {/* Vendor Dashboard button (mobile) */}
        {canSeeVendorDashboard && (
          <Button
            asChild
            variant="outline"
            className="border-gray-600 text-white bg-transparent hover:bg-gray-800 hover:text-white px-3 py-2 text-xs"
          >
            <Link href="/vendor/dashboard">
              Vendor
            </Link>
          </Button>
        )}
        {/* Admin Dashboard button (mobile) */}
        {isAdmin && (
          <Button
            asChild
            variant="outline"
            className="border-gray-600 text-white bg-transparent hover:bg-gray-800 hover:text-white px-3 py-2 text-xs"
          >
            <Link href="/admin-tasks">
              Admin
            </Link>
          </Button>
        )}

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
