import { redirect } from "next/navigation";
import { requireVendor } from "@/lib/middleware/vendor-auth";
import { VendorSidebar } from "./components/VendorSidebar";
import { VendorHeader } from "./components/VendorHeader";

interface Props {
  children: React.ReactNode;
}

export default async function VendorLayout({ children }: Props) {
  // This will redirect if not authenticated or vendor not approved
  const { user, vendor } = await requireVendor();

  return (
    <div className="flex h-screen overflow-hidden">
      <VendorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorHeader
          vendorName={vendor.name}
          userName={user.name || undefined}
          userEmail={user.email || undefined}
        />
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
