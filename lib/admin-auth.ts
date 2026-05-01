import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission, Permission, defaultRolePermissions, permissions } from "@/lib/rbac";
import { isDatabaseConnectivityError } from "@/lib/db-health";

type RolePermissionMap = Record<UserRole, Permission[]>;

function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && permissions.includes(value as Permission);
}

async function getRolePermissionMap(): Promise<RolePermissionMap> {
  let setting: { value: unknown } | null = null;

  try {
    setting = await prisma.setting.findUnique({
      where: { key: "rbac.rolePermissions" },
      select: { value: true },
    });
  } catch {
    // Fall back to defaults when DB is unavailable.
    return defaultRolePermissions;
  }

  if (!setting || typeof setting.value !== "object" || setting.value === null) {
    return defaultRolePermissions;
  }

  const raw = setting.value as Record<string, unknown>;
  const permissionsFor = (role: UserRole) => {
    const value = raw[role];
    if (!Array.isArray(value)) {
      return defaultRolePermissions[role];
    }

    const filtered = value.filter(isPermission);
    return filtered.length > 0 ? filtered : defaultRolePermissions[role];
  };

  return {
    SUPER_ADMIN: defaultRolePermissions.SUPER_ADMIN,
    ADMIN: permissionsFor("ADMIN"),
    DISPATCHER: permissionsFor("DISPATCHER"),
    EDITOR: permissionsFor("EDITOR"),
    VIEWER: permissionsFor("VIEWER"),
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

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { ok: false, message: "Database temporarily unavailable. Please retry shortly." },
          { status: 503 }
        ),
      };
    }

    throw error;
  }

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
