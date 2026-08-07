"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Poppins } from "next/font/google"
import { vendorNavLabels } from "@/lib/vendor-portal-labels";
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react";
import NavbarSidebar from "./navbar-sidebar";
import { StorefrontNavbarLogo } from "./StorefrontNavbarLogo";
import { Menu, Heart } from "lucide-react";
import { trpc } from "@/trpc/client";
import { CheckoutButton } from "@/modules/checkout/ui/components/checkout-button";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { isAppStaff, getUserRole, hasVendor } from "@/lib/access";
import type { User } from "@/payload-types";

const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
})

export function Navbar() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { data: session } = trpc.auth.session.useQuery()
  
  useEffect(() => {
    const { useCartStore } = require("@/modules/checkout/store/use-cart-store");
    const currentUserId = session?.user?.id;
    const cartUserId = useCartStore.getState().userId;
    
    if (!currentUserId && cartUserId) {
      useCartStore.getState().clearCart();
    } else if (currentUserId && currentUserId !== cartUserId) {
      useCartStore.getState().setUserId(currentUserId);
    } else if (currentUserId && !cartUserId) {
      useCartStore.getState().setUserId(currentUserId);
    }
  }, [session?.user?.id]);

  const isLoggedIn = !!session?.user
  const sessionUser = session?.user as User | undefined
  const isAdmin = !!sessionUser && isAppStaff(sessionUser)
  const canSeeVendorDashboard =
    !!sessionUser &&
    (isAppStaff(sessionUser) ||
      hasVendor(sessionUser) ||
      getUserRole(sessionUser) === "vendor")

  if (pathname === "/vendor" || (pathname?.startsWith("/vendor/") && !pathname?.startsWith("/vendors/"))) {
    return null
  }

  if (pathname?.startsWith("/staff/")) {
    return null
  }

  return (
    <>
      <nav className={`h-20 flex border-b border-gray-700 justify-between font-medium bg-black items-center px-4 ${poppins.className}`}>
        <StorefrontNavbarLogo />

        <NavbarSidebar
          items={[]}
          open={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
        />

        <div className="hidden lg:flex items-center gap-2">
          {canSeeVendorDashboard && (
            <Button
              asChild
              variant="outline"
              className="border-gray-600 text-white bg-transparent hover:bg-gray-800 hover:text-white"
            >
              <Link href="/vendor/dashboard">
                {vendorNavLabels.dashboard}
              </Link>
            </Button>
          )}
          {isAdmin && (
            <Button
              asChild
              variant="outline"
              className="border-gray-600 text-white bg-transparent hover:bg-gray-800 hover:text-white"
            >
              <Link href="/staff/digital-marketing">
                Admin Console
              </Link>
            </Button>
          )}

          {isLoggedIn && (
            <Button
              asChild
              variant="ghost"
              className="text-white hover:bg-gray-800 hover:text-white"
            >
              <Link href="/favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                My Favorites
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
          {canSeeVendorDashboard && (
            <Button
              asChild
              variant="outline"
              className="border-gray-600 text-white bg-transparent hover:bg-gray-800 hover:text-white px-3 py-2 text-xs"
            >
              <Link href="/vendor/dashboard">
                My Dashboard
              </Link>
            </Button>
          )}
          {isAdmin && (
            <Button
              asChild
              variant="outline"
              className="border-gray-600 text-white bg-transparent hover:bg-gray-800 hover:text-white px-3 py-2 text-xs"
            >
              <Link href="/staff/digital-marketing">
                Admin
              </Link>
            </Button>
          )}

          {isLoggedIn && (
            <Button
              asChild
              variant="ghost"
              className="size-12 border-transparent bg-transparent hover:bg-gray-800 text-white"
            >
              <Link href="/favorites" aria-label="My Favorites">
                <Heart size={22} />
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
    </>
  )
}
