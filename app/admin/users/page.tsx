import { prisma } from "@/lib/prisma";
import UsersManager from "@/components/admin/UsersManager";
import { getRolePermissionConfiguration } from "@/lib/admin-auth";

export default async function AdminUsersPage() {
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
