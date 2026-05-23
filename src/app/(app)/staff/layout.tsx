import { requireAppAdmin } from "@/lib/middleware/admin-auth";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";

interface Props {
  children: React.ReactNode;
}

export default async function StaffAdminLayout({ children }: Props) {
  const { user } = await requireAppAdmin("/staff/tasks");

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AdminHeader
          userName={user.name ?? undefined}
          userEmail={user.email ?? undefined}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
