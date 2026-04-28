import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission, Permission, defaultRolePermissions, permissions } from "@/lib/rbac";

type RolePermissionMap = Record<UserRole, Permission[]>;

function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && permissions.includes(value as Permission);
}

async function getRolePermissionMap(): Promise<RolePermissionMap> {
  const setting = await prisma.setting.findUnique({
    where: { key: "rbac.rolePermissions" },
    select: { value: true },
  });

  if (!setting || typeof setting.value !== "object" || setting.value === null) {
    return defaultRolePermissions;
  }

  const raw = setting.value as Record<string, unknown>;

  return {
    SUPER_ADMIN: Array.isArray(raw.SUPER_ADMIN)
      ? raw.SUPER_ADMIN.filter(isPermission)
      : defaultRolePermissions.SUPER_ADMIN,
    ADMIN: Array.isArray(raw.ADMIN) ? raw.ADMIN.filter(isPermission) : defaultRolePermissions.ADMIN,
    DISPATCHER: Array.isArray(raw.DISPATCHER)
      ? raw.DISPATCHER.filter(isPermission)
      : defaultRolePermissions.DISPATCHER,
    EDITOR: Array.isArray(raw.EDITOR) ? raw.EDITOR.filter(isPermission) : defaultRolePermissions.EDITOR,
    VIEWER: Array.isArray(raw.VIEWER) ? raw.VIEWER.filter(isPermission) : defaultRolePermissions.VIEWER,
  };
}

export async function requireAdminPermission(permission: Permission) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || !user.isActive) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }),
    };
  }

  const rolePermissionMap = await getRolePermissionMap();

  if (!hasPermission(user.role, permission, user.permissionOverrides, rolePermissionMap)) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    user,
  };
}

export async function getEffectivePermissionsForUser(user: {
  role: UserRole;
  permissionOverrides: unknown;
}) {
  const rolePermissionMap = await getRolePermissionMap();
  return permissions.filter((permission) =>
    hasPermission(user.role, permission, user.permissionOverrides, rolePermissionMap)
  );
}

export async function getRolePermissionConfiguration() {
  return getRolePermissionMap();
}
