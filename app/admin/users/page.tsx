import { prisma } from "@/lib/prisma";
import UsersManager from "@/components/admin/UsersManager";
import { getRolePermissionConfiguration, requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminUsersPage() {
  const auth = await requireAdminPermission("users.view");
  if (!auth.ok) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-black text-[#231F20]">Admin Users</h1>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to view admin users.</p>
      </div>
    );
  }

  const rolePermissions = await getRolePermissionConfiguration();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      permissionOverrides: true,
    },
  });

  return (
    <UsersManager
      rolePermissions={rolePermissions}
      users={users.map((user) => ({
        ...user,
        permissionOverrides: Array.isArray(user.permissionOverrides)
          ? user.permissionOverrides.filter((value): value is string => typeof value === "string")
          : null,
        createdAt: user.createdAt.toISOString(),
      }))}
    />
  );
}
