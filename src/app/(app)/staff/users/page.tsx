import { requireAppAdmin } from "@/lib/middleware/admin-auth";
import { isAppAdmin } from "@/lib/access";
import { StaffUsersTable } from "./components/StaffUsersTable";

export default async function StaffUsersPage() {
  const { user } = await requireAppAdmin("/staff/users");

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-600">
          Platform-wide users. Admins can edit accounts and sign in as any user to troubleshoot.
        </p>
      </div>

      <StaffUsersTable canManage={isAppAdmin(user)} />
    </div>
  );
}
